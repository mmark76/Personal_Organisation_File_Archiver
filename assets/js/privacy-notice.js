/* Informational cookie-less analytics notice; dismissal is a local display preference. */

window.AppPrivacyNotice = (() => {
  const DISMISSED_KEY = "organize-your-pc:analytics-notice-dismissed";

  function wasDismissed() {
    try {
      return window.localStorage.getItem(DISMISSED_KEY) === "1";
    } catch {
      return false;
    }
  }

  function rememberDismissal() {
    try {
      window.localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // The notice can still be closed when storage is unavailable.
    }
  }
  function getNotice() {
    return document.getElementById("privacyNotice");
  }

  function showNoticeIfNeeded() {
    const notice = getNotice();
    if (notice) notice.hidden = wasDismissed();
  }

  function showNotice() {
    const notice = getNotice();
    if (!notice) return;
    notice.hidden = false;
    document.getElementById("closeAnalyticsNoticeButton")?.focus();
  }

  function hideNotice() {
    const notice = getNotice();
    if (notice) notice.hidden = true;
    rememberDismissal();
  }

  return { showNoticeIfNeeded, showNotice, hideNotice };
})();
