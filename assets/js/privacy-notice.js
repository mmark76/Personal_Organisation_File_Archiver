const PRIVACY_NOTICE_KEY = "personalFileAdvisorPrivacyNoticeAccepted";

function getCookieNoticeElement() {
  return document.getElementById("cookieNotice");
}

function hasAcceptedCookieNotice() {
  try {
    return window.localStorage.getItem(PRIVACY_NOTICE_KEY) === "true";
  } catch (error) {
    return false;
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

function acceptCookieNotice() {
  try {
    window.localStorage.setItem(PRIVACY_NOTICE_KEY, "true");
  } catch (error) {
    // Local storage may be unavailable in some browser privacy modes.
  }

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

  if (hasAcceptedCookieNotice()) {
    hideCookieNotice();
  } else {
    showCookieNotice();
  }
}

window.acceptCookieNotice = acceptCookieNotice;
window.hideCookieNotice = hideCookieNotice;
window.showCookieNotice = showCookieNotice;

window.addEventListener("DOMContentLoaded", initialiseCookieNoticeControls);