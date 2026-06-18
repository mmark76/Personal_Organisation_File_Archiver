/* Everything companion API client: validation, filters, session handling, health, and search requests. */

window.EverythingSearchApi = (() => {
  const defaultApiBaseUrl = "http://127.0.0.1:51337";
  const defaultLimit = 20;
  const maximumLimit = 50;
  const maximumQueryLength = 256;
  const maximumLocationLength = 260;
  const sessionHeaderName = "X-Everything-Session";
  const sessionExpiresHeaderName = "X-Everything-Session-Expires";
  const sessionExpirySkewMs = 30_000;

  const supportedModifiedFilters = new Set([
    "any",
    "today",
    "thisweek",
    "thismonth",
    "last7days",
    "last30days"
  ]);
  const supportedSizeFilters = new Set([
    "any",
    "upto100kb",
    "100kbto1mb",
    "1mbto16mb",
    "16mbto128mb",
    "over128mb"
  ]);
  const supportedMatchModes = new Set(["contains", "exact", "startswith"]);

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

    if (query.includes('"')) {
      throw new Error("Search terms cannot contain a double quote.");
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

  function normalizeExtension(value) {
    const extension = String(value || "").trim().toLowerCase();
    if (!extension || extension === "any") return "";

    const parts = extension
      .split(/[;,\s]+/)
      .map(part => part.replace(/^\./, ""))
      .filter(Boolean);

    if (!parts.length || parts.length > 12 || parts.some(part => !/^[a-z0-9]{1,12}$/.test(part))) {
      throw new Error("Choose a supported file category.");
    }

    return [...new Set(parts)].join(";");
  }

  function normalizeModified(value) {
    const normalized = String(value || "any").trim().toLowerCase();
    return supportedModifiedFilters.has(normalized) ? normalized : "any";
  }

  function normalizeSize(value) {
    const normalized = String(value || "any").trim().toLowerCase();
    return supportedSizeFilters.has(normalized) ? normalized : "any";
  }

  function normalizeLocation(value) {
    const location = String(value || "").trim();
    if (!location) return "";

    if (location.length > maximumLocationLength) {
      throw new Error(`Location must be ${maximumLocationLength} characters or fewer.`);
    }

    if (location.includes('"') || /[\u0000-\u001F\u007F]/.test(location)) {
      throw new Error("Location contains an invalid character.");
    }

    const normalized = location.replaceAll("/", "\\");
    if (!/^[a-z]:/i.test(normalized)) {
      throw new Error("Location must begin with a Windows drive letter, for example C:\\Users.");
    }

    return normalized;
  }

  function normalizeMatch(value) {
    const normalized = String(value || "contains").trim().toLowerCase();
    return supportedMatchModes.has(normalized) ? normalized : "contains";
  }

  function normalizeFilters(filters = {}) {
    return {
      extension: normalizeExtension(filters.extension),
      modified: normalizeModified(filters.modified),
      size: normalizeSize(filters.size),
      location: normalizeLocation(filters.location),
      match: normalizeMatch(filters.match)
    };
  }

  function buildSearchUrl(query, type, limit, filters = {}) {
    const normalizedFilters = normalizeFilters(filters);
    const url = new URL("/api/search", getApiBaseUrl());
    url.searchParams.set("q", normalizeQuery(query));
    url.searchParams.set("type", normalizeType(type));
    url.searchParams.set("limit", String(normalizeLimit(limit)));

    if (normalizedFilters.extension) url.searchParams.set("ext", normalizedFilters.extension);
    if (normalizedFilters.modified !== "any") url.searchParams.set("modified", normalizedFilters.modified);
    if (normalizedFilters.size !== "any") url.searchParams.set("size", normalizedFilters.size);
    if (normalizedFilters.location) url.searchParams.set("location", normalizedFilters.location);
    if (normalizedFilters.match !== "contains") url.searchParams.set("match", normalizedFilters.match);

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

  async function search({
    query,
    type = "all",
    limit = defaultLimit,
    extension = "",
    modified = "any",
    size = "any",
    location = "",
    match = "contains",
    signal
  } = {}) {
    const normalizedQuery = normalizeQuery(query);
    const normalizedType = normalizeType(type);
    const normalizedLimit = normalizeLimit(limit);
    const filters = normalizeFilters({ extension, modified, size, location, match });
    const url = buildSearchUrl(normalizedQuery, normalizedType, normalizedLimit, filters);
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
    maximumLocationLength,
    sessionHeaderName,
    getApiBaseUrl,
    getServiceLocationLabel,
    normalizeQuery,
    normalizeType,
    normalizeLimit,
    normalizeExtension,
    normalizeModified,
    normalizeSize,
    normalizeLocation,
    normalizeMatch,
    normalizeFilters,
    buildSearchUrl,
    clearSession,
    fetchHealth,
    search
  };
})();
