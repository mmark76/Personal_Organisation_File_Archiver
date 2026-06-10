/* Simple local privacy notice preference. */

window.AppPrivacyNotice = (() => {
  const storageKey = "personalMemoryBasedFileArchiverPrivacyNoticeAccepted";
  const legacyStorageKey = "organizeYourPcPrivacyNoticeAccepted";

  function getNotice() {
    return document.getElementById("privacyNotice");
  }

  function hasAccepted() {
    return localStorage.getItem(storageKey) === "true" || localStorage.getItem(legacyStorageKey) === "true";
  }

  function showNoticeIfNeeded() {
    const notice = getNotice();
    if (!notice) return;
    notice.hidden = hasAccepted();
  }

  function acceptNotice() {
    localStorage.setItem(storageKey, "true");
    localStorage.removeItem(legacyStorageKey);
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