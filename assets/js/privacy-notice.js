/* Informational cookie-less analytics notice. It stores no choice. */

window.AppPrivacyNotice = (() => {
  function getNotice() {
    return document.getElementById("privacyNotice");
  }

  function showNoticeIfNeeded() {
    const notice = getNotice();
    if (notice) notice.hidden = false;
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
  }

  return { showNoticeIfNeeded, showNotice, hideNotice };
})();
