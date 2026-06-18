/* Everything search presentation: element access, states, and safe result rendering. */

window.EverythingSearchUi = (() => {
  let searchEnabled = false;
  let busy = false;

  function getElements() {
    return {
      screen: document.getElementById("everythingSearchScreen"),
      panel: document.getElementById("everythingSearchPanel"),
      form: document.getElementById("everythingSearchForm"),
      input: document.getElementById("everythingSearchInput"),
      typeSelect: document.getElementById("everythingSearchTypeSelect"),
      limitInput: document.getElementById("everythingSearchLimitInput"),
      searchButton: document.getElementById("everythingSearchButton"),
      cancelButton: document.getElementById("everythingSearchCancelButton"),
      status: document.getElementById("everythingSearchStatus"),
      results: document.getElementById("everythingSearchResults"),
      setupPanel: document.getElementById("everythingSetupPanel"),
      installGuide: document.getElementById("everythingInstallGuide"),
      guideButton: document.getElementById("toggleEverythingInstallGuideButton"),
      checkAgainButton: document.getElementById("everythingCheckAgainButton"),
      downloadLink: document.getElementById("everythingDownloadLink")
    };
  }

  function applyInteractiveState() {
    const { input, typeSelect, searchButton, cancelButton } = getElements();
    const controlsDisabled = !searchEnabled || busy;

    if (input) input.disabled = controlsDisabled;
    if (typeSelect) typeSelect.disabled = controlsDisabled;

    if (searchButton) {
      searchButton.disabled = controlsDisabled;
      searchButton.textContent = busy ? "Searching..." : "Search";
    }

    if (cancelButton) {
      cancelButton.hidden = !busy;
      cancelButton.disabled = !busy;
    }
  }

  function setStatus(message, tone = "idle") {
    const { status } = getElements();
    if (!status) return;

    status.textContent = String(message || "");
    status.dataset.statusTone = tone;
    status.classList.remove("status-idle", "status-loading", "status-success", "status-error");
    status.classList.add(`status-${tone}`);
  }

  function setSearchEnabled(enabled) {
    searchEnabled = Boolean(enabled);
    applyInteractiveState();
  }

  function setBusy(isBusy) {
    busy = Boolean(isBusy);
    applyInteractiveState();
  }

  function showSetup(show) {
    const { setupPanel } = getElements();
    if (setupPanel) setupPanel.hidden = !show;
  }

  function clearResults() {
    const { results } = getElements();
    if (results) results.replaceChildren();
  }

  function createResultKindLabel(kind) {
    if (kind === 1 || String(kind).toLowerCase() === "folder") {
      return "Folder";
    }

    return "File";
  }

  function renderResults(results, query, type) {
    const { results: resultsBox } = getElements();
    if (!resultsBox) return;

    resultsBox.replaceChildren();
    const normalizedResults = Array.isArray(results) ? results : [];

    if (!normalizedResults.length) {
      const empty = document.createElement("p");
      empty.className = "everything-search-empty";
      empty.textContent = "No matching files or folders were found.";
      resultsBox.appendChild(empty);
      return;
    }

    const meta = document.createElement("div");
    meta.className = "everything-search-results-meta";
    meta.textContent = `${normalizedResults.length} result(s) for “${String(query)}” (${String(type)}).`;

    const list = document.createElement("div");
    list.className = "everything-search-results-list";

    normalizedResults.forEach(result => {
      const kindLabel = createResultKindLabel(result?.kind);
      const item = document.createElement("article");
      item.className = "everything-search-result";

      const icon = document.createElement("span");
      icon.className = "everything-search-result-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = kindLabel === "Folder" ? "▰" : "▤";

      const name = document.createElement("strong");
      name.textContent = String(result?.name || "Unnamed result");

      const details = document.createElement("div");
      details.className = "everything-search-result-details";

      const kind = document.createElement("span");
      kind.className = "everything-search-result-kind";
      kind.textContent = kindLabel;

      const path = document.createElement("code");
      path.textContent = String(result?.path || "Location hidden");

      details.append(kind, path);
      item.append(icon, name, details);
      list.appendChild(item);
    });

    resultsBox.append(meta, list);
  }

  function showChecking(serviceLocation) {
    clearResults();
    showSetup(false);
    setSearchEnabled(false);
    setBusy(false);
    setStatus(`Checking Everything on ${serviceLocation}...`, "loading");
  }

  function showReady(payload) {
    showSetup(false);
    setSearchEnabled(true);
    setBusy(false);
    setStatus(`Everything is ready through ${payload?.backend || "the local companion"}.`, "success");
  }

  function showUnavailable(message) {
    clearResults();
    setSearchEnabled(false);
    setBusy(false);
    showSetup(true);
    setStatus(message, "error");
  }

  function focusInput() {
    const { input } = getElements();
    input?.focus?.();
  }

  function setGuideExpanded(expanded) {
    const { installGuide, guideButton } = getElements();
    if (installGuide) installGuide.hidden = !expanded;
    if (guideButton) {
      guideButton.setAttribute("aria-expanded", String(expanded));
      guideButton.textContent = expanded ? "Hide Installation Guide" : "Installation Guide";
    }
  }

  return {
    getElements,
    setStatus,
    setSearchEnabled,
    setBusy,
    showSetup,
    clearResults,
    renderResults,
    showChecking,
    showReady,
    showUnavailable,
    focusInput,
    setGuideExpanded
  };
})();
