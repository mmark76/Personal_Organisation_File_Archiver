const PRIVACY_NOTICE_KEY = "personalFileAdvisorPrivacyNoticeAccepted";

function safeGetPrivacyNoticeValue() {
  try {
    return window.localStorage.getItem(PRIVACY_NOTICE_KEY);
  } catch (error) {
    return null;
  }
}

function safeSetPrivacyNoticeValue(value) {
  try {
    window.localStorage.setItem(PRIVACY_NOTICE_KEY, value);
  } catch (error) {
    // Local storage may be unavailable in some browser privacy modes.
  }
}

function showPrivacyNoticeIfNeeded() {
  const notice = document.getElementById("cookieNotice");
  if (!notice) return;

  const accepted = safeGetPrivacyNoticeValue() === "true";
  if (!accepted) {
    notice.classList.remove("hidden");
  }
}

function acceptCookieNotice() {
  safeSetPrivacyNoticeValue("true");
  hideCookieNotice();
}

function hideCookieNotice() {
  const notice = document.getElementById("cookieNotice");
  if (!notice) return;

  notice.classList.add("hidden");
}

window.acceptCookieNotice = acceptCookieNotice;
window.hideCookieNotice = hideCookieNotice;
window.showPrivacyNoticeIfNeeded = showPrivacyNoticeIfNeeded;

window.addEventListener("DOMContentLoaded", showPrivacyNoticeIfNeeded);
