/* Screen navigation: one active mode at a time. */

window.AppNavigation = (() => {
  const screenIds = [
    "mainChoiceScreen",
    "everythingSearchScreen",
    "folderTreeScreen",
    "existingFolderTreeScreen",
    "archiveFileScreen",
    "archiveFolderScreen"
  ];

  function showScreen(screenId) {
    screenIds.forEach(id => {
      const screen = document.getElementById(id);
      if (!screen) return;

      const isActive = id === screenId;
      screen.hidden = !isActive;
      screen.setAttribute("aria-hidden", String(!isActive));
      screen.classList.toggle("screen-active", isActive);
    });

    const activeTitle = document.querySelector(`#${screenId} h2`);
    if (activeTitle) activeTitle.setAttribute("tabindex", "-1");
    if (activeTitle) activeTitle.focus();
  }

  function showMainChoices() {
    showScreen("mainChoiceScreen");
  }

  async function showEverythingSearchMode() {
    showScreen("everythingSearchScreen");

    const search = window.EverythingSearch;
    await search?.initialize?.();

    const ui = window.EverythingSearchUi;
    window.EverythingInstallGuide?.reset?.();
    ui?.showSetup?.(false);
    ui?.setSearchEnabled?.(true);
    ui?.setBusy?.(false);
    ui?.setStatus?.("Enter a search term and select Search.", "idle");

    const payload = await search?.checkAvailability?.();

    if (!payload?.everythingAvailable) {
      ui?.showSetup?.(false);
      ui?.setSearchEnabled?.(true);
      ui?.setBusy?.(false);
      ui?.setStatus?.("Enter a search term and select Search.", "idle");
    }

    ui?.focusInput?.();
  }

  function showFolderTreeMode() {
    window.AppState.setActiveMode("buildTree");
    showScreen("folderTreeScreen");

    if (window.FolderTreeRender) {
      window.FolderTreeRender.renderTree();
      window.FolderTreeRender.renderOutput();
    }
  }

  function showExistingFolderTreeMode() {
    window.AppState.setActiveMode("existingTree");
    showScreen("existingFolderTreeScreen");
    window.FolderTreeExisting?.renderExistingTreePreview();
  }

  function showArchiveMode() {
    window.AppState.setActiveMode("archive");
    showScreen("archiveFileScreen");
    window.AppAnalytics?.trackEvent("open_file_archive");

    if (window.FolderTreeRender) {
      window.FolderTreeRender.renderArchivePreview();
    }

    window.FileImport?.renderFileStatus();
    window.FileAdvisor?.renderSuggestion();
  }

  function showArchiveFolderMode() {
    window.AppState.setActiveMode("archiveFolder");
    showScreen("archiveFolderScreen");
    window.AppAnalytics?.trackEvent("open_folder_archive");

    if (window.FolderTreeRender) {
      window.FolderTreeRender.renderArchivePreview();
    }

    window.FolderArchive?.renderFolderStatus();
  }

  return {
    showScreen,
    showMainChoices,
    showEverythingSearchMode,
    showFolderTreeMode,
    showExistingFolderTreeMode,
    showArchiveMode,
    showArchiveFolderMode
  };
})();