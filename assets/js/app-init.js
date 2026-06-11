/* App initialization and event binding. */

window.AppInit = (() => {
  const { qs, qsa, downloadTextFile } = window.AppUtils;
  const settingsStorageKey = "organizeYourPcColorTheme";

  function getSavedSettingsTheme() {
    if (window.ColorThemePicker?.loadTheme) {
      return window.ColorThemePicker.loadTheme();
    }

    try {
      const storedTheme = localStorage.getItem(settingsStorageKey);
      return storedTheme ? JSON.parse(storedTheme) : null;
    } catch (error) {
      return null;
    }
  }

  function downloadSavedSettings() {
    const theme = getSavedSettingsTheme();

    const exportData = {
      app: "Personal Memory-Based File Archiver",
      type: "organize-your-pc-settings",
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      storageKey: settingsStorageKey,
      settings: theme || {}
    };

    downloadTextFile(
      "organize_your_pc_settings.json",
      JSON.stringify(exportData, null, 2),
      "application/json;charset=utf-8"
    );
  }

  function createDownloadSettingsButton() {
    if (qs("#downloadSettingsButton")) return;

    const headerActions = qs(".header-actions");
    if (!headerActions) return;

    const button = document.createElement("button");
    button.type = "button";
    button.id = "downloadSettingsButton";
    button.className = "button button-secondary";
    button.textContent = "Download settings";
    button.addEventListener("click", downloadSavedSettings);

    headerActions.appendChild(button);
  }

  function bindHeaderActions() {
    qs("#openDisclaimerButton")?.addEventListener("click", () => window.AppModals.openModal("disclaimerModal"));
    qs("#openHowItWorksButton")?.addEventListener("click", () => window.AppModals.openModal("howItWorksModal"));
    qs("#openFeedbackButton")?.addEventListener("click", window.AppFeedback.openFeedback);
  }

  function bindNavigationActions() {
    qs("#openFolderTreeModeButton")?.addEventListener("click", window.AppNavigation.showFolderTreeMode);
    qs("#openExistingFolderTreeModeButton")?.addEventListener("click", window.AppNavigation.showExistingFolderTreeMode);
    qs("#openArchiveModeButton")?.addEventListener("click", window.AppNavigation.showArchiveMode);

    qsa(".back-to-main-button").forEach(button => {
      button.addEventListener("click", window.AppNavigation.showMainChoices);
    });
  }

  function bindFolderTreeActions() {
    qs("#loadExampleTreeButton")?.addEventListener("click", window.FolderTree.loadExampleTree);
    qs("#copyTreeButton")?.addEventListener("click", window.FolderTreeExport.copyFolderTreeText);
    qs("#exportTreeButton")?.addEventListener("click", window.FolderTreeExport.exportFolderTreeJson);
    qs("#createFoldersButton")?.addEventListener("click", window.FolderCreation.createFoldersOnComputer);
    qs("#importTreeButton")?.addEventListener("click", () => qs("#folderTreeImportInput")?.click());
    qs("#folderTreeImportInput")?.addEventListener("change", event => window.FolderTreeImport.handleImportInput(event.target));
    qs("#chooseExistingFolderTreeButton")?.addEventListener("click", () => window.FolderTreeExisting.chooseExistingFolderTree());

    qsa(".template-download-button").forEach(button => {
      button.addEventListener("click", () => window.FolderTreeTemplates.downloadTemplate(button.dataset.templateDownloadId));
    });

    qs("#thinkingTypeSelect")?.addEventListener("change", window.FolderTree.updateThinkingPrompt);
    qs("#confirmAddFolderButton")?.addEventListener("click", window.FolderTree.confirmAddFolder);
    qs("#cancelAddFolderButton")?.addEventListener("click", () => window.AppModals.closeModal("folderModal"));
    qs("#closeFolderModalButton")?.addEventListener("click", () => window.AppModals.closeModal("folderModal"));

    window.FolderTreeRender.bindTreeEvents();
  }

  function applyTemporaryMainChoiceLabels() {
    const buildNewTreeTitle = qs("#openFolderTreeModeButton strong");
    if (buildNewTreeTitle) buildNewTreeTitle.textContent = "Build New Folder Tree on this PC";
  }

  function temporarilyDisableFolderTreeUtilityButtons() {
    const buttonSelectors = [
      "#copyTreeButton",
      "#importTreeButton",
      "#exportTreeButton",
      ".template-download-button"
    ];

    buttonSelectors.forEach(selector => {
      qsa(selector).forEach(button => {
        button.disabled = true;
        button.hidden = true;
        button.setAttribute("aria-hidden", "true");
      });
    });
  }

  function bindArchiveActions() {
    qs("#chooseArchiveTreeButton")?.addEventListener("click", () => {
      const panel = qs("#archiveTreeChoicePanel");
      if (panel) panel.hidden = !panel.hidden;
    });

    qs("#useArchiveFolderTreeOnPcButton")?.addEventListener("click", window.FolderTreeExisting.chooseExistingFolderTreeForArchive);
    qs("#importArchiveTreeButton")?.addEventListener("click", () => qs("#archiveTreeImportInput")?.click());
    qs("#archiveTreeImportInput")?.addEventListener("change", event => window.FolderTreeImport.handleImportInput(event.target));
    qs("#importFileButton")?.addEventListener("click", window.FileImport.openFileInput);
    qs("#archiveFileInput")?.addEventListener("change", event => window.FileImport.handleFileInput(event.target));
    qs("#archiveFileButton")?.addEventListener("click", window.FileArchive.archiveLoadedFile);
    window.FileAdvisor?.bindEvents();
  }

  function bindFeedbackActions() {
    qs("#sendFeedbackButton")?.addEventListener("click", window.AppFeedback.sendFeedback);
    qs("#cancelFeedbackButton")?.addEventListener("click", window.AppFeedback.closeFeedback);
    qs("#closeFeedbackButton")?.addEventListener("click", window.AppFeedback.closeFeedback);
  }

  function bindPrivacyActions() {
    qs("#acceptPrivacyNoticeButton")?.addEventListener("click", window.AppPrivacyNotice.acceptNotice);
    qs("#hidePrivacyNoticeButton")?.addEventListener("click", window.AppPrivacyNotice.hideNotice);
  }

  function renderInitialModeState() {
    window.AppState.withMode("buildTree", () => {
      window.FolderTreeRender.renderTree();
      window.FolderTreeRender.renderOutput();
    });

    window.AppState.withMode("existingTree", () => {
      window.FolderTreeExisting?.renderExistingTreePreview();
    });

    window.AppState.withMode("archive", () => {
      window.FolderTreeRender.renderArchivePreview();
      window.FileImport.renderFileStatus();
      window.FileAdvisor?.renderSuggestion();
    });

    window.AppState.setActiveMode("buildTree");
  }

  function initialize() {
    bindHeaderActions();
    bindNavigationActions();
    bindFolderTreeActions();
    bindArchiveActions();
    bindFeedbackActions();
    bindPrivacyActions();

    createDownloadSettingsButton();
    applyTemporaryMainChoiceLabels();
    temporarilyDisableFolderTreeUtilityButtons();

    window.AppModals.bindModalEvents();
    window.AppAccessibility.bindKeyboardHandlers();
    renderInitialModeState();
    window.AppPrivacyNotice.showNoticeIfNeeded();
  }

  document.addEventListener("DOMContentLoaded", initialize);

  return {
    initialize
  };
})();
