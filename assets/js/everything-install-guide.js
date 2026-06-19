/* Everything and local companion installation guidance. */

window.EverythingInstallGuide = (() => {
  const officialDownloadUrl = "https://www.voidtools.com/downloads/";
  const companionDownloadUrl = "https://github.com/mmark76/Personal_Organisation_File_Archiver/releases/latest/download/EverythingCompanion-win-x64.zip";
  const startCompanionUrl = "organizeyourpc-companion://start";
  const installInstructions = "Start the Companion if it is already installed. Otherwise install Everything first, then extract the Companion ZIP and run Install-EverythingCompanion.cmd. Do not run EverythingCompanion.exe directly because it only runs temporarily and does not install automatic startup.";
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
    notice.setAttribute("role", "note");
    notice.textContent = "To use Search this PC, both Everything and the Organize Your PC Companion must be installed and running on this Windows computer.";

    Object.assign(notice.style, {
      display: "block",
      width: "100%",
      boxSizing: "border-box",
      margin: "0 0 4px",
      padding: "12px 14px",
      border: "1px solid #f59e0b",
      borderRadius: "12px",
      background: "rgba(245, 158, 11, 0.08)",
      color: "#ffffff",
      fontSize: "13px",
      fontWeight: "650",
      lineHeight: "1.5",
      textAlign: "center"
    });

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
      description.textContent = "Start the Companion if it is already installed. Otherwise install Everything, then extract the Companion ZIP and run Install-EverythingCompanion.cmd. Do not run EverythingCompanion.exe directly.";
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
        "If the Companion is not installed, select Install Companion and extract the downloaded ZIP.",
        "Inside the extracted folder, double-click Install-EverythingCompanion.cmd. Do not run EverythingCompanion.exe directly: it only runs temporarily and does not install the Companion or enable automatic startup after Windows restarts.",
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureSearchRequirementNotice, { once: true });
  } else {
    ensureSearchRequirementNotice();
  }

  return {
    officialDownloadUrl,
    companionDownloadUrl,
    startCompanionUrl,
    installInstructions,
    bindEvents,
    reset
  };
})();