/* Optional analytics consent notice. */

window.AppPrivacyNotice = (() => {
  function getNotice() {
    return document.getElementById("privacyNotice");
  }

  function updateStatus() {
    const status = document.getElementById("analyticsConsentStatus");
    if (!status) return;

    const consent = window.AppAnalytics.getConsent();
    status.textContent = consent === "granted"
      ? "Current choice: optional analytics allowed."
      : consent === "denied"
        ? "Current choice: optional analytics rejected."
        : "No analytics choice has been saved yet.";
  }

  function showNoticeIfNeeded() {
    const notice = getNotice();
    if (!notice) return;
    updateStatus();
    notice.hidden = window.AppAnalytics.getConsent() !== null;
  }

  function showNotice() {
    const notice = getNotice();
    if (!notice) return;
    updateStatus();
    notice.hidden = false;
    document.getElementById("allowAnalyticsButton")?.focus();
  }

  function allowAnalytics() {
    window.AppAnalytics.grantConsent();
    hideNotice();
  }

  function rejectAnalytics() {
    window.AppAnalytics.denyConsent();
    hideNotice();
  }

  function hideNotice() {
    const notice = getNotice();
    if (notice) notice.hidden = true;
  }

  return {
    showNoticeIfNeeded,
    showNotice,
    allowAnalytics,
    rejectAnalytics,
    hideNotice
  };
})();
