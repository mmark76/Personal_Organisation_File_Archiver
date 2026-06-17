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

  if (pageErrors.length > 0) {
    throw new Error(`Unhandled page errors:\n${pageErrors.join("\n")}`);
  }

  console.log(summary);
  console.log(`Node ID uniqueness check passed; next ID is ${nodeIdCheck.nextId}.`);
} finally {
  await browser.close();
}
