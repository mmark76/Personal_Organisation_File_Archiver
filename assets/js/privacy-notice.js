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

async function writeTextToClipboard(text, successMessage) {
  try {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      throw new Error("Clipboard API is not available in this browser.");
    }

    await navigator.clipboard.writeText(text);

    if (successMessage) {
      alert(successMessage);
    }
  } catch (error) {
    alert("Copy failed. Please select the text manually and copy it.");
  }
}

function copyFileAdvice() {
  const output = document.getElementById("fileDestinationOutput");
  const text = output ? output.textContent : "";
  writeTextToClipboard(text, "File destination advice copied.");
}

function copyTreeOutput() {
  const output = document.getElementById("treeOutput");
  const text = output ? output.textContent : "";
  writeTextToClipboard(text, "Folder structure copied.");
}

window.hideCookieNotice = hideCookieNotice;
window.showCookieNotice = showCookieNotice;
window.copyFileAdvice = copyFileAdvice;
window.copyTreeOutput = copyTreeOutput;

window.addEventListener("DOMContentLoaded", initialiseCookieNoticeControls);
