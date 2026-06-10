/* Simple privacy notice, ready for future analytics consent expansion. */

window.AppPrivacyNotice = (() => {
  const storageKey = "organizeYourPcPrivacyNoticeAccepted";

  function getNotice() {
    return document.getElementById("privacyNotice");
  }

  function hasAccepted() {
    return localStorage.getItem(storageKey) === "true";
  }

  function showNoticeIfNeeded() {
    const notice = getNotice();
    if (!notice) return;
    notice.hidden = hasAccepted();
  }

  function acceptNotice() {
    localStorage.setItem(storageKey, "true");
    hideNotice();
  }

  function hideNotice() {
    const notice = getNotice();
    if (notice) notice.hidden = true;
  }

  return {
    showNoticeIfNeeded,
    acceptNotice,
    hideNotice
  };
})();
