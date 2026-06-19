/* Everything and local companion installation guidance. */

window.EverythingInstallGuide = (() => {
  const officialDownloadUrl = "https://www.voidtools.com/downloads/";
  const companionDownloadUrl = "https://github.com/mmark76/Personal_Organisation_File_Archiver/releases/latest/download/EverythingCompanionSetup.exe";
  const installInstructions = "Download Everything from voidtools, install it, start it, then return here and refresh or select Check Again.";
  const companionInstructions = "Install the Organize Your PC local companion once. It starts automatically in the background whenever you sign in to Windows.";
  const currentScriptUrl = document.currentScript?.src || new URL("assets/js/everything-install-guide.js", window.location.href).href;
  const brandStylesheetUrl = new URL("../css/everything-brand.css", currentScriptUrl).href;
  let bound = false;

  function ensureBrandStylesheet() {
    if (document.getElementById("everythingBrandStylesheet")) return;

    const link = document.createElement("link");
    link.id = "everythingBrandStylesheet";
    link.rel = "stylesheet";
    link.href = brandStylesheetUrl;
    document.head.appendChild(link);
  }

  function createPermanentInstallButton() {
    const existingButton = document.getElementById("everythingInstallButton");
    if (existingButton) return existingButton;

    const searchButton = document.getElementById("everythingSearchButton");
    if (!searchButton?.parentElement) return null;

    const installButton = document.createElement("a");
    installButton.id = "everythingInstallButton";
    installButton.className = "button button-secondary everything-install-button";
    installButton.href = officialDownloadUrl;
    installButton.target = "_blank";
    installButton.rel = "noopener noreferrer";
    installButton.title = installInstructions;
    installButton.setAttribute("aria-label", `Install Everything. ${installInstructions}`);

    const title = document.createElement("span");
    title.textContent = "Install Everything";

    const steps = document.createElement("small");
    steps.textContent = "Download · Install · Start";

    installButton.append(title, steps);
    searchButton.insertAdjacentElement("afterend", installButton);
    return installButton;
  }

  function createCompanionInstallButton() {
    const existingButton = document.getElementById("everythingCompanionDownloadLink");
    if (existingButton) return existingButton;

    const { guideButton } = window.EverythingSearchUi?.getElements?.() || {};
    const actions = guideButton?.parentElement;
    if (!actions) return null;

    const companionButton = document.createElement("a");
    companionButton.id = "everythingCompanionDownloadLink";
    companionButton.className = "button";
    companionButton.href = companionDownloadUrl;
    companionButton.title = companionInstructions;
    companionButton.setAttribute("aria-label", `Install local companion. ${companionInstructions}`);
    companionButton.textContent = "Install Local Companion";
    actions.insertBefore(companionButton, guideButton);
    return companionButton;
  }

  function ensureCompanionGuideNote() {
    const { installGuide } = window.EverythingSearchUi?.getElements?.() || {};
    if (!installGuide || document.getElementById("everythingCompanionGuideNote")) return;

    const note = document.createElement("p");
    note.id = "everythingCompanionGuideNote";
    note.textContent = "Also install the local companion once. It runs silently in the background and starts automatically with your Windows sign-in, so no PowerShell window must remain open.";
    installGuide.prepend(note);
  }

  function configureDownloadLinks() {
    ensureBrandStylesheet();
    const installButton = createPermanentInstallButton();
    const companionButton = createCompanionInstallButton();
    const { downloadLink } = window.EverythingSearchUi?.getElements?.() || {};

    [installButton, downloadLink].forEach(link => {
      if (!link) return;
      link.href = officialDownloadUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });

    if (companionButton) {
      companionButton.href = companionDownloadUrl;
    }

    ensureCompanionGuideNote();
  }

  function bindEvents(onCheckAgain) {
    configureDownloadLinks();
    if (bound) return;

    const { guideButton, checkAgainButton } = window.EverythingSearchUi?.getElements?.() || {};

    guideButton?.addEventListener("click", () => {
      const { installGuide } = window.EverythingSearchUi.getElements();
      window.EverythingSearchUi.setGuideExpanded(Boolean(installGuide?.hidden));
    });

    checkAgainButton?.addEventListener("click", () => {
      onCheckAgain?.();
    });

    bound = true;
  }

  function reset() {
    configureDownloadLinks();
    window.EverythingSearchUi?.setGuideExpanded?.(false);
  }

  ensureBrandStylesheet();

  return {
    officialDownloadUrl,
    companionDownloadUrl,
    installInstructions,
    companionInstructions,
    bindEvents,
    reset
  };
})();
