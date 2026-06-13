/* App initialization and event binding. */

window.AppInit = (() => {
  const { qs, qsa } = window.AppUtils;
  const settingsPanelPositionKey = "organizeYourPcSettingsPanelPosition";

  function bindHeaderActions() {
    qs("#openDisclaimerButton")?.addEventListener("click", () => window.AppModals.openModal("disclaimerModal"));
    qs("#openHowItWorksButton")?.addEventListener("click", () => window.AppModals.openModal("howItWorksModal"));
    qs("#openFeedbackButton")?.addEventListener("click", window.AppFeedback.openFeedback);
  }

  function bindNavigationActions() {
    qs("#openFolderTreeModeButton")?.addEventListener("click", window.AppNavigation.showFolderTreeMode);
    qs("#openExistingFolderTreeModeButton")?.addEventListener("click", window.AppNavigation.showExistingFolderTreeMode);
    qs("#openArchiveModeButton")?.addEventListener("click", window.AppNavigation.showArchiveMode);
    qs("#openArchiveFolderModeButton")?.addEventListener("click", window.AppNavigation.showArchiveFolderMode);

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

    const loadDefaultTemplateButton = qs("#loadExampleTreeButton");
    if (loadDefaultTemplateButton) loadDefaultTemplateButton.textContent = "Choose Template to Load from the Templates Library";

    const downloadDefaultTemplateButton = qs('[data-template-download-id="default-example"]');
    if (downloadDefaultTemplateButton) downloadDefaultTemplateButton.textContent = "Download Default Template";
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

  function injectSettingsPanelPositionStyles() {
    if (qs("#settingsPanelPositionStyles")) return;

    const style = document.createElement("style");
    style.id = "settingsPanelPositionStyles";
    style.textContent = `
      #colorThemePickerModal {
        position: absolute !important;
        top: 24px !important;
        right: 18px !important;
        bottom: auto !important;
      }

      #colorThemePickerModal .ctp-card {
        max-height: min(68vh, 420px) !important;
      }

      #colorThemePickerModal .ctp-header {
        cursor: grab;
        user-select: none;
        touch-action: none;
      }

      #colorThemePickerModal .ctp-header:active {
        cursor: grabbing;
      }

      @media (max-width: 720px) {
        #colorThemePickerModal {
          top: 12px !important;
          right: 12px !important;
          bottom: auto !important;
        }

        #colorThemePickerModal .ctp-card {
          max-height: min(64vh, 380px) !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function setSettingsPanelPosition(modal, left, top) {
    modal.style.setProperty("left", `${Math.round(left)}px`, "important");
    modal.style.setProperty("top", `${Math.round(top)}px`, "important");
    modal.style.setProperty("right", "auto", "important");
    modal.style.setProperty("bottom", "auto", "important");
  }

  function resetSettingsPanelPosition(modal) {
    localStorage.removeItem(settingsPanelPositionKey);
    modal.style.removeProperty("left");
    modal.style.removeProperty("top");
    modal.style.removeProperty("right");
    modal.style.removeProperty("bottom");
  }

  function restoreSettingsPanelPosition(modal) {
    try {
      const savedPosition = JSON.parse(localStorage.getItem(settingsPanelPositionKey) || "null");
      if (!savedPosition || !Number.isFinite(savedPosition.left) || !Number.isFinite(savedPosition.top)) return;
      setSettingsPanelPosition(modal, savedPosition.left, savedPosition.top);
    } catch (error) {
      localStorage.removeItem(settingsPanelPositionKey);
    }
  }

  function makeSettingsPanelDraggable() {
    const modal = qs("#colorThemePickerModal");
    const header = qs("#colorThemePickerModal .ctp-header");
    if (!modal || !header || modal.dataset.draggableReady === "true") return false;

    modal.dataset.draggableReady = "true";
    restoreSettingsPanelPosition(modal);

    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let activePointerId = null;

    header.addEventListener("pointerdown", event => {
      if (event.button !== 0 || event.target.closest("button, input, select, textarea, a")) return;

      const bounds = modal.getBoundingClientRect();
      dragOffsetX = event.clientX - bounds.left;
      dragOffsetY = event.clientY - bounds.top;
      activePointerId = event.pointerId;
      header.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    header.addEventListener("pointermove", event => {
      if (activePointerId !== event.pointerId || !header.hasPointerCapture(event.pointerId)) return;

      const pageLeft = window.scrollX;
      const pageTop = window.scrollY;
      const minimumLeft = pageLeft + 8;
      const minimumTop = pageTop + 8;
      const maximumLeft = Math.max(minimumLeft, pageLeft + window.innerWidth - modal.offsetWidth - 8);
      const maximumTop = Math.max(minimumTop, pageTop + window.innerHeight - 48);
      const nextLeft = Math.min(maximumLeft, Math.max(minimumLeft, event.clientX + pageLeft - dragOffsetX));
      const nextTop = Math.min(maximumTop, Math.max(minimumTop, event.clientY + pageTop - dragOffsetY));

      setSettingsPanelPosition(modal, nextLeft, nextTop);
    });

    function finishDragging(event) {
      if (activePointerId !== event.pointerId) return;

      if (header.hasPointerCapture(event.pointerId)) header.releasePointerCapture(event.pointerId);
      activePointerId = null;

      const left = Number.parseFloat(modal.style.left);
      const top = Number.parseFloat(modal.style.top);
      if (Number.isFinite(left) && Number.isFinite(top)) {
        localStorage.setItem(settingsPanelPositionKey, JSON.stringify({ left, top }));
      }
    }

    header.addEventListener("pointerup", finishDragging);
    header.addEventListener("pointercancel", finishDragging);

    const actions = qs("#colorThemePickerModal .ctp-actions");
    if (actions && !qs("#resetSettingsPanelPositionButton")) {
      const resetPositionButton = document.createElement("button");
      resetPositionButton.type = "button";
      resetPositionButton.id = "resetSettingsPanelPositionButton";
      resetPositionButton.className = "button button-secondary";
      resetPositionButton.textContent = "Reset panel position";
      resetPositionButton.addEventListener("click", () => resetSettingsPanelPosition(modal));
      actions.appendChild(resetPositionButton);
    }

    return true;
  }

  function configureSettingsPanel() {
    injectSettingsPanelPositionStyles();

    if (makeSettingsPanelDraggable()) return;

    const observer = new MutationObserver(() => {
      if (makeSettingsPanelDraggable()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function renderHowItWorksDefaultFolderTreePreview() {
    const modalContent = qs("#howItWorksModal .modal-content");
    if (!modalContent || qs("#howItWorksDefaultFolderTreePreview")) return;

    const section = document.createElement("section");
    section.className = "structure-section";
    section.setAttribute("aria-labelledby", "howItWorksDefaultFolderTreeTitle");

    const title = document.createElement("h3");
    title.id = "howItWorksDefaultFolderTreeTitle";
    title.textContent = "Default Folder Tree";

    const explanation = document.createElement("p");
    explanation.textContent = "The app can build this ready-made default folder tree on your PC. You can use it as it is or create your own custom structure. The first three main categories are fixed: Profile, Personal, and Professional.";

    const preview = document.createElement("pre");
    preview.id = "howItWorksDefaultFolderTreePreview";
    preview.className = "structure-output";
    preview.setAttribute("aria-label", "Default folder tree preview");
    preview.textContent = window.FolderTreeTemplates?.getDefaultTemplatePreviewText?.() || "Default folder tree preview is not available.";

    section.appendChild(title);
    section.appendChild(explanation);
    section.appendChild(preview);
    modalContent.appendChild(section);
  }

  function addDefaultTemplateArchiveChoice(panelSelector, buttonId, noteId) {
    const panel = qs(panelSelector);
    if (!panel) return;

    if (!qs(`#${buttonId}`)) {
      const button = document.createElement("button");
      button.type = "button";
      button.id = buttonId;
      button.className = "button button-secondary";
      button.textContent = "Use Default Template";
      panel.appendChild(button);
    }

    if (!qs(`#${noteId}`)) {
      const note = document.createElement("p");
      note.id = noteId;
      note.className = "small-note";
      note.textContent = "Default Template loads destination choices only. During archiving, the app creates only the selected destination path inside Organize Your PC, not the whole template.";
      panel.insertAdjacentElement("afterend", note);
    }
  }

  function loadDefaultTemplateForArchiving(resultSelector) {
    window.FolderTree.loadExampleTree();
    window.AppUtils.setText(
      resultSelector,
      "Default Template loaded. Select a destination. During archiving, only the selected destination path will be created inside Organize Your PC."
    );
  }

  function bindArchiveActions() {
    addDefaultTemplateArchiveChoice(
      "#archiveTreeChoicePanel",
      "useDefaultArchiveTemplateButton",
      "defaultArchiveTemplateNote"
    );

    qs("#chooseArchiveTreeButton")?.addEventListener("click", () => {
      const panel = qs("#archiveTreeChoicePanel");
      if (panel) panel.hidden = !panel.hidden;
    });

    qs("#useArchiveFolderTreeOnPcButton")?.addEventListener("click", window.FolderTreeExisting.chooseExistingFolderTreeForArchive);
    qs("#useDefaultArchiveTemplateButton")?.addEventListener("click", () => loadDefaultTemplateForArchiving("#archiveResultBox"));
    qs("#importArchiveTreeButton")?.addEventListener("click", () => qs("#archiveTreeImportInput")?.click());
    qs("#archiveTreeImportInput")?.addEventListener("change", event => window.FolderTreeImport.handleImportInput(event.target));
    qs("#importFileButton")?.addEventListener("click", window.FileImport.openFileInput);
    qs("#archiveFileInput")?.addEventListener("change", event => window.FileImport.handleFileInput(event.target));
    qs("#archiveFileButton")?.addEventListener("click", window.FileArchive.archiveLoadedFile);
    window.FileAdvisor?.bindEvents();
  }

  function bindFolderArchiveActions() {
    addDefaultTemplateArchiveChoice(
      "#folderArchiveTreeChoicePanel",
      "useDefaultFolderArchiveTemplateButton",
      "defaultFolderArchiveTemplateNote"
    );

    qs("#chooseFolderArchiveTreeButton")?.addEventListener("click", () => {
      const panel = qs("#folderArchiveTreeChoicePanel");
      if (panel) panel.hidden = !panel.hidden;
    });

    qs("#useFolderArchiveTreeOnPcButton")?.addEventListener("click", window.FolderTreeExisting.chooseExistingFolderTreeForFolderArchive);
    qs("#useDefaultFolderArchiveTemplateButton")?.addEventListener("click", () => loadDefaultTemplateForArchiving("#folderArchiveResultBox"));
    qs("#importFolderArchiveTreeButton")?.addEventListener("click", () => qs("#folderArchiveTreeImportInput")?.click());
    qs("#folderArchiveTreeImportInput")?.addEventListener("change", event => window.FolderTreeImport.handleImportInput(event.target));
    qs("#chooseFolderToArchiveButton")?.addEventListener("click", window.FolderArchive.chooseFolderToArchive);
    qs("#archiveFolderButton")?.addEventListener("click", window.FolderArchive.archiveLoadedFolder);
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

    window.AppState.withMode("archiveFolder", () => {
      window.FolderTreeRender.renderArchivePreview();
      window.FolderArchive?.renderFolderStatus();
    });

    window.AppState.setActiveMode("buildTree");
  }

  function loadBuildTemplateSelectorScript() {
    if (window.TemplateSelector?.initialize) {
      window.TemplateSelector.initialize();
      return;
    }

    if (qs('script[data-template-selector-script="true"]')) return;

    const script = document.createElement("script");
    script.src = "assets/js/template-selector.js";
    script.dataset.templateSelectorScript = "true";
    script.addEventListener("load", () => window.TemplateSelector?.initialize?.());
    document.body.appendChild(script);
  }

  function initialize() {
    bindHeaderActions();
    bindNavigationActions();
    bindFolderTreeActions();
    bindArchiveActions();
    bindFolderArchiveActions();
    bindFeedbackActions();
    bindPrivacyActions();

    applyTemporaryMainChoiceLabels();
    temporarilyDisableFolderTreeUtilityButtons();
    configureSettingsPanel();
    renderHowItWorksDefaultFolderTreePreview();
    loadBuildTemplateSelectorScript();

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
