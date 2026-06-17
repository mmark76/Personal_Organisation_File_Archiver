import { chromium } from "playwright";

const baseUrl = (process.env.TEST_BASE_URL || "http://127.0.0.1:4173").replace(/\/$/, "");
const testUrl = `${baseUrl}/tests/archive-core-tests.html`;
const browser = await chromium.launch({ headless: true });
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
  await browser.close();
}
