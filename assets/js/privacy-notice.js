const consentPreferencesStorageKey = "organizeYourPcConsentPreferences";
const legacyPrivacyNoticeStorageKey = "organizeYourPcPrivacyNoticeAccepted";

function getCookieNoticeElement() {
  return document.getElementById("cookieNotice");
}

function getDefaultConsentPreferences() {
  return {
    version: 1,
    essential: true,
    analytics: false,
    ads: false,
    savedAt: null
  };
}

function readConsentPreferences() {
  try {
    const savedPreferences = localStorage.getItem(consentPreferencesStorageKey);
    if (!savedPreferences) return null;

    const parsedPreferences = JSON.parse(savedPreferences);

    return {
      ...getDefaultConsentPreferences(),
      ...parsedPreferences,
      essential: true
    };
  } catch (error) {
    return null;
  }
}

function hasSavedConsentPreferences() {
  return Boolean(readConsentPreferences());
}

function saveConsentPreferences(preferences) {
  const consentPreferences = {
    ...getDefaultConsentPreferences(),
    ...preferences,
    essential: true,
    savedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(consentPreferencesStorageKey, JSON.stringify(consentPreferences));
    localStorage.removeItem(legacyPrivacyNoticeStorageKey);
  } catch (error) {
    // If local storage is unavailable, the notice can still be hidden for the current page view.
  }

  window.organizeYourPcConsentPreferences = consentPreferences;
  return consentPreferences;
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

function getConsentCheckbox(id) {
  return document.getElementById(id);
}

function syncConsentPreferenceControls(preferences) {
  const analyticsCheckbox = getConsentCheckbox("analyticsConsentCheckbox");
  const adsCheckbox = getConsentCheckbox("adsConsentCheckbox");

  if (analyticsCheckbox) {
    analyticsCheckbox.checked = Boolean(preferences.analytics);
  }

  if (adsCheckbox) {
    adsCheckbox.checked = Boolean(preferences.ads);
  }
}

function toggleCookiePreferences() {
  const preferencesPanel = document.getElementById("cookiePreferences");
  const saveButton = document.getElementById("cookieSavePreferencesButton");

  if (!preferencesPanel) return;

  const shouldShowPreferences = preferencesPanel.classList.contains("hidden");
  preferencesPanel.classList.toggle("hidden", !shouldShowPreferences);
  preferencesPanel.hidden = !shouldShowPreferences;

  if (saveButton) {
    saveButton.classList.toggle("hidden", !shouldShowPreferences);
    saveButton.hidden = !shouldShowPreferences;
  }
}

function acceptAllConsentOptions() {
  saveConsentPreferences({
    analytics: true,
    ads: true
  });
  hideCookieNotice();
}

function rejectOptionalConsentOptions() {
  saveConsentPreferences({
    analytics: false,
    ads: false
  });
  hideCookieNotice();
}

function saveSelectedConsentPreferences() {
  const analyticsCheckbox = getConsentCheckbox("analyticsConsentCheckbox");
  const adsCheckbox = getConsentCheckbox("adsConsentCheckbox");

  saveConsentPreferences({
    analytics: analyticsCheckbox ? analyticsCheckbox.checked : false,
    ads: adsCheckbox ? adsCheckbox.checked : false
  });
  hideCookieNotice();
}

function initialiseCookieNoticeControls() {
  const acceptAllButton = document.getElementById("cookieAcceptAllButton");
  const rejectOptionalButton = document.getElementById("cookieRejectOptionalButton");
  const manageButton = document.getElementById("cookieManageButton");
  const savePreferencesButton = document.getElementById("cookieSavePreferencesButton");
  const savedPreferences = readConsentPreferences();

  syncConsentPreferenceControls(savedPreferences || getDefaultConsentPreferences());
  window.organizeYourPcConsentPreferences = savedPreferences || getDefaultConsentPreferences();

  if (acceptAllButton) {
    acceptAllButton.addEventListener("click", acceptAllConsentOptions);
  }

  if (rejectOptionalButton) {
    rejectOptionalButton.addEventListener("click", rejectOptionalConsentOptions);
  }

  if (manageButton) {
    manageButton.addEventListener("click", toggleCookiePreferences);
  }

  if (savePreferencesButton) {
    savePreferencesButton.addEventListener("click", saveSelectedConsentPreferences);
  }

  if (hasSavedConsentPreferences()) {
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
window.readConsentPreferences = readConsentPreferences;
window.copyFileAdvice = copyFileAdvice;
window.copyTreeOutput = copyTreeOutput;

window.addEventListener("DOMContentLoaded", initialiseCookieNoticeControls);
