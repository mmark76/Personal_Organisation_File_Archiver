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
      extensionSelect: document.getElementById("everythingSearchExtensionSelect"),
      modifiedSelect: document.getElementById("everythingSearchModifiedSelect"),
      sizeSelect: document.getElementById("everythingSearchSizeSelect"),
      matchSelect: document.getElementById("everythingSearchMatchSelect"),
      locationInput: document.getElementById("everythingSearchLocationInput"),
      limitInput: document.getElementById("everythingSearchLimitInput"),
      clearFiltersButton: document.getElementById("everythingSearchClearFiltersButton"),
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
    const elements = getElements();
    const controlsDisabled = !searchEnabled || busy;

    [
      elements.input,
      elements.typeSelect,
      elements.extensionSelect,
      elements.modifiedSelect,
      elements.sizeSelect,
      elements.matchSelect,
      elements.locationInput,
      elements.limitInput,
      elements.clearFiltersButton
    ].forEach(control => {
      if (control) control.disabled = controlsDisabled;
    });

    if (elements.searchButton) {
      elements.searchButton.disabled = controlsDisabled;
      elements.searchButton.textContent = busy ? "Searching..." : "Search";
    }

    if (elements.cancelButton) {
      elements.cancelButton.hidden = !busy;
      elements.cancelButton.disabled = !busy;
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

  function resetFilters() {
    const elements = getElements();
    if (elements.typeSelect) elements.typeSelect.value = "all";
    if (elements.extensionSelect) elements.extensionSelect.value = "";
    if (elements.modifiedSelect) elements.modifiedSelect.value = "any";
    if (elements.sizeSelect) elements.sizeSelect.value = "any";
    if (elements.matchSelect) elements.matchSelect.value = "contains";
    if (elements.locationInput) elements.locationInput.value = "";
    if (elements.limitInput) elements.limitInput.value = "20";
  }

  function readFilters() {
    const elements = getElements();
    return {
      type: elements.typeSelect?.value || "all",
      extension: elements.extensionSelect?.value || "",
      modified: elements.modifiedSelect?.value || "any",
      size: elements.sizeSelect?.value || "any",
      match: elements.matchSelect?.value || "contains",
      location: elements.locationInput?.value || "",
      limit: elements.limitInput?.value || "20"
    };
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
    resetFilters,
    readFilters,
    renderResults,
    showChecking,
    showReady,
    showUnavailable,
    focusInput,
    setGuideExpanded
  };
})();
