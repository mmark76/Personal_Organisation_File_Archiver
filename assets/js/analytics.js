/* Optional, consent-based Google Analytics usage measurement. */

window.AppAnalytics = (() => {
  const measurementId = "G-EJT3VRE1W1";
  const consentStorageKey = "organizeYourPcAnalyticsConsent";
  const allowedEvents = new Set([
    "open_file_archive",
    "open_folder_archive",
    "file_archive_completed",
    "folder_archive_completed",
    "folder_tree_created",
    "archive_failed"
  ]);
  const productionHosts = new Set(["organizeyourpc.com", "www.organizeyourpc.com"]);

  let sessionConsent = null;
  let analyticsConfigured = false;
  let analyticsScriptAdded = false;

  function getStoredConsent() {
    try {
      const value = localStorage.getItem(consentStorageKey);
      return value === "granted" || value === "denied" ? value : null;
    } catch (error) {
      return sessionConsent;
    }
  }

  function storeConsent(value) {
    sessionConsent = value;

    try {
      localStorage.setItem(consentStorageKey, value);
    } catch (error) {
      // The current-session choice still applies when storage is unavailable.
    }
  }

  function ensureGoogleTagQueue() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
      window.dataLayer.push(arguments);
    };
  }

  function setDefaultConsent() {
    ensureGoogleTagQueue();
    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
  }

  function isProductionWebsite() {
    return location.protocol === "https:" && productionHosts.has(location.hostname.toLowerCase());
  }

  function addAnalyticsScript() {
    if (analyticsScriptAdded || !isProductionWebsite()) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.dataset.optionalAnalytics = "true";
    document.head.appendChild(script);
    analyticsScriptAdded = true;
  }

  function configureAnalytics() {
    if (analyticsConfigured || getStoredConsent() !== "granted") return;

    ensureGoogleTagQueue();
    window.gtag("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    analyticsConfigured = true;
    addAnalyticsScript();
  }

  function initialize() {
    setDefaultConsent();
    if (getStoredConsent() === "granted") configureAnalytics();
  }

  function grantConsent() {
    storeConsent("granted");
    configureAnalytics();
  }

  function clearAnalyticsCookies() {
    const cookieNames = document.cookie
      .split(";")
      .map(cookie => cookie.split("=")[0].trim())
      .filter(name => name === "_ga" || name.startsWith("_ga_"));
    const domains = new Set([location.hostname, `.${location.hostname}`]);

    if (location.hostname.endsWith("organizeyourpc.com")) {
      domains.add(".organizeyourpc.com");
    }

    cookieNames.forEach(name => {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
      domains.forEach(domain => {
        document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}; SameSite=Lax`;
      });
    });
  }

  function denyConsent() {
    storeConsent("denied");
    ensureGoogleTagQueue();
    window.gtag("consent", "update", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
    clearAnalyticsCookies();

    if (analyticsScriptAdded && isProductionWebsite()) {
      location.reload();
    }
  }

  function sanitizeEventParameters(eventName, parameters) {
    if (eventName !== "archive_failed") return {};

    const archiveType = parameters?.archive_type;
    return archiveType === "file" || archiveType === "folder"
      ? { archive_type: archiveType }
      : {};
  }

  function trackEvent(eventName, parameters = {}) {
    if (getStoredConsent() !== "granted" || !allowedEvents.has(eventName)) return false;

    configureAnalytics();
    window.gtag("event", eventName, sanitizeEventParameters(eventName, parameters));
    return true;
  }

  return {
    initialize,
    getConsent: getStoredConsent,
    grantConsent,
    denyConsent,
    trackEvent
  };
})();
