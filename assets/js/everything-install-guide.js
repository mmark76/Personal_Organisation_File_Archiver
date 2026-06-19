/* Everything and local companion installation guidance. */

window.EverythingInstallGuide = (() => {
  const officialDownloadUrl = "https://www.voidtools.com/downloads/";
  const companionDownloadUrl = "https://github.com/mmark76/Personal_Organisation_File_Archiver/releases/latest/download/EverythingCompanion-win-x64.zip";
  const installInstructions = "Install Everything first, install the Organize Your PC Companion second, then return here and select Check Again.";
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

  function createPermanentSetupButton() {
    const existingButton = document.getElementById("everythingSetupButton");
    if (existingButton) return existingButton;

    const searchButton = document.getElementById("everythingSearchButton");
    if (!searchButton?.parentElement) return null;

    const setupButton = document.createElement("button");
    setupButton.type = "button";
    setupButton.id = "everythingSetupButton";
    setupButton.className = "button button-secondary everything-install-button";
    setupButton.title = installInstructions;
    setupButton.setAttribute("aria-label", `Set up Search this PC. ${installInstructions}`);

    const title = document.createElement("span");
    title.textContent = "Set up Search";

    const steps = document.createElement("small");
    steps.textContent = "Everything · Companion · Instructions";

    setupButton.append(title, steps);
    searchButton.insertAdjacentElement("afterend", setupButton);
    return setupButton;
  }

  function configureDownloadLinks() {
    ensureBrandStylesheet();
    const { downloadLink, companionDownloadLink } = window.EverythingSearchUi?.getElements?.() || {};

    if (downloadLink) {
      downloadLink.href = officialDownloadUrl;
      downloadLink.target = "_blank";
      downloadLink.rel = "noopener noreferrer";
    }

    if (companionDownloadLink) {
      companionDownloadLink.href = companionDownloadUrl;
      companionDownloadLink.target = "_blank";
      companionDownloadLink.rel = "noopener noreferrer";
    }
  }

  function openSetupInstructions() {
    window.EverythingSearchUi?.showSetup?.(true);
    window.EverythingSearchUi?.setGuideExpanded?.(true);
    document.getElementById("everythingSetupPanel")?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
  }

  function bindEvents(onCheckAgain) {
    configureDownloadLinks();
    const setupButton = createPermanentSetupButton();
    if (bound) return;

    const { guideButton, checkAgainButton } = window.EverythingSearchUi?.getElements?.() || {};

    setupButton?.addEventListener("click", openSetupInstructions);

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
    createPermanentSetupButton();
    window.EverythingSearchUi?.setGuideExpanded?.(false);
  }

  ensureBrandStylesheet();

  return {
    officialDownloadUrl,
    companionDownloadUrl,
    installInstructions,
    bindEvents,
    reset
  };
})();
