/* Everything companion API client: validation, session handling, health, and search requests. */

window.EverythingSearchApi = (() => {
  const defaultApiBaseUrl = "http://127.0.0.1:51337";
  const defaultLimit = 20;
  const maximumLimit = 50;
  const maximumQueryLength = 256;
  const sessionHeaderName = "X-Everything-Session";
  const sessionExpiresHeaderName = "X-Everything-Session-Expires";
  const sessionExpirySkewMs = 30_000;

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
    return ["all", "file", "folder"].includes(normalized) ? normalized : "all";
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

  async function readProblemDetail(response, fallbackMessage) {
    try {
      const problem = await response.json();
      return problem?.detail || fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  }

  async function fetchHealth(options = {}) {
    const response = await fetch(new URL("/api/health", getApiBaseUrl()), {
      signal: options.signal,
      headers: { Accept: "application/json" }
    });

    if (!response.ok) {
      const message = await readProblemDetail(response, "Everything is not responding yet.");
      const error = new Error(message);
      error.status = response.status;
      throw error;
    }

    storeSessionFromResponse(response);
    return response.json();
  }

  async function fetchSearchResponse(url, signal, allowRefresh = true) {
    let token = getUsableSessionToken();

    if (!token) {
      await fetchHealth({ signal });
      token = getUsableSessionToken();
    }

    const headers = { Accept: "application/json" };
    if (token) {
      headers[sessionHeaderName] = token;
    }

    const response = await fetch(url, { signal, headers });

    if (response.status === 401 && allowRefresh) {
      clearSession();
      await fetchHealth({ signal });
      return fetchSearchResponse(url, signal, false);
    }

    return response;
  }

  async function search({ query, type = "all", limit = defaultLimit, signal } = {}) {
    const normalizedQuery = normalizeQuery(query);
    const normalizedType = normalizeType(type);
    const normalizedLimit = normalizeLimit(limit);
    const url = buildSearchUrl(normalizedQuery, normalizedType, normalizedLimit);
    const response = await fetchSearchResponse(url, signal);

    if (!response.ok) {
      const message = await readProblemDetail(response, "Everything could not complete the search.");
      const error = new Error(message);
      error.status = response.status;
      throw error;
    }

    return response.json();
  }

  return {
    defaultLimit,
    maximumLimit,
    maximumQueryLength,
    sessionHeaderName,
    getApiBaseUrl,
    getServiceLocationLabel,
    normalizeQuery,
    normalizeType,
    normalizeLimit,
    buildSearchUrl,
    clearSession,
    fetchHealth,
    search
  };
})();
