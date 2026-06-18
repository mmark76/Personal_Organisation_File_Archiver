/* Everything search coordinator and compatibility facade. */

window.EverythingSearch = (() => {
  const currentScriptUrl = document.currentScript?.src || window.location.href;
  const scriptDirectory = new URL(".", currentScriptUrl);
  const moduleFiles = [
    "everything-search-api.js",
    "everything-search-ui.js",
    "everything-install-guide.js",
    "everything-search-view.js"
  ];

  const defaultApiBaseUrl = "http://127.0.0.1:51337";
  const defaultLimit = 20;
  const maximumLimit = 50;
  const maximumQueryLength = 256;

  let modulesPromise = null;
  let initialized = false;
  let activeRequestController = null;
  let clearSessionWhenReady = false;

  function loadStylesheet() {
    if (document.querySelector('link[data-everything-search-styles="true"]')) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL("../css/everything-search.css", scriptDirectory).href;
    link.dataset.everythingSearchStyles = "true";
    document.head.appendChild(link);
  }

  function loadClassicScript(fileName) {
    return new Promise((resolve, reject) => {
      const source = new URL(fileName, scriptDirectory).href;
      const existing = [...document.scripts].find(script => script.src === source);

      if (existing?.dataset.loaded === "true") {
        resolve();
        return;
      }

      const script = existing || document.createElement("script");
      script.src = source;
      script.async = false;
      script.addEventListener("load", () => {
        script.dataset.loaded = "true";
        resolve();
      }, { once: true });
      script.addEventListener("error", () => reject(new Error(`Could not load ${fileName}.`)), { once: true });

      if (!existing) {
        document.head.appendChild(script);
      }
    });
  }

  function ensureModules() {
    if (modulesPromise) return modulesPromise;

    loadStylesheet();
    modulesPromise = moduleFiles.reduce(
      (promise, fileName) => promise.then(() => loadClassicScript(fileName)),
      Promise.resolve()
    ).then(() => {
      if (clearSessionWhenReady) {
        window.EverythingSearchApi?.clearSession?.();
        clearSessionWhenReady = false;
      }
    });

    return modulesPromise;
  }

  function getApiBaseUrlFallback() {
    return String(window.EverythingSearchConfig?.baseUrl || defaultApiBaseUrl).replace(/\/+$/, "");
  }

  function normalizeQueryFallback(value) {
    const query = String(value || "").trim();

    if (!query) throw new Error("Enter a search term.");
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

  function normalizeTypeFallback(value) {
    const normalized = String(value || "all").trim().toLowerCase();
    return ["all", "file", "folder"].includes(normalized) ? normalized : "all";
  }

  function normalizeLimitFallback(value) {
    const requestedLimit = Number.parseInt(value, 10);
    if (!Number.isFinite(requestedLimit)) return defaultLimit;
    if (requestedLimit <= 0) return 1;
    return Math.min(requestedLimit, maximumLimit);
  }

  function normalizeQuery(value) {
    return window.EverythingSearchApi?.normalizeQuery?.(value) || normalizeQueryFallback(value);
  }

  function normalizeType(value) {
    return window.EverythingSearchApi?.normalizeType?.(value) || normalizeTypeFallback(value);
  }

  function normalizeLimit(value) {
    return window.EverythingSearchApi?.normalizeLimit?.(value) || normalizeLimitFallback(value);
  }

  function buildSearchUrl(query, type, limit) {
    if (window.EverythingSearchApi?.buildSearchUrl) {
      return window.EverythingSearchApi.buildSearchUrl(query, type, limit);
    }

    const url = new URL("/api/search", getApiBaseUrlFallback());
    url.searchParams.set("q", normalizeQueryFallback(query));
    url.searchParams.set("type", normalizeTypeFallback(type));
    url.searchParams.set("limit", String(normalizeLimitFallback(limit)));
    return url;
  }

  async function initialize() {
    await ensureModules();
    window.EverythingSearchView?.ensureView?.();

    const elements = window.EverythingSearchUi?.getElements?.();
    if (!elements?.form || elements.form.dataset.everythingSearchBound === "true") {
      initialized = Boolean(elements?.form);
      return;
    }

    elements.form.dataset.everythingSearchBound = "true";
    elements.form.addEventListener("submit", search);
    elements.cancelButton?.addEventListener("click", cancelSearch);
    window.EverythingInstallGuide?.bindEvents?.(checkAvailability);
    window.EverythingSearchUi.setSearchEnabled(false);
    initialized = true;
  }

  async function checkAvailability() {
    await initialize();

    const api = window.EverythingSearchApi;
    const ui = window.EverythingSearchUi;
    if (!api || !ui) return null;

    ui.showChecking(api.getServiceLocationLabel());

    try {
      const payload = await api.fetchHealth();

      if (payload?.everythingAvailable) {
        ui.showReady(payload);
      } else {
        ui.showUnavailable("The local companion is running, but Everything is not ready yet.");
      }

      return payload;
    } catch {
      api.clearSession();
      ui.showUnavailable(`Everything is not available through the local companion on ${api.getServiceLocationLabel()}.`);
      return null;
    }
  }

  async function activate() {
    await initialize();
    window.EverythingInstallGuide?.reset?.();
    const payload = await checkAvailability();

    if (payload?.everythingAvailable) {
      window.EverythingSearchUi?.focusInput?.();
    }

    return payload;
  }

  async function search(event) {
    event?.preventDefault?.();
    await initialize();

    const api = window.EverythingSearchApi;
    const ui = window.EverythingSearchUi;
    const elements = ui?.getElements?.();
    if (!api || !ui || !elements?.input || !elements?.typeSelect || !elements?.limitInput) return null;

    let query;
    try {
      query = api.normalizeQuery(elements.input.value);
    } catch (error) {
      ui.setStatus(error?.message || "Enter a search term.", "error");
      ui.clearResults();
      return null;
    }

    activeRequestController?.abort();
    const requestController = new AbortController();
    activeRequestController = requestController;

    ui.setBusy(true);
    ui.showSetup(false);
    ui.setStatus("Searching Everything on this PC...", "loading");
    ui.clearResults();

    try {
      const payload = await api.search({
        query,
        type: elements.typeSelect.value,
        limit: elements.limitInput.value,
        signal: requestController.signal
      });

      const results = Array.isArray(payload?.results) ? payload.results : [];
      const type = api.normalizeType(elements.typeSelect.value);
      ui.renderResults(results, query, type);
      ui.setStatus(`Everything found ${results.length} local result(s).`, "success");
      return payload;
    } catch (error) {
      if (error?.name === "AbortError") {
        ui.setStatus("Search cancelled.", "idle");
        return null;
      }

      if (error?.status === 503 || error instanceof TypeError) {
        ui.showUnavailable(error?.message || "Everything is not available yet.");
      } else {
        ui.setStatus(error?.message || "Everything search failed.", "error");
        ui.clearResults();
      }

      return null;
    } finally {
      if (activeRequestController === requestController) {
        activeRequestController = null;
        ui.setBusy(false);
      }
    }
  }

  function cancelSearch() {
    activeRequestController?.abort();
  }

  function clearSession() {
    if (window.EverythingSearchApi?.clearSession) {
      window.EverythingSearchApi.clearSession();
      return;
    }

    clearSessionWhenReady = true;
    void ensureModules();
  }

  function renderResults(results, query, type) {
    return window.EverythingSearchUi?.renderResults?.(results, query, type);
  }

  function setStatus(message, tone) {
    return window.EverythingSearchUi?.setStatus?.(message, tone);
  }

  if (document.readyState === "complete") {
    void initialize();
  } else {
    window.addEventListener("load", () => void initialize(), { once: true });
  }

  return {
    initialize,
    activate,
    checkAvailability,
    fetchHealth: checkAvailability,
    search,
    cancelSearch,
    buildSearchUrl,
    normalizeQuery,
    normalizeType,
    normalizeLimit,
    renderResults,
    setStatus,
    clearSession,
    get initialized() {
      return initialized;
    }
  };
})();
