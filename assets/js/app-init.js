/* App initialization and event binding. */

window.AppInit = (() => {
  const { qs, qsa } = window.AppUtils;

  function bindHeaderActions() {
    qs("#openDisclaimerButton")?.addEventListener("click", () => window.AppModals.openModal("disclaimerModal"));
    qs("#openHowItWorksButton")?.addEventListener("click", () => window.AppModals.openModal("howItWorksModal"));
    qs("#openFeedbackButton")?.addEventListener("click", window.AppFeedback.openFeedback);
  }

  function bindNavigationActions() {
    qs("#openFolderTreeModeButton")?.addEventListener("click", window.AppNavigation.showFolderTreeMode);
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

    qsa(".template-download-button").forEach(button => {
      button.addEventListener("click", () => window.FolderTreeTemplates.downloadTemplate(button.dataset.templateDownloadId));
    });

    qs("#thinkingTypeSelect")?.addEventListener("change", window.FolderTree.updateThinkingPrompt);
    qs("#confirmAddFolderButton")?.addEventListener("click", window.FolderTree.confirmAddFolder);
    qs("#cancelAddFolderButton")?.addEventListener("click", () => window.AppModals.closeModal("folderModal"));
    qs("#closeFolderModalButton")?.addEventListener("click", () => window.AppModals.closeModal("folderModal"));

    window.FolderTreeRender.bindTreeEvents();
  }

  function bindArchiveActions() {
    qs("#viewFolderTreeButton")?.addEventListener("click", window.FolderTreeRender.renderArchivePreview);
    qs("#importArchiveTreeButton")?.addEventListener("click", () => qs("#archiveTreeImportInput")?.click());
    qs("#archiveTreeImportInput")?.addEventListener("change", event => window.FolderTreeImport.handleImportInput(event.target));
    qs("#importFileButton")?.addEventListener("click", window.FileImport.openFileInput);
    qs("#archiveFileInput")?.addEventListener("change", event => window.FileImport.handleFileInput(event.target));
    qs("#archiveFileButton")?.addEventListener("click", window.FileArchive.archiveLoadedFile);
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

  function initialize() {
    bindHeaderActions();
    bindNavigationActions();
    bindFolderTreeActions();
    bindArchiveActions();
    bindFeedbackActions();
    bindPrivacyActions();

    window.AppModals.bindModalEvents();
    window.AppAccessibility.bindKeyboardHandlers();
    window.FolderTreeRender.renderAll();
    window.FileImport.renderFileStatus();
    window.AppPrivacyNotice.showNoticeIfNeeded();
  }

  document.addEventListener("DOMContentLoaded", initialize);

  return {
    initialize
  };
})();
