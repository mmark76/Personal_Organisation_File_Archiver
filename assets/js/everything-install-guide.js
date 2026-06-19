/* Everything and local companion installation guidance. */

window.EverythingInstallGuide = (() => {
  const officialDownloadUrl = "https://www.voidtools.com/downloads/";
  const companionDownloadUrl = "https://github.com/mmark76/Personal_Organisation_File_Archiver/releases/latest/download/EverythingCompanion-win-x64.zip";
  const startCompanionUrl = "organizeyourpc-companion://start";
  const installInstructions = "Start the Companion if it is already installed. Otherwise install Everything first, install the Organize Your PC Companion second, then return here and select Check Again.";
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

  function ensureSearchRequirementNotice() {
    const heading = document.querySelector("#everythingSearchPanel .everything-search-heading");
    if (!heading || document.getElementById("everythingSearchRequirementNotice")) return;

    const notice = document.createElement("div");
    notice.id = "everythingSearchRequirementNotice";
    notice.className = "guidance-card everything-search-requirement-notice";
    notice.setAttribute("role", "note");

    const title = document.createElement("strong");
    title.textContent = "Search requirements";

    const message = document.createElement("span");
    message.textContent = "To use Search this PC, both Everything and the Organize Your PC Companion must be installed and running on this Windows computer.";

    notice.append(title, message);
    heading.insertAdjacentElement("beforebegin", notice);
  }

  function placeSetupPanelBelowBackButton() {
    const panel = document.getElementById("everythingSetupPanel");
    const toolbar = document.querySelector("#everythingSearchScreen > .screen-toolbar");
    if (!panel || !toolbar) return;

    if (toolbar.nextElementSibling !== panel) {
      toolbar.insertAdjacentElement("afterend", panel);
    }

    Object.assign(panel.style, {
      width: "100%",
      boxSizing: "border-box",
      marginBottom: "12px"
    });
  }

  function createStartCompanionButton() {
    const existingButton = document.getElementById("startCompanionLink");
    if (existingButton) return existingButton;

    const everythingButton = document.getElementById("everythingDownloadLink");
    if (!everythingButton?.parentElement) return null;

    const startButton = document.createElement("a");
    startButton.id = "startCompanionLink";
    startButton.className = "button";
    startButton.textContent = "Start Companion";
    startButton.href = startCompanionUrl;
    everythingButton.parentElement.insertBefore(startButton, everythingButton);
    return startButton;
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
    placeSetupPanelBelowBackButton();

    const title = document.getElementById("everythingSetupTitle");
    const panel = document.getElementById("everythingSetupPanel");
    const description = panel?.querySelector(":scope > p");
    const everythingButton = document.getElementById("everythingDownloadLink");
    const guideButton = document.getElementById("toggleEverythingInstallGuideButton");
    const guide = document.getElementById("everythingInstallGuide");
    const startButton = createStartCompanionButton();
    const companionButton = createCompanionDownloadButton();

    if (title) title.textContent = "Search setup is required";
    if (description) {
      description.textContent = "Start the Companion if it is already installed. Otherwise install Everything and the Organize Your PC Companion on this Windows computer.";
    }

    if (startButton) {
      startButton.href = startCompanionUrl;
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
        "If the Companion is already installed, select Start Companion and approve the browser prompt if it appears.",
        "If Everything is not installed, select Install Everything, download the current 64-bit installer, install it, and start Everything.",
        "If the Companion is not installed, select Install Companion, extract the downloaded ZIP, and double-click Install-EverythingCompanion.cmd.",
        "Return to Organize Your PC and select Check Again. After installation, the Companion starts immediately and will also start automatically when this Windows user signs in."
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
    ensureSearchRequirementNotice();
    configureSetupPanel();
  }

  function bindEvents(onCheckAgain) {
    configureDownloadLinks();
    if (bound) return;

    const { guideButton, checkAgainButton } = window.EverythingSearchUi?.getElements?.() || {};
    const startButton = document.getElementById("startCompanionLink");

    startButton?.addEventListener("click", () => {
      window.EverythingSearchUi?.setStatus?.(
        "Starting the local Companion. Approve the browser prompt if it appears.",
        "loading"
      );

      window.setTimeout(() => {
        onCheckAgain?.();
      }, 2500);
    });

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
    window.EverythingSearchUi?.setGuideExpanded?.(false);
    const guideButton = document.getElementById("toggleEverythingInstallGuideButton");
    if (guideButton) guideButton.textContent = "Simple Instructions";
  }

  ensureBrandStylesheet();

  return {
    officialDownloadUrl,
    companionDownloadUrl,
    startCompanionUrl,
    installInstructions,
    bindEvents,
    reset
  };
})();