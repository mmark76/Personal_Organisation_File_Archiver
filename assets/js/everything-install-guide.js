/* Everything and local companion installation guidance. */

window.EverythingInstallGuide = (() => {
  const officialDownloadUrl = "https://www.voidtools.com/downloads/";
  const everythingInstallerUrl = "https://www.voidtools.com/Everything-1.4.1.1032.x64-Setup.exe";
  const companionDownloadUrl = "https://github.com/mmark76/Personal_Organisation_File_Archiver/releases/latest/download/EverythingCompanion-Setup-win-x64.exe";
  const startCompanionUrl = "organizeyourpc-companion://start";
  const installInstructions = "Start the Companion if it is already installed. Otherwise install and start Everything first, then download and run EverythingCompanion-Setup-win-x64.exe.";
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
    if (!heading) return;

    let notice = document.getElementById("everythingSearchRequirementNotice");
    const isNewNotice = !notice;

    if (!notice) {
      notice = document.createElement("div");
      notice.id = "everythingSearchRequirementNotice";
      notice.setAttribute("role", "note");
    }

    notice.replaceChildren();

    const appendText = text => notice.appendChild(document.createTextNode(text));
    const applyEmphasisStyle = element => {
      element.style.color = "#ff4d4f";
      element.style.fontWeight = "800";
    };
    const appendEmphasis = text => {
      const emphasis = document.createElement("strong");
      emphasis.textContent = text;
      applyEmphasisStyle(emphasis);
      notice.appendChild(emphasis);
    };
    const appendDownloadLink = (text, href, downloadName) => {
      const link = document.createElement("a");
      link.textContent = text;
      link.href = href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("download", downloadName);
      link.setAttribute("aria-label", `Download ${text}`);
      link.title = `Download ${text}`;
      applyEmphasisStyle(link);
      link.style.cursor = "pointer";
      link.style.textDecoration = "underline";
      link.style.textUnderlineOffset = "2px";
      notice.appendChild(link);
    };

    appendText("To use the Search this PC feature in this app, install Everything using ");
    appendDownloadLink("Everything-1.4.1.1032.x64-Setup.exe", everythingInstallerUrl, "Everything-1.4.1.1032.x64-Setup.exe");
    appendText(" and install the Companion using ");
    appendDownloadLink("EverythingCompanion-Setup-win-x64.exe", companionDownloadUrl, "EverythingCompanion-Setup-win-x64.exe");
    appendText(". Both applications must then be running on this Windows PC.");

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

    if (isNewNotice || notice.nextElementSibling !== heading) {
      heading.insertAdjacentElement("beforebegin", notice);
    }
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
      description.textContent = "Start the Companion if it is already installed. Otherwise install and start Everything, then download and run EverythingCompanion-Setup-win-x64.exe.";
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
      companionButton.setAttribute("download", "EverythingCompanion-Setup-win-x64.exe");
    }

    if (guideButton && guideButton.getAttribute("aria-expanded") !== "true") {
      guideButton.textContent = "Simple Instructions";
    }

    if (guide) {
      const list = document.createElement("ol");
      [
        "If the Companion is already installed, select Start Companion and approve the browser prompt if it appears.",
        "If Everything is not installed, select Install Everything, download the current 64-bit installer, install it, and start Everything.",
        "If the Companion is not installed, select Install Companion to download EverythingCompanion-Setup-win-x64.exe.",
        "Double-click EverythingCompanion-Setup-win-x64.exe and complete the Windows installation.",
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
    everythingInstallerUrl,
    companionDownloadUrl,
    startCompanionUrl,
    installInstructions,
    bindEvents,
    reset
  };
})();