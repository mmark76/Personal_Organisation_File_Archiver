/* Aggregate page-view counter. It deliberately has no event-tracking API. */

window.AppAnalytics = (() => {
  const scriptId = "cookieless-analytics";
  const scriptUrl = "https://analytics.markellosecosystem.com/v1/script.js";
  const productionHosts = new Set(["organizeyourpc.com", "www.organizeyourpc.com"]);

  function initialize() {
    if (
      location.protocol !== "https:"
      || !productionHosts.has(location.hostname.toLowerCase())
      || document.getElementById(scriptId)
    ) {
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = scriptUrl;
    document.head.appendChild(script);
  }

  return { initialize };
})();
