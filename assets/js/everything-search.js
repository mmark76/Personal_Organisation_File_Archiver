/* Optional local Everything companion search panel. */

window.EverythingSearch = (() => {
  const defaultApiBaseUrl = "http://127.0.0.1:51337";
  const defaultLimit = 20;
  const maximumLimit = 50;
  const maximumQueryLength = 256;
  const sessionHeaderName = "X-Everything-Session";
  const sessionExpiresHeaderName = "X-Everything-Session-Expires";
  const sessionExpirySkewMs = 30_000;
  let activeRequestController = null;
  let sessionToken = null;
  let sessionExpiresAt = 0;

  function getApiBaseUrl() {
    return String(window.EverythingSearchConfig?.baseUrl || defaultApiBaseUrl).replace(/\/+$/, "");
  }

  function getServiceLocationLabel() {
    try {
      return new URL(getApiBaseUrl()).host;
    } catch {
      return "127.0.0.1:51337";
    }
  }

  function getPanelElements() {
    return {
      panel: document.getElementById("everythingSearchPanel"),
      form: document.getElementById("everythingSearchForm"),
      input: document.getElementById("everythingSearchInput"),
      typeSelect: document.getElementById("everythingSearchTypeSelect"),
      limitInput: document.getElementById("everythingSearchLimitInput"),
      button: document.getElementById("everythingSearchButton"),
      status: document.getElementById("everythingSearchStatus"),
      results: document.getElementById("everythingSearchResults")
    };
  }

  function normalizeQuery(value) {
    const query = String(value || "").trim();

    if (!query) {
      throw new Error("Enter a search term.");
    }

    if (query.length > maximumQueryLength) {
      throw new Error(`Search terms must be ${maximumQueryLength} characters or fewer.`);
    }

    if (query.startsWith("-") || query.startsWith("/")) {
      throw new Error("Search terms cannot start with a command-style prefix.");
    }

    if (/[\u0000-\u001F\u007F]/.test(query)) {
      throw new Error("Search terms cannot contain control characters.");
    }

    return query;
  }

  function normalizeType(value) {
    const normalized = String(value || "all").trim().toLowerCase();

    if (["", "all", "file", "folder"].includes(normalized)) {
      return normalized || "all";
    }

    return "all";
  }

  function normalizeLimit(value) {
    const requestedLimit = Number.parseInt(value, 10);

    if (!Number.isFinite(requestedLimit)) {
      return defaultLimit;
    }

    if (requestedLimit <= 0) {
      return 1;
    }

    return Math.min(requestedLimit, maximumLimit);
  }

  function buildSearchUrl(query, type, limit) {
    const url = new URL("/api/search", getApiBaseUrl());
    url.searchParams.set("q", normalizeQuery(query));
    url.searchParams.set("type", normalizeType(type));
    url.searchParams.set("limit", String(normalizeLimit(limit)));
    return url;
  }

  function clearSession() {
    sessionToken = null;
    sessionExpiresAt = 0;
  }

  function storeSessionFromResponse(response) {
    const token = response?.headers?.get?.(sessionHeaderName);
    const expiresValue = response?.headers?.get?.(sessionExpiresHeaderName);
    const parsedExpiry = Date.parse(expiresValue || "");

    if (!token || !Number.isFinite(parsedExpiry)) {
      return false;
    }

    sessionToken = token;
    sessionExpiresAt = parsedExpiry;
    return true;
  }

  function getUsableSessionToken() {
    if (!sessionToken || sessionExpiresAt <= Date.now() + sessionExpirySkewMs) {
      clearSession();
      return null;
    }

    return sessionToken;
  }

  function setButtonState(isBusy) {
    const { button } = getPanelElements();
    if (button) {
      button.disabled = isBusy;
      button.textContent = isBusy ? "Searching..." : "Search";
    }
  }

  function setStatus(message, tone = "idle") {
    const { status } = getPanelElements();
    if (!status) return;

    status.textContent = message;
    status.dataset.statusTone = tone;
    status.classList.remove("status-idle", "status-loading", "status-success", "status-error");
    status.classList.add(`status-${tone}`);
  }

  function clearResults() {
    const { results } = getPanelElements();
    if (results) {
      results.innerHTML = "";
    }
  }

  function renderResults(results, query, type) {
    const { results: resultsBox } = getPanelElements();
    if (!resultsBox) return;

    if (!results.length) {
      resultsBox.innerHTML = "<p class=\"everything-search-empty\">No matching files or folders were found.</p>";
      return;
    }

    const items = results.map(result => `
      <article class="everything-search-result">
        <strong>${window.AppUtils.escapeHtml(result.name)}</strong>
        <span>${window.AppUtils.escapeHtml(result.kind)}</span>
        <code>${window.AppUtils.escapeHtml(result.path)}</code>
      </article>
    `).join("");

    resultsBox.innerHTML = `
      <div class="everything-search-results-meta">
        ${window.AppUtils.escapeHtml(results.length)} result(s) for ${window.AppUtils.escapeHtml(query)} (${window.AppUtils.escapeHtml(type)}).
      </div>
      <div class="everything-search-results-list">${items}</div>
    `;
  }

  async function fetchHealth() {
    const { panel } = getPanelElements();
    if (!panel) return null;

    try {
      const response = await fetch(new URL("/api/health", getApiBaseUrl()), {
        headers: { Accept: "application/json" }
      });

      if (!response.ok) {
        throw new Error("Everything is not responding yet.");
      }

      storeSessionFromResponse(response);
      const payload = await response.json();
      if (payload?.everythingAvailable) {
        setStatus(`Everything is ready through ${payload.backend}.`, "success");
      } else {
        setStatus("Everything companion service is running, but Everything is not ready yet.", "idle");
      }

      return payload;
    } catch (error) {
      clearSession();
      setStatus(`Everything companion service is not available on ${getServiceLocationLabel()} yet.`, "error");
      return null;
    }
  }

  async function fetchSearchResponse(url, signal, allowRefresh = true) {
    let token = getUsableSessionToken();
    if (!token) {
      await fetchHealth();
      token = getUsableSessionToken();
    }

    const headers = { Accept: "application/json" };
    if (token) {
      headers[sessionHeaderName] = token;
    }

    const response = await fetch(url, { signal, headers });

    if (response.status === 401 && allowRefresh) {
      clearSession();
      await fetchHealth();
      return fetchSearchResponse(url, signal, false);
    }

    return response;
  }

  async function search(event) {
    event?.preventDefault?.();

    const { input, typeSelect, limitInput } = getPanelElements();
    if (!input || !typeSelect || !limitInput) return null;

    let query;
    try {
      query = normalizeQuery(input.value);
    } catch (error) {
      setStatus(error.message || "Enter a search term.", "error");
      clearResults();
      return null;
    }

    if (activeRequestController) {
      activeRequestController.abort();
    }

    const requestController = new AbortController();
    activeRequestController = requestController;

    setButtonState(true);
    setStatus("Searching Everything on this PC...", "loading");
    clearResults();

    try {
      const response = await fetchSearchResponse(
        buildSearchUrl(query, typeSelect.value, limitInput.value),
        requestController.signal
      );

      if (!response.ok) {
        let detail = "Everything could not complete the search.";

        try {
          const problem = await response.json();
          if (problem?.detail) detail = problem.detail;
        } catch {
          // Keep the default message.
        }

        throw new Error(detail);
      }

      const payload = await response.json();
      const results = Array.isArray(payload?.results) ? payload.results : [];
      renderResults(results, query, normalizeType(typeSelect.value));
      setStatus(`Everything found ${results.length} local result(s).`, "success");
      return payload;
    } catch (error) {
      if (error?.name === "AbortError") {
        return null;
      }

      setStatus(error?.message || "Everything search failed.", "error");
      clearResults();
      return null;
    } finally {
      if (activeRequestController === requestController) {
        activeRequestController = null;
      }

      setButtonState(false);
    }
  }

  function bindEvents() {
    const { form } = getPanelElements();
    if (!form || form.dataset.everythingSearchBound === "true") return;

    form.dataset.everythingSearchBound = "true";
    form.addEventListener("submit", search);
  }

  function initialize() {
    const { panel, input } = getPanelElements();
    if (!panel) return;

    bindEvents();
    if (input && !input.value) {
      input.placeholder = "Search local file and folder names";
    }

    setButtonState(false);
    setStatus("Checking whether Everything is available on 127.0.0.1...", "idle");
    clearResults();
    fetchHealth();
  }

  return {
    initialize,
    fetchHealth,
    search,
    buildSearchUrl,
    normalizeQuery,
    normalizeType,
    normalizeLimit,
    renderResults,
    setStatus,
    clearSession
  };
})();
