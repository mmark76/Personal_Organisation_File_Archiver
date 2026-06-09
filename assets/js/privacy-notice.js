const privacyNoticeStorageKey = "organizeYourPcPrivacyNoticeAccepted";

function getCookieNoticeElement() {
  return document.getElementById("cookieNotice");
}

function hasAcceptedPrivacyNotice() {
  try {
    return localStorage.getItem(privacyNoticeStorageKey) === "true";
  } catch (error) {
    return false;
  }
}

function rememberPrivacyNoticeAccepted() {
  try {
    localStorage.setItem(privacyNoticeStorageKey, "true");
  } catch (error) {
    // If local storage is unavailable, the notice can still be hidden for the current page view.
  }
}

function showCookieNotice() {
  const notice = getCookieNoticeElement();
  if (!notice) return;

  notice.hidden = false;
  notice.removeAttribute("hidden");
  notice.classList.remove("hidden");
  notice.style.removeProperty("display");
}

function hideCookieNotice() {
  const notice = getCookieNoticeElement();
  if (!notice) return;

  notice.classList.add("hidden");
  notice.hidden = true;
}

function acceptCookieNotice() {
  rememberPrivacyNoticeAccepted();
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

  if (hasAcceptedPrivacyNotice()) {
    hideCookieNotice();
  } else {
    showCookieNotice();
  }
}

window.hideCookieNotice = hideCookieNotice;
window.showCookieNotice = showCookieNotice;

window.addEventListener("DOMContentLoaded", initialiseCookieNoticeControls);
