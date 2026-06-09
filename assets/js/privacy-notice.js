function getCookieNoticeElement() {
  return document.getElementById("cookieNotice");
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

function initialiseCookieNoticeControls() {
  const acceptButton = document.getElementById("cookieAcceptButton");
  const laterButton = document.getElementById("cookieLaterButton");

  if (acceptButton) {
    acceptButton.addEventListener("click", hideCookieNotice);
  }

  if (laterButton) {
    laterButton.addEventListener("click", hideCookieNotice);
  }

  showCookieNotice();
}

window.hideCookieNotice = hideCookieNotice;
window.showCookieNotice = showCookieNotice;

window.addEventListener("DOMContentLoaded", initialiseCookieNoticeControls);