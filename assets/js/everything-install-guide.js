/* Everything installation guidance and official download link behaviour. */

window.EverythingInstallGuide = (() => {
  const officialDownloadUrl = "https://www.voidtools.com/downloads/";
  const installInstructions = "Download Everything from voidtools, install it, start it, then return here and refresh or select Check Again.";
  let bound = false;

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

  function configureDownloadLink() {
    const installButton = createPermanentInstallButton();
    const { downloadLink } = window.EverythingSearchUi?.getElements?.() || {};

    [installButton, downloadLink].forEach(link => {
      if (!link) return;
      link.href = officialDownloadUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });
  }

  function bindEvents(onCheckAgain) {
    configureDownloadLink();
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
    configureDownloadLink();
    window.EverythingSearchUi?.setGuideExpanded?.(false);
  }

  return {
    officialDownloadUrl,
    installInstructions,
    bindEvents,
    reset
  };
})();
