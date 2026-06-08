const PRIVACY_NOTICE_KEY = "personalFileAdvisorPrivacyNoticeAccepted";

function getCookieNoticeElement() {
  return document.getElementById("cookieNotice");
}

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

function showCookieNotice() {
  const notice = getCookieNoticeElement();
  if (!notice) return;

  notice.hidden = false;
  notice.classList.remove("hidden");
  notice.style.display = "";
}

function hideCookieNotice() {
  const notice = getCookieNoticeElement();
  if (!notice) return;

  notice.classList.add("hidden");
  notice.hidden = true;
  notice.style.display = "none";
}

function showPrivacyNoticeIfNeeded() {
  const accepted = safeGetPrivacyNoticeValue() === "true";
  if (!accepted) {
    showCookieNotice();
  } else {
    hideCookieNotice();
  }
}

function acceptCookieNotice() {
  safeSetPrivacyNoticeValue("true");
  hideCookieNotice();
}

function initialiseCookieNoticeControls() {
  const acceptButton = document.getElementById("cookieAcceptButton");
  const laterButton = document.getElementById("cookieLaterButton");

  if (acceptButton) {
    acceptButton.addEventListener("click", acceptCookieNotice);
  }

  if (laterButton) {
    laterButton.addEventListener("click", hideCookieNotice);
  }

  showPrivacyNoticeIfNeeded();
}

window.acceptCookieNotice = acceptCookieNotice;
window.hideCookieNotice = hideCookieNotice;
window.showPrivacyNoticeIfNeeded = showPrivacyNoticeIfNeeded;

window.addEventListener("DOMContentLoaded", initialiseCookieNoticeControls);
