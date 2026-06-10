/* Screen navigation: one active mode at a time. */

window.AppNavigation = (() => {
  const screenIds = ["mainChoiceScreen", "folderTreeScreen", "existingFolderTreeScreen", "archiveFileScreen"];

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

  function showFolderTreeMode() {
    showScreen("folderTreeScreen");
  }

  function showExistingFolderTreeMode() {
    showScreen("existingFolderTreeScreen");
    window.FolderTreeExisting?.renderExistingTreePreview();
  }

  function showArchiveMode() {
    showScreen("archiveFileScreen");
    if (window.FolderTreeRender) {
      window.FolderTreeRender.renderArchivePreview();
    }
  }

  return {
    showScreen,
    showMainChoices,
    showFolderTreeMode,
    showExistingFolderTreeMode,
    showArchiveMode
  };
})();