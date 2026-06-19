import { chromium } from "playwright";

const baseUrl = (process.env.TEST_BASE_URL || "http://127.0.0.1:4173").replace(/\/$/, "");
const testUrl = `${baseUrl}/tests/archive-core-tests.html`;
const appUrl = `${baseUrl}/index.html`;
const browser = await chromium.launch({ headless: true });

async function runCoreBrowserTests() {
  const page = await browser.newPage();
  const pageErrors = [];

  page.on("pageerror", error => {
    pageErrors.push(error.message);
  });

  try {
    await page.goto(testUrl, { waitUntil: "load", timeout: 60_000 });

    await page.waitForFunction(() => {
      const summary = document.getElementById("summary")?.textContent || "";
      return /^\d+ of \d+ tests passed\.$/.test(summary);
    }, { timeout: 120_000 });

    const summary = (await page.locator("#summary").textContent())?.trim() || "";
    const match = summary.match(/^(\d+) of (\d+) tests passed\.$/);
    const failedTests = await page.locator(".test-result.fail").allTextContents();

    if (!match) {
      throw new Error(`Unexpected browser test summary: ${summary}`);
    }

    const passed = Number(match[1]);
    const total = Number(match[2]);

    if (passed !== total || failedTests.length > 0) {
      throw new Error([
        `Browser tests failed: ${summary}`,
        ...failedTests.map(result => result.trim())
      ].join("\n"));
    }

    const nodeIdCheck = await page.evaluate(() => {
      window.AppState.setActiveMode("buildTree");
      window.FolderTree.loadExampleTree();

      const ids = [];
      const visit = node => {
        if (!node) return;
        ids.push(node.id);
        (node.children || []).forEach(visit);
      };

      visit(window.AppState.state.tree);

      const seen = new Set();
      const duplicates = [];
      for (const id of ids) {
        if (seen.has(id)) duplicates.push(id);
        seen.add(id);
      }

      const nextId = window.AppState.getNextNodeId();
      return {
        duplicates: [...new Set(duplicates)],
        nextId,
        nextIdAlreadyExists: seen.has(nextId)
      };
    });

    if (nodeIdCheck.duplicates.length > 0) {
      throw new Error(`Duplicate node IDs found: ${nodeIdCheck.duplicates.join(", ")}`);
    }

    if (nodeIdCheck.nextIdAlreadyExists) {
      throw new Error(`The next generated node ID already exists: ${nodeIdCheck.nextId}`);
    }

    const sessionCheck = await page.evaluate(async () => {
      const originalFetch = window.fetch;
      const requests = [];
      const sessionToken = "ci-session-token";
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      try {
        window.EverythingSearch.clearSession();
        window.fetch = async (url, options = {}) => {
          const requestUrl = String(url);
          requests.push({
            url: requestUrl,
            sessionHeader: new Headers(options.headers || {}).get("X-Everything-Session")
          });

          if (requestUrl.includes("/api/health")) {
            return new Response(JSON.stringify({
              status: "ok",
              service: "EverythingCompanion",
              everythingAvailable: true,
              backend: "sdk",
              message: "Ready"
            }), {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                "X-Everything-Session": sessionToken,
                "X-Everything-Session-Expires": expiresAt
              }
            });
          }

          if (requestUrl.includes("/api/search")) {
            return new Response(JSON.stringify({
              source: "sdk",
              query: "session-check",
              type: "all",
              limit: 1,
              count: 0,
              results: []
            }), {
              status: 200,
              headers: { "Content-Type": "application/json" }
            });
          }

          throw new Error(`Unexpected request: ${requestUrl}`);
        };

        await window.EverythingSearch.fetchHealth();

        document.getElementById("everythingSearchInput").value = "session-check";
        document.getElementById("everythingSearchTypeSelect").value = "all";
        document.getElementById("everythingSearchLimitInput").value = "1";
        await window.EverythingSearch.search({ preventDefault() {} });

        const searchRequest = requests.find(request => request.url.includes("/api/search"));
        return {
          sessionHeader: searchRequest?.sessionHeader || null,
          tokenLeakedInUrl: requests.some(request => request.url.includes(sessionToken))
        };
      } finally {
        window.fetch = originalFetch;
        window.EverythingSearch.clearSession();
      }
    });

    if (sessionCheck.sessionHeader !== "ci-session-token") {
      throw new Error("Everything search did not send the temporary session token in the request header.");
    }

    if (sessionCheck.tokenLeakedInUrl) {
      throw new Error("Everything session token must never be included in a request URL.");
    }

    if (pageErrors.length > 0) {
      throw new Error(`Unhandled page errors:\n${pageErrors.join("\n")}`);
    }

    console.log(summary);
    console.log(`Node ID uniqueness check passed; next ID is ${nodeIdCheck.nextId}.`);
    console.log("Everything session header check passed.");
  } finally {
    await page.close();
  }
}

async function runEverythingSearchUiTest() {
  const page = await browser.newPage();
  const pageErrors = [];

  page.on("pageerror", error => {
    pageErrors.push(error.message);
  });

  await page.addInitScript(() => {
    const originalFetch = window.fetch.bind(window);
    const sessionToken = "ui-session-token";
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    window.__everythingUiTestState = {
      available: true,
      requests: []
    };

    window.fetch = async (input, options = {}) => {
      const requestUrl = String(input);
      const state = window.__everythingUiTestState;

      if (!requestUrl.startsWith("http://127.0.0.1:51337/")) {
        return originalFetch(input, options);
      }

      state.requests.push({
        url: requestUrl,
        sessionHeader: new Headers(options.headers || {}).get("X-Everything-Session")
      });

      if (!state.available) {
        throw new TypeError("Local companion unavailable");
      }

      if (requestUrl.includes("/api/health")) {
        return new Response(JSON.stringify({
          status: "ok",
          service: "EverythingCompanion",
          everythingAvailable: true,
          backend: "sdk",
          message: "Ready"
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "X-Everything-Session": sessionToken,
            "X-Everything-Session-Expires": expiresAt
          }
        });
      }

      if (requestUrl.includes("/api/search")) {
        return new Response(JSON.stringify({
          source: "sdk",
          query: "passport",
          type: "file",
          limit: 50,
          count: 1,
          results: [
            {
              name: "passport.pdf",
              path: "C:/Users/Test/Documents/passport.pdf",
              kind: "File"
            }
          ]
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }

      throw new Error(`Unexpected Everything request: ${requestUrl}`);
    };
  });

  try {
    await page.goto(appUrl, { waitUntil: "load", timeout: 60_000 });
    await page.waitForFunction(() => window.EverythingSearch?.initialized === true, { timeout: 30_000 });

    const choiceCount = await page.locator("#mainChoiceScreen .choice-card").count();
    if (choiceCount !== 5) {
      throw new Error(`Expected five main choices after Everything integration, found ${choiceCount}.`);
    }

    await page.locator("#openEverythingSearchButton").click();
    await page.waitForFunction(() => {
      return document.getElementById("everythingSearchStatus")?.textContent.includes("Everything is ready through sdk.");
    }, { timeout: 30_000 });

    if (!(await page.locator("#everythingSearchScreen").isVisible())) {
      throw new Error("The dedicated Everything search screen did not open.");
    }

    await page.locator("#everythingSearchInput").fill("passport");
    await page.locator("#everythingSearchTypeSelect").selectOption("file");
    await page.locator("#everythingSearchExtensionSelect").selectOption("pdf");
    await page.locator("#everythingSearchModifiedSelect").selectOption("last30days");
    await page.locator("#everythingSearchSizeSelect").selectOption("over128mb");
    await page.locator("#everythingSearchMatchSelect").selectOption("startswith");
    await page.locator("#everythingSearchLimitInput").selectOption("50");
    await page.locator("#everythingSearchLocationInput").fill("C:\\Users\\Test\\Documents");
    await page.locator("#everythingSearchButton").click();

    await page.waitForFunction(() => {
      return document.getElementById("everythingSearchStatus")?.textContent === "Everything found 1 local result(s).";
    }, { timeout: 30_000 });

    const resultText = await page.locator("#everythingSearchResults").innerText();
    if (!resultText.includes("passport.pdf") || !resultText.includes("C:/Users/Test/Documents/passport.pdf")) {
      throw new Error("The dedicated Everything screen did not render the mocked local result.");
    }

    const requestCheck = await page.evaluate(() => {
      const requests = window.__everythingUiTestState.requests;
      const searchRequest = requests.find(request => request.url.includes("/api/search"));
      const searchUrl = searchRequest ? new URL(searchRequest.url) : null;

      return {
        hasSearchRequest: Boolean(searchRequest),
        searchSessionHeader: searchRequest?.sessionHeader || null,
        tokenLeakedInUrl: requests.some(request => request.url.includes("ui-session-token")),
        type: searchUrl?.searchParams.get("type") || null,
        extension: searchUrl?.searchParams.get("ext") || null,
        modified: searchUrl?.searchParams.get("modified") || null,
        size: searchUrl?.searchParams.get("size") || null,
        match: searchUrl?.searchParams.get("match") || null,
        limit: searchUrl?.searchParams.get("limit") || null,
        location: searchUrl?.searchParams.get("location") || null
      };
    });

    if (!requestCheck.hasSearchRequest) {
      throw new Error("The dedicated Everything screen did not call the local search endpoint.");
    }

    if (requestCheck.searchSessionHeader !== "ui-session-token") {
      throw new Error("The dedicated Everything screen did not send the session token in the request header.");
    }

    if (requestCheck.tokenLeakedInUrl) {
      throw new Error("The dedicated Everything screen leaked the session token into a URL.");
    }

    const expectedFilters = {
      type: "file",
      extension: "pdf",
      modified: "last30days",
      size: "over128mb",
      match: "startswith",
      limit: "50",
      location: "C:\\Users\\Test\\Documents"
    };

    for (const [key, expectedValue] of Object.entries(expectedFilters)) {
      if (requestCheck[key] !== expectedValue) {
        throw new Error(`Everything filter ${key} was ${requestCheck[key]} instead of ${expectedValue}.`);
      }
    }

    await page.locator("#everythingSearchClearFiltersButton").click();
    const clearedFilters = await page.evaluate(() => ({
      type: document.getElementById("everythingSearchTypeSelect").value,
      extension: document.getElementById("everythingSearchExtensionSelect").value,
      modified: document.getElementById("everythingSearchModifiedSelect").value,
      size: document.getElementById("everythingSearchSizeSelect").value,
      match: document.getElementById("everythingSearchMatchSelect").value,
      limit: document.getElementById("everythingSearchLimitInput").value,
      location: document.getElementById("everythingSearchLocationInput").value
    }));

    if (
      clearedFilters.type !== "all" ||
      clearedFilters.extension !== "" ||
      clearedFilters.modified !== "any" ||
      clearedFilters.size !== "any" ||
      clearedFilters.match !== "contains" ||
      clearedFilters.limit !== "20" ||
      clearedFilters.location !== ""
    ) {
      throw new Error("Clear filters did not restore the default Everything search filters.");
    }

    await page.evaluate(() => {
      window.__everythingUiTestState.available = false;
      window.EverythingSearch.clearSession();
      return window.EverythingSearch.checkAvailability();
    });

    if (!(await page.locator("#everythingSetupPanel").isVisible())) {
      throw new Error("The setup panel did not appear when the local companion became unavailable.");
    }

    const downloadHref = await page.locator("#everythingDownloadLink").getAttribute("href");
    if (downloadHref !== "https://www.voidtools.com/downloads/") {
      throw new Error(`Unexpected Everything download URL: ${downloadHref}`);
    }

    await page.locator("#toggleEverythingInstallGuideButton").click();
    if (!(await page.locator("#everythingInstallGuide").isVisible())) {
      throw new Error("The Everything installation guide did not open.");
    }

    await page.locator("#everythingSearchScreen .back-to-main-button").click();
    if (!(await page.locator("#mainChoiceScreen").isVisible())) {
      throw new Error("Back to main choices did not return from the Everything search screen.");
    }

    if (pageErrors.length > 0) {
      throw new Error(`Unhandled Everything UI page errors:\n${pageErrors.join("\n")}`);
    }

    console.log("Everything dedicated-screen UI and basic-filter test passed.");
  } finally {
    await page.close();
  }
}

try {
  await runCoreBrowserTests();
  await runEverythingSearchUiTest();
} finally {
  await browser.close();
}
