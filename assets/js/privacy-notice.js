const PRIVACY_NOTICE_KEY = "personalFileAdvisorPrivacyNoticeAccepted";

function showPrivacyNoticeIfNeeded() {
  const notice = document.getElementById("cookieNotice");
  if (!notice) return;

  const accepted = window.localStorage.getItem(PRIVACY_NOTICE_KEY) === "true";
  if (!accepted) {
    notice.classList.remove("hidden");
  }
}

function acceptCookieNotice() {
  window.localStorage.setItem(PRIVACY_NOTICE_KEY, "true");
  hideCookieNotice();
}

function hideCookieNotice() {
  const notice = document.getElementById("cookieNotice");
  if (!notice) return;

  notice.classList.add("hidden");
}

window.addEventListener("DOMContentLoaded", showPrivacyNoticeIfNeeded);
