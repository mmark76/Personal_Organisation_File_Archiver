/* Everything installation guidance and official download link behaviour. */

window.EverythingInstallGuide = (() => {
  const officialDownloadUrl = "https://www.voidtools.com/downloads/";
  let bound = false;

  function configureDownloadLink() {
    const { downloadLink } = window.EverythingSearchUi?.getElements?.() || {};
    if (!downloadLink) return;

    downloadLink.href = officialDownloadUrl;
    downloadLink.target = "_blank";
    downloadLink.rel = "noopener noreferrer";
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
    bindEvents,
    reset
  };
})();
