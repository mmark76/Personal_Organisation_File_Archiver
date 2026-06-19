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

  function createCompanionDownloadButton() {
    const existingButton = document.getElementById("companionDownloadLink");
    if (existingButton) return existingButton;

    const everythingButton = document.getElementById("everythingDownloadLink");
    if (!everythingButton?.parentElement) return null;

    const companionButton = document.createElement("a");
    companionButton.id = "companionDownloadLink";
    companionButton.className = "button";
    companionButton.textContent = "Install Companion";
    everythingButton.insertAdjacentElement("afterend", companionButton);
    return companionButton;
  }

  function configureSetupPanel() {
    const title = document.getElementById("everythingSetupTitle");
    const panel = document.getElementById("everythingSetupPanel");
    const description = panel?.querySelector(":scope > p");
    const everythingButton = document.getElementById("everythingDownloadLink");
    const guideButton = document.getElementById("toggleEverythingInstallGuideButton");
    const guide = document.getElementById("everythingInstallGuide");
    const companionButton = createCompanionDownloadButton();

    if (title) title.textContent = "Search setup is required";
    if (description) {
      description.textContent = "Search this PC needs both Everything and the Organize Your PC Companion on this Windows computer.";
    }

    if (everythingButton) {
      everythingButton.textContent = "Install Everything";
      everythingButton.href = officialDownloadUrl;
      everythingButton.target = "_blank";
      everythingButton.rel = "noopener noreferrer";
    }

    if (companionButton) {
      companionButton.href = companionDownloadUrl;
      companionButton.target = "_blank";
      companionButton.rel = "noopener noreferrer";
      companionButton.setAttribute("download", "EverythingCompanion-win-x64.zip");
    }

    if (guideButton && guideButton.getAttribute("aria-expanded") !== "true") {
      guideButton.textContent = "Simple Instructions";
    }

    if (guide) {
      const list = document.createElement("ol");
      [
        "Select Install Everything, download the current 64-bit installer, install it, and start Everything.",
        "Select Install Companion, extract the downloaded ZIP, and double-click Install-EverythingCompanion.cmd.",
        "Return to Organize Your PC and select Check Again. The companion will then start automatically with Windows."
      ].forEach(text => {
        const item = document.createElement("li");
        item.textContent = text;
        list.appendChild(item);
      });
      guide.replaceChildren(list);
    }
  }

  function configureDownloadLinks() {
    ensureBrandStylesheet();
    configureSetupPanel();
  }

  function openSetupInstructions() {
    window.EverythingSearchUi?.showSetup?.(true);
    window.EverythingSearchUi?.setGuideExpanded?.(true);
    const guideButton = document.getElementById("toggleEverythingInstallGuideButton");
    if (guideButton) guideButton.textContent = "Hide Instructions";
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
      const expand = Boolean(installGuide?.hidden);
      window.EverythingSearchUi.setGuideExpanded(expand);
      guideButton.textContent = expand ? "Hide Instructions" : "Simple Instructions";
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
    const guideButton = document.getElementById("toggleEverythingInstallGuideButton");
    if (guideButton) guideButton.textContent = "Simple Instructions";
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
