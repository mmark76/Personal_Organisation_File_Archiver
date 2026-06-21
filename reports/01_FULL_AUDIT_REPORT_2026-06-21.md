# FULL AUDIT REPORT

## Personal Organisation File Archiver / Organize Your PC

**Repository:** `mmark76/Personal_Organisation_File_Archiver`  
**Repository URL:** https://github.com/mmark76/Personal_Organisation_File_Archiver  
**Audit type:** Baseline Audit — read-only review  
**Baseline branch:** `main`  
**Baseline commit:** `2ee6866d7a05d83f6379f2ab14674e02ff52c713`  
**Baseline commit message:** `Force-close the Companion during installer upgrades (#10)`  
**Commit timestamp:** 2026-06-21 13:12:23 UTC  
**Audit timestamp:** 2026-06-21 17:53 Asia/Nicosia  
**Auditor:** ChatGPT  
**Code modifications during audit:** None  

---

## 1. Executive Summary

The repository contains a thoughtfully designed local-first browser application and a Windows-only .NET companion service for Everything search. The strongest parts of the implementation are the controls protecting the user's files, the privacy-oriented browser/companion boundary, input validation, conservative archive limits, duplicate-safe naming, permission checks, destination containment checks, rollback attempts, and consent-based analytics.

The application core is materially safer than a typical early-stage personal file utility. In particular:

- archive actions copy rather than move or delete originals;
- existing files and folders are not overwritten;
- the folder archive path is checked against the source;
- unusually large archive operations are stopped before output is created;
- incomplete archive output is removed when possible;
- cross-tab and same-page archive concurrency are controlled;
- the Everything companion binds to loopback only;
- browser origins are allowlisted;
- search sessions are short-lived, random, memory-only, and origin-bound;
- search input and filters are validated on both client and server;
- full paths are redacted by default;
- analytics is disabled by default and loaded only after consent.

However, the repository is **not yet release-hardened**. The most important risks are outside the core archive algorithm:

1. Three obsolete, self-modifying GitHub Actions workflows retain `contents: write`, commit directly, push directly, and reference files that no longer exist.
2. The release chain downloads a mutable third-party SDK archive at build time without a pinned version or checksum, produces unsigned executables, and overwrites a mutable `latest` release.
3. GitHub Pages deployment runs independently from the CI workflow, so a commit can be deployed even when its tests fail.
4. The .NET companion has no dedicated automated test project, despite containing security-sensitive origin, session, validation, process, and native SDK logic.
5. The native Everything SDK backend has no explicit request serialization even though its API uses shared global query state.
6. Cancellation and timeout handling are incomplete for both native SDK queries and the `es.exe` fallback.
7. Imported folder-tree JSON has semantic validation but no file-size, depth, or node-count limits.
8. Several files have grown into mixed-responsibility maintenance hotspots, and compatibility/fallback code is duplicated.

### Overall baseline judgment

**Moderate engineering risk, with a strong safety/privacy core and weak release/supply-chain hardening.**

No confirmed critical vulnerability was found in the reviewed source. The core app is suitable for controlled personal testing, but the public installer/release pipeline should be hardened before it is treated as a mature, broadly distributed Windows product.

### Finding totals

| Severity | Count |
|---|---:|
| Critical | 0 |
| High | 3 |
| Medium | 8 |
| Low | 5 |
| Informational / strengths | 10 |

---

## 2. Scope

The audit covered:

- repository metadata and baseline identification;
- static HTML, CSS and JavaScript architecture;
- folder-tree creation, import, rendering and state management;
- file and folder archive operations;
- File System Access API permission and path handling;
- rollback and concurrency logic;
- Everything browser client;
- .NET 8 Everything companion service;
- session, origin, CORS, Private Network Access and rate-limit controls;
- Everything SDK and `es.exe` backends;
- analytics and privacy controls;
- browser test harness and Playwright runner;
- CI, GitHub Pages deployment and release workflows;
- Windows installer and PowerShell installation flow;
- documentation consistency and maintainability.

The audit did **not** modify repository files, branches, issues, releases or settings.

---

## 3. Methodology and Limitations

### 3.1 Method

The review used the connected GitHub repository as the primary source of truth and locked all conclusions to the baseline commit shown above.

The review consisted of:

1. repository and commit metadata capture;
2. documentation-to-code consistency review;
3. source-level inspection of safety-critical workflows;
4. trust-boundary and input-validation analysis;
5. GitHub Actions permissions, trigger and release-chain review;
6. test architecture and coverage-surface review;
7. maintainability and responsibility-boundary review;
8. risk classification and remediation planning.

### 3.2 Execution limitation

An independent local clone and test run could not be completed because the audit execution environment could not resolve `github.com`. The connected GitHub API remained available for source inspection.

At the baseline commit:

- no commit statuses were returned by the connected GitHub status endpoint;
- no associated workflow runs were returned by the connected workflow-run endpoint.

Therefore, this report does **not** claim that the browser tests or .NET build passed at the audited commit. It confirms that the workflows and test code exist and reviews what they are designed to check.

### 3.3 Items not verified

The following require a Windows verification audit or repository-administration access:

- real File System Access API behavior against Windows folders;
- actual Everything SDK and `es.exe` behavior;
- concurrent live search requests;
- installer upgrade/uninstall behavior;
- Authenticode status and Windows SmartScreen reputation;
- GitHub branch protection and required-check settings;
- repository secret and environment protection settings;
- production HTTP response headers;
- Google Analytics live configuration;
- external vulnerability/malware scanning of produced artifacts;
- reproducibility of a release build from a clean Windows host.

---

## 4. Architecture Overview

### 4.1 Browser application

The frontend is a static, local-first application composed of:

- `index.html`;
- modular CSS under `assets/css/`;
- global browser modules under `assets/js/`;
- browser-based test fixtures;
- GitHub Pages deployment.

The browser app supports:

- local Everything search through the optional companion;
- creation of a memory-based folder tree;
- reading an existing folder tree;
- file archive copying;
- recursive folder archive copying;
- a rule-based offline destination advisor;
- user-controlled appearance settings;
- optional consent-based analytics.

### 4.2 Windows companion

The companion is a .NET 8 Windows application that:

- binds to `127.0.0.1`;
- exposes `/api/health` and `/api/search`;
- uses the Everything SDK when available;
- falls back to `es.exe`;
- validates structured search filters;
- checks browser origins;
- requires a short-lived session for search;
- applies rate limiting;
- redacts result paths by default.

### 4.3 Distribution

The companion is published as:

- a self-contained Windows x64 package;
- a ZIP archive;
- an Inno Setup installer;
- a mutable GitHub release named `everything-companion-latest`.

---

## 5. Positive Findings

### S-01 — Non-destructive archive philosophy

The application copies files and folders and leaves source items untouched. Duplicate output names are resolved with `_copy_N` suffixes instead of overwriting existing content.

**Evidence**

- `assets/js/file-archive.js`, lines 18–40 and 94–121.
- `assets/js/folder-archive.js`, lines 104–139 and 199–235.
- `README.md`, archive and duplicate-name sections.

**Assessment:** Strong.

---

### S-02 — Folder archive preflight limits

Folder archiving performs a full preflight before creating destination output and rejects operations exceeding defined limits:

- 2,000 files;
- 5,000 scanned files/folders;
- 1 GB total;
- 500 MB individual file;
- depth greater than 20.

**Evidence**

- `assets/js/folder-archive.js`, lines 11–17 and 142–196.
- `README.md`, lines 298–308.

**Assessment:** Strong and appropriately conservative for a browser utility.

---

### S-03 — Destination containment protection

The folder archive workflow checks whether the selected destination is the source folder or a descendant of it. It also checks retained-root paths before writing.

**Evidence**

- `assets/js/folder-archive.js`, lines 37–102 and 315–327.

**Assessment:** Strong. This prevents self-recursive copying and runaway archive growth.

---

### S-04 — Rollback of incomplete archive output

Both file and folder archive workflows attempt to delete incomplete output after a failed copy. Folder archive refuses to start when recursive removal is unavailable.

**Evidence**

- `assets/js/file-archive.js`, lines 43–51 and 123–134.
- `assets/js/folder-archive.js`, lines 238–246 and 329–357.

**Assessment:** Strong transaction-oriented design.

---

### S-05 — Concurrency protection for archive actions

The app uses:

- an in-page active-operation token;
- disabled archive buttons;
- the Web Locks API when available.

**Evidence**

- `assets/js/archive-operation.js`, lines 5–67.

**Assessment:** Strong for a static browser application.

---

### S-06 — Stale asynchronous context protection

Mode revision and state identity checks prevent delayed file-picker or permission results from being attached to the wrong active mode.

**Evidence**

- `assets/js/folder-creation.js`, lines 24–57 and 116–164.
- `tests/archive-core-tests.html`, stale picker and stale creation tests near lines 1280–1347.

**Assessment:** Excellent defensive handling of asynchronous browser state.

---

### S-07 — Strong imported-tree semantic validation

Imported folder trees are checked for:

- schema/type;
- fixed root and first-level layout;
- safe Windows names;
- reserved device names;
- valid branch and thinking-type relationships;
- unique sibling names;
- role-based restrictions.

**Evidence**

- `assets/js/folder-tree-import.js`, lines 15–198.

**Assessment:** Strong semantic validation. Resource limits remain a separate finding.

---

### S-08 — Local companion trust boundary

The .NET service binds explicitly to loopback, checks allowed origins, responds to Private Network Access preflights, and requires a valid session for search.

**Evidence**

- `everything-companion/Program.cs`, lines 8–28, 71–138 and 140–228.

**Assessment:** Strong.

---

### S-09 — Session and path privacy controls

Search sessions use 32 random bytes, are stored only in memory, expire, and are bound to a normalized origin. Paths are redacted by default to a short display form.

**Evidence**

- `everything-companion/SearchCore.cs`, session store around lines 425–496.
- `everything-companion/SearchCore.cs`, path redaction around lines 498–531.
- `assets/js/everything-search-api.js`, lines 170–245.

**Assessment:** Strong.

---

### S-10 — Consent-based, parameter-sanitized analytics

The analytics script is limited to production hosts and is added only after explicit consent. Events are allowlisted, and only `archive_type` is retained for failure events.

**Evidence**

- `assets/js/analytics.js`, lines 5–16, 41–96 and 138–152.

**Assessment:** Strong privacy-by-default implementation.

---

## 6. Detailed Findings

# High Severity

## H-01 — Obsolete self-modifying workflows retain write access and direct-push behavior

### Evidence

The following workflows remain in the repository:

- `.github/workflows/generalize-dropdown-options.yml`
- `.github/workflows/replace-structure-fields-with-rows.yml`
- `.github/workflows/convert-structure-textareas.yml`

Each workflow:

- grants `contents: write`;
- can be manually dispatched;
- runs broad regex/string replacements;
- commits directly;
- pushes directly;
- deletes its own workflow file;
- references obsolete monolithic files such as `assets/js/app.js`;
- one also references obsolete `assets/css/styles.css`.

The current application instead uses modular files such as `app-state.js`, `folder-tree.js`, `app-init.js`, `base.css`, `layout.css`, and `components.css`.

### Risk

A manual trigger could:

- fail after partially changing files;
- apply legacy transformations to the modern structure;
- create an unreviewed direct commit;
- delete the workflow itself;
- bypass the intended branch/PR correction process;
- conflict with the current architecture.

Even when the workflows simply fail, retaining write-enabled dead automation increases repository risk and maintenance ambiguity.

### Recommendation

1. Remove all three obsolete workflows from `main`.
2. Preserve any historically useful transformation logic in a non-executable archive document or Git history, not an active workflow.
3. Require code-changing automation to:
   - operate on a dedicated branch;
   - open a pull request;
   - avoid direct pushes to `main`;
   - use minimal permissions;
   - validate exact current paths;
   - run tests before proposing changes.
4. Add branch protection requiring review and CI for changes under `.github/workflows/`.

### Priority

**Immediate.**

---

## H-02 — Release supply chain is mutable, unverified and unsigned

### Evidence

The companion release workflow:

- downloads `https://www.voidtools.com/Everything-SDK.zip` at build time;
- downloads the license separately;
- does not pin an SDK version;
- does not verify a SHA-256 checksum or digital signature;
- uses action version tags rather than immutable action commit SHAs;
- publishes a self-contained executable and installer;
- does not generate an SBOM;
- does not generate provenance/attestation;
- does not produce a checksum manifest;
- does not sign the executable or installer;
- overwrites a mutable tag/release named `everything-companion-latest`.

The Inno Setup file hardcodes:

- `AppVersion "1.0.0"`;
- `VersionInfoVersion=1.0.0.0`.

### Risk

The release is not deterministically tied to a fully identified dependency set. A changed or compromised upstream SDK archive could enter a trusted public installer without repository changes.

Unsigned Windows executables also:

- provide weaker publisher identity;
- reduce tamper evidence;
- increase SmartScreen friction;
- make incident investigation and artifact comparison harder.

Overwriting `latest` while retaining version `1.0.0` damages traceability.

### Recommendation

1. Pin the exact Everything SDK release or archive version.
2. Store the expected SHA-256 in the repository and fail the workflow on mismatch.
3. Verify any available upstream Authenticode signature.
4. Pin third-party GitHub Actions by immutable commit SHA.
5. Generate:
   - `SHA256SUMS.txt`;
   - SBOM, preferably CycloneDX or SPDX;
   - GitHub artifact attestation/provenance.
6. Use immutable semantic release tags, for example `everything-companion-v1.1.0`.
7. Derive assembly and installer versions from the release tag.
8. Preserve previous releases rather than overwriting them.
9. Sign the application and installer with a protected code-signing identity.
10. Restrict release permissions through a protected GitHub environment.

### Priority

**Immediate before wider installer distribution.**

---

## H-03 — Production deployment is not gated by CI success

### Evidence

- `.github/workflows/ci.yml` runs on pushes to `main`.
- `.github/workflows/deploy-pages.yml` separately runs on pushes to `main`.
- The deployment workflow has no dependency on the CI workflow and performs no tests itself.

### Risk

GitHub Actions workflows triggered by the same push run independently. A commit can therefore be deployed even if:

- JavaScript syntax checks fail;
- browser tests fail;
- the .NET companion build fails;
- a regression is detected after deployment starts.

### Recommendation

Use one of these designs:

**Preferred design**

- Put test/build/deploy jobs in one workflow.
- Add `needs: [browser-tests, companion-build]` to deployment.
- Deploy only after all required jobs succeed.

**Alternative**

- Trigger deployment through `workflow_run` only after the named CI workflow concludes successfully.
- Ensure the deployed SHA exactly matches the successful CI SHA.

Also:

- require CI checks in branch protection;
- protect the `github-pages` environment;
- prevent manual deployment of an untested ref;
- include a smoke check against the built static artifact.

### Priority

**Immediate.**

---

# Medium Severity

## M-01 — Potential race condition in the Everything SDK backend

### Evidence

`EverythingSdkBackend` holds one SDK API object. Each search performs a sequence of native calls that mutate shared Everything query state:

1. set search string;
2. set matching flags;
3. set maximum results;
4. execute query;
5. enumerate results.

No lock or semaphore surrounds this complete transaction.

ASP.NET Core can process multiple search requests concurrently. The Everything SDK API exposed here is stateful and process-global in style.

### Risk

Two concurrent requests may interleave setter/query/read calls, potentially causing:

- one request to receive another request's filters;
- mixed or incorrect results;
- inconsistent limits;
- nondeterministic failures.

This is a **potential** race based on the implementation pattern; it should be confirmed with Everything SDK thread-safety documentation and concurrent tests.

### Recommendation

1. Add a `SemaphoreSlim(1, 1)` around the complete SDK query transaction.
2. Keep the lock from the first setter through final result extraction.
3. Honour cancellation while waiting for the semaphore.
4. Add a concurrent test issuing distinct queries and verifying isolation.
5. Document the selected concurrency model.

### Priority

**High within the companion hardening phase.**

---

## M-02 — Search cancellation and timeout handling are incomplete

### Evidence

#### SDK backend

- Calls synchronous `_query(true)`.
- Wraps the synchronous result in `Task.FromResult`.
- Checks cancellation only while enumerating results, after the native query returns.
- Has no explicit query timeout.

#### `es.exe` backend

- `ReadLineAsync()` is called without a cancellation token.
- Cancellation is checked only between completed line reads.
- Process termination is not protected by an outer `finally`.
- There is no backend execution timeout.

### Risk

A slow or hung backend can:

- hold a request indefinitely;
- occupy a server thread;
- leave an `es.exe` child process running after cancellation or exceptions;
- make browser cancellation appear ineffective;
- degrade the local service under repeated requests.

### Recommendation

1. Add a configured per-search deadline using a linked `CancellationTokenSource`.
2. Ensure `es.exe` is killed in a `finally` block whenever still active.
3. Use cancellation-aware stdout reading where supported.
4. Place native SDK access behind a controlled worker/serialization boundary.
5. Return a clear timeout response, such as HTTP 504 or a dedicated 503 detail.
6. Add tests for:
   - cancellation before start;
   - cancellation while waiting;
   - backend timeout;
   - child-process cleanup;
   - service recovery after timeout.

### Priority

**High within the companion hardening phase.**

---

## M-03 — Imported JSON has no resource-consumption limits

### Evidence

The tree importer:

- calls `file.text()`;
- parses the full JSON;
- recursively validates nodes;
- recursively imports nodes;
- recursively renders the resulting structure.

It has no explicit:

- maximum input file size;
- maximum JSON depth;
- maximum tree depth;
- maximum node count;
- maximum name aggregate size.

### Risk

A malformed or intentionally huge shared template could:

- consume excessive browser memory;
- block the UI thread;
- cause maximum call-stack errors;
- freeze or crash the tab.

The semantic checks are strong but do not prevent resource-exhaustion attacks or accidental oversized imports.

### Recommendation

1. Reject files above a documented maximum before `file.text()`.
2. Enforce maximum tree depth.
3. Enforce maximum total node count.
4. Enforce maximum children per node.
5. Enforce maximum aggregate text length.
6. Prefer iterative validation for untrusted deep structures.
7. Add boundary and rejection tests.
8. Align import limits with the practical folder-creation/archive model.

Suggested initial limits should be selected through usability testing, not copied blindly. A conservative starting point could be approximately:

- 1–2 MB JSON;
- depth 20–30;
- 2,000–5,000 nodes;
- 500 children per node.

### Priority

**High within the browser hardening phase.**

---

## M-04 — No dedicated .NET automated test project was found

### Evidence

The CI companion job performs:

- `dotnet restore`;
- `dotnet build`.

No test project or `dotnet test` step was found during the reviewed repository search.

The browser tests mock the local companion and therefore do not directly execute:

- origin normalization;
- session expiry;
- token/origin binding;
- rate-limit partition behavior;
- query builder behavior;
- path redaction;
- SDK loading;
- `es.exe` process behavior;
- concurrent requests.

### Risk

Security-sensitive server logic can regress while the build remains green.

The release workflow can publish an installer from code that has only compiled, not passed companion tests.

### Recommendation

Create an `EverythingCompanion.Tests` project and cover at minimum:

- `SearchRequestValidator`;
- `EverythingSearchQueryBuilder`;
- `LocalOriginPolicy`;
- `CompanionSessionStore`, including expiry via `TimeProvider`;
- `SearchResultPrivacy`;
- facade fallback logic;
- process argument construction;
- session-required endpoint behavior;
- allowed/disallowed origins;
- OPTIONS/PNA behavior;
- concurrency isolation;
- cancellation and timeout behavior.

Run `dotnet test --configuration Release` in:

- CI;
- the release workflow before packaging;
- verification audit.

### Priority

**High within the testing phase.**

---

## M-05 — JavaScript dependency installation is not reproducible

### Evidence

The CI workflow installs Playwright using:

```text
npm install --no-save --no-package-lock playwright@1.52.0
```

No `package.json` or lockfile was found in the reviewed repository search.

### Risk

Although the main Playwright version is specified, the full transitive dependency graph is not locked. This reduces:

- repeatability;
- dependency auditability;
- cache predictability;
- provenance quality.

It also prevents normal use of `npm ci` and standard dependency-update tooling.

### Recommendation

1. Add a minimal development `package.json`.
2. Commit `package-lock.json`.
3. Use `npm ci`.
4. Keep Playwright under `devDependencies`.
5. Define explicit scripts, for example:
   - `lint:syntax`;
   - `test:browser`;
   - `test`.
6. Configure Dependabot or Renovate for controlled updates.
7. Cache the package manager and Playwright browser artifacts where appropriate.
8. Continue pinning the browser-test version deliberately.

### Priority

**Medium.**

---

## M-06 — GitHub Pages artifact is built from the repository root

### Evidence

The Pages workflow uploads:

```yaml
with:
  path: .
```

There is no dedicated build or staging directory containing only the production website.

### Risk

Using the entire workspace as the deployment source can:

- publish unnecessary tests, documents and source-only assets;
- increase artifact size;
- expose future files accidentally added to the repository root;
- make it harder to state exactly what constitutes the production application;
- mix release/development concerns.

The repository is public, so this is not presently a secret-exposure finding. It is a deployment-discipline and future-risk finding.

### Recommendation

1. Build a clean `_site/` or `dist/` directory.
2. Copy only the production allowlist:
   - `index.html`;
   - `site.webmanifest`;
   - required Markdown/legal pages;
   - required CSS, JS and image assets.
3. Exclude:
   - `.github/`;
   - tests;
   - companion source;
   - integration design documents;
   - audit reports unless intentionally published.
4. Validate internal links against the staged artifact.
5. Run a smoke test against the staged artifact before deployment.

### Priority

**Medium.**

---

## M-07 — Several mixed-responsibility files are maintenance hotspots

### Evidence

Notable file sizes and responsibility concentration include:

- `everything-companion/SearchCore.cs` — approximately 599 lines, containing models, validation, query building, origin policy, session storage, privacy redaction, facade and exceptions.
- `tests/archive-core-tests.html` — approximately 1,483 lines, combining fixtures, fake filesystem implementation, tests and test runner.
- `assets/js/color-theme-picker.js` — approximately 428 lines, combining configuration, validation, CSS generation, DOM construction, persistence and interaction.
- `assets/js/everything-search.js` — approximately 423 lines, combining coordinator behavior, script loading, compatibility facade, duplicate validation fallbacks, navigation fallbacks and request orchestration.
- `assets/js/folder-archive.js` — approximately 396 lines, combining validation, preflight, copying, rollback, UI and orchestration.

The application uses global `window.*` modules whose correctness also depends on script loading order.

### Risk

Large mixed-responsibility files increase:

- regression risk;
- code duplication;
- difficulty of focused tests;
- merge conflicts;
- difficulty reasoning about transaction boundaries;
- pressure for future patches rather than local changes.

`everything-search.js` duplicates validation and URL-building behavior already present in `everything-search-api.js`, creating drift risk.

### Recommendation

Refactor incrementally without changing behavior:

#### Companion

Split `SearchCore.cs` into:

- `Contracts/SearchModels.cs`
- `Validation/SearchRequestValidator.cs`
- `Search/EverythingSearchQueryBuilder.cs`
- `Security/LocalOriginPolicy.cs`
- `Security/CompanionSessionStore.cs`
- `Privacy/SearchResultPrivacy.cs`
- `Search/EverythingSearchFacade.cs`
- `Exceptions/*.cs`

#### Browser

Split:

- folder archive preflight;
- destination validation;
- copy engine;
- rollback;
- archive UI orchestration.

For Everything search:

- keep one canonical validation implementation;
- remove fallback duplication after confirming required browser support;
- use explicit module loading or a minimal bundling strategy;
- retain small, single-purpose files.

#### Tests

Separate:

- fake filesystem handles;
- archive tests;
- import tests;
- analytics tests;
- Everything client tests;
- navigation/UI tests.

### Priority

**Medium, after safety and release issues.**

---

## M-08 — Folder-tree creation can leave partial output without a precise report

### Evidence

`createFoldersOnComputer()`:

- obtains the destination;
- iterates all folder paths;
- creates each path sequentially;
- on an ordinary error displays a generic failure message.

There is no rollback of newly created directories and no count/path report describing what may already exist.

### Risk

If creation fails after several successful operations, the user may receive a generic failure while part of the tree remains on disk.

This is non-destructive and can often be safely retried, but the message does not provide the same transaction clarity as file/folder archiving.

### Recommendation

Choose one documented model:

**Model A — Idempotent partial completion**

- explicitly state that already-created folders may remain;
- report completed/failed counts;
- make retry safe;
- record the first failed path.

**Model B — Rollback newly created empty folders**

- track only directories created by the current operation;
- remove them in reverse order on failure;
- never remove pre-existing folders;
- report rollback success or failure.

A preflight validation of all folder names/paths should occur before the first write.

### Priority

**Medium.**

---

# Low Severity

## L-01 — `everything-install-guide.js` is loaded twice

### Evidence

`index.html` includes:

```html
<script src="assets/js/everything-install-guide.js" defer></script>
...
<script src="assets/js/everything-install-guide.js?v=2e65377" defer></script>
```

### Risk

The module executes twice and replaces the same global object twice. Internal guards reduce immediate impact, but duplicate execution:

- wastes work;
- complicates debugging;
- can create future duplicate-event bugs;
- obscures the intended cache-busting strategy.

### Recommendation

Keep one script reference. Use the versioned reference only if cache busting is required.

### Priority

**Low; safe quick fix.**

---

## L-02 — Folder archive retains rollback state after copy success

### Evidence

After `copyDirectoryContents()` succeeds, the folder workflow:

- renders the success message;
- calls analytics;
- remains inside the transaction `try`;
- leaves `archiveTarget` non-null.

If a non-copy action unexpectedly throws after the copy, the `catch` path can treat the completed archive as failed and attempt rollback.

The file archive implementation clears `archiveTarget` before success UI/analytics, showing the safer transaction boundary.

### Risk

The current analytics implementation is unlikely to throw, so practical probability is low. The inconsistency nevertheless creates a fragile boundary for future changes.

### Recommendation

Immediately after successful copy completion:

```js
archiveTarget = null;
```

Then perform UI and analytics work, with analytics guarded as non-critical.

### Priority

**Low.**

---

## L-03 — No explicit Content Security Policy was found

### Evidence

`index.html` contains no CSP meta policy, and the Pages workflow does not configure response headers.

The current code generally avoids unsafe rendering of untrusted values and uses `textContent`, which substantially reduces immediate XSS risk.

### Risk

Without CSP, a future HTML injection or compromised script path has fewer browser-enforced restrictions.

### Recommendation

For the custom production domain, prefer HTTP response headers for:

- `Content-Security-Policy`;
- `Referrer-Policy`;
- `Permissions-Policy`;
- `X-Content-Type-Options`;
- framing protection through `frame-ancestors`.

Because this is a static site with inline JSON-LD and dynamically generated style elements, design and test the policy carefully. Do not add a nominal policy containing broad `unsafe-inline` allowances without evaluating its real value.

### Priority

**Low hardening item.**

---

## L-04 — Dead compatibility modules and runtime removal add avoidable complexity

### Evidence

- `assets/js/folder-tree-export.js` is intentionally empty.
- `index.html` still loads it.
- `app-init.js` removes hidden/deprecated build-mode controls at runtime instead of the HTML being the final intended interface.
- the Everything coordinator contains compatibility loaders and fallbacks despite the split modules being directly referenced in production HTML.

### Risk

Dead paths make it harder to identify the actual production architecture and increase the chance that an obsolete feature is accidentally revived or partially modified.

### Recommendation

After verifying no supported deployment depends on them:

1. remove empty script references;
2. remove unused empty modules;
3. remove deprecated HTML controls rather than deleting them at runtime;
4. document any compatibility layer that must remain;
5. keep one canonical module-loading method.

### Priority

**Low, as part of cleanup/refactoring.**

---

## L-05 — Repository governance and security maintenance files were not found

### Evidence

The connected repository search did not find:

- `SECURITY.md`;
- `CODEOWNERS`;
- Dependabot configuration;
- Renovate configuration.

This is a search result rather than proof that no equivalent process exists outside the repository.

### Risk

The project lacks visible, repository-level guidance for:

- private vulnerability reporting;
- ownership/review expectations;
- routine dependency update handling.

### Recommendation

Add:

- `SECURITY.md` with supported versions and private reporting method;
- `.github/CODEOWNERS`;
- `.github/dependabot.yml` after adding package manifests;
- pull-request template with test, privacy, file-safety and release checklists.

### Priority

**Low.**

---

## 7. Testing Assessment

### 7.1 Existing strengths

The browser tests cover a meaningful set of behaviors:

- duplicate-safe naming;
- file/folder archive behavior;
- rollback;
- permissions;
- destination containment;
- large-folder limits;
- stale async state;
- archive concurrency;
- analytics consent and filtering;
- Everything search URL/session handling;
- dedicated search screen behavior;
- navigation;
- unchanged normal folder-tree behavior.

The Playwright runner also:

- observes unhandled page errors;
- checks generated node ID uniqueness;
- verifies the session token is sent by header rather than URL;
- exercises structured filters;
- checks unavailable/setup states.

This is a stronger test base than the repository's size might initially suggest.

### 7.2 Gaps

The current test system does not provide:

- .NET unit tests;
- real Windows filesystem integration tests;
- live Everything SDK tests;
- live `es.exe` fallback tests;
- installer tests;
- upgrade/uninstall tests;
- code coverage;
- mutation testing;
- concurrency stress tests;
- timeout/process-cleanup tests;
- accessibility automation;
- production artifact smoke tests;
- link checking;
- manifest validation;
- release artifact signature/hash verification.

### 7.3 Test architecture concern

`tests/archive-core-tests.html` is a large handwritten test document. It is useful and should not be discarded abruptly, but it should be decomposed to improve isolation and reporting.

### 7.4 Recommended test pyramid

#### Unit tests

- JavaScript pure validation and tree logic;
- C# validator, origin, session, redaction and query-builder logic.

#### Browser component/integration tests

- folder-tree import and rendering;
- archive orchestration with fake handles;
- analytics consent;
- Everything browser client with mocked HTTP.

#### Windows integration tests

- actual companion health/search;
- allowed/disallowed origin behavior;
- SDK/fallback selection;
- cancellation;
- concurrent requests;
- install/start/verify/uninstall.

#### Release verification

- artifact inventory;
- hashes;
- signatures;
- version metadata;
- clean-machine install;
- smoke search;
- uninstall cleanup.

---

## 8. CI/CD and Release Assessment

### 8.1 CI strengths

- read-only repository permission;
- JavaScript syntax validation;
- headless browser tests;
- pinned major Node version;
- fixed Playwright version;
- .NET Release build;
- job timeouts;
- concurrency cancellation for superseded CI runs;
- server log output on browser-test failure.

### 8.2 CI weaknesses

- no dependency lockfile;
- no `.NET` tests;
- no linting beyond syntax;
- no coverage;
- no HTML/CSS validation;
- no link/manifest checks;
- action versions are tag-pinned rather than SHA-pinned;
- no artifact from the tested static site;
- no CI-to-deployment gate.

### 8.3 Release weaknesses

- mutable external SDK download;
- no checksum verification;
- no signing;
- no SBOM/provenance;
- mutable overwritten release;
- static installer version;
- no automated tests in the release workflow;
- no release notes derived from immutable version history;
- no clean-machine install test.

---

## 9. Security and Privacy Assessment

### 9.1 Browser filesystem safety

The design is conservative and mostly strong. It makes archive decisions explicit, uses browser permission prompts, and avoids implicit scanning or deletion.

### 9.2 Search companion exposure

The companion's loopback binding is an important baseline control. Origin allowlisting plus session binding prevents ordinary arbitrary websites from directly issuing searches through the browser.

### 9.3 Input validation

Validation is duplicated on client and server, which is correct from a trust perspective. The server remains authoritative.

The `es.exe` fallback uses `ProcessStartInfo.ArgumentList` with shell execution disabled, which is a strong command-injection control.

### 9.4 Privacy

Default path redaction, memory-only sessions and analytics minimization are appropriate.

### 9.5 Remaining hardening

The most important security work is now:

- release integrity;
- dependency pinning;
- code signing;
- concurrency isolation;
- resource limits;
- automated server tests;
- deployment gating.

---

## 10. Maintainability Assessment

### 10.1 Positive structure

The browser application has already moved away from a monolithic `app.js` into feature-oriented files. That is a good direction.

Naming is generally descriptive, and important safety decisions are readable directly in the code.

### 10.2 Remaining structural debt

The repository still carries remnants of prior architecture:

- obsolete automation;
- empty compatibility modules;
- runtime removal of hidden UI;
- duplicate compatibility logic;
- large multi-purpose files.

### 10.3 Recommended structural rule

For future work:

- one file, one primary responsibility;
- keep orchestration separate from pure logic;
- keep filesystem write engines separate from UI messages;
- keep validation separate from rendering;
- keep transport/session logic separate from search backends;
- test pure modules directly;
- prefer local, controlled changes over cross-file patch chains.

---

## 11. Prioritized Remediation Plan

### Phase 0 — Repository safety

1. Delete the three obsolete self-modifying workflows.
2. Confirm branch protection for `main`.
3. Require CI before merge.
4. Restrict workflow-file changes to reviewed pull requests.
5. Remove the duplicate install-guide script reference.

### Phase 1 — Release and deployment hardening

1. Gate Pages deployment on successful CI.
2. Stage a curated static artifact.
3. Add package manifest and lockfile.
4. Pin third-party actions by SHA.
5. Pin and checksum the Everything SDK.
6. introduce immutable semantic releases.
7. generate hashes, SBOM and provenance.
8. add code signing.

### Phase 2 — Companion correctness

1. Add `EverythingCompanion.Tests`.
2. Serialize SDK requests.
3. add search timeouts.
4. make `es.exe` cleanup unconditional.
5. test concurrent and cancelled requests.
6. run tests in release workflow.

### Phase 3 — Browser hardening

1. Add imported-tree file/node/depth limits.
2. clarify or roll back partial folder-tree creation.
3. clear folder-archive rollback state immediately after successful copy.
4. add boundary and malformed-input tests.
5. evaluate production CSP/security headers.

### Phase 4 — Architectural cleanup

1. split `SearchCore.cs`;
2. split the browser test harness;
3. separate folder archive engine from UI orchestration;
4. remove duplicate Everything fallbacks;
5. remove dead compatibility modules and runtime-deleted UI;
6. split the settings module by responsibility.

---

## 12. Recommended Issue Backlog

| ID | Suggested issue | Severity | Effort |
|---|---|---:|---:|
| AUD-001 | Remove obsolete write-enabled self-modifying workflows | High | Small |
| AUD-002 | Gate GitHub Pages deployment on successful CI | High | Small–Medium |
| AUD-003 | Pin and verify Everything SDK release dependency | High | Medium |
| AUD-004 | Introduce immutable versioned signed companion releases | High | Medium–Large |
| AUD-005 | Add .NET companion unit and endpoint tests | Medium | Medium |
| AUD-006 | Serialize Everything SDK searches | Medium | Small–Medium |
| AUD-007 | Add backend cancellation, timeout and process cleanup | Medium | Medium |
| AUD-008 | Add folder-tree import resource limits | Medium | Medium |
| AUD-009 | Add package manifest, lockfile and `npm ci` | Medium | Small |
| AUD-010 | Build a curated GitHub Pages artifact | Medium | Small–Medium |
| AUD-011 | Report or roll back partial folder-tree creation | Medium | Medium |
| AUD-012 | Split major mixed-responsibility files | Medium | Large, incremental |
| AUD-013 | Remove duplicate install-guide script | Low | Trivial |
| AUD-014 | Clear folder archive transaction state before analytics/UI | Low | Trivial |
| AUD-015 | Remove dead compatibility modules and controls | Low | Small |
| AUD-016 | Add security policy, CODEOWNERS and dependency automation | Low | Small |
| AUD-017 | Design production CSP and security headers | Low | Medium |

---

## 13. Proposed Acceptance Criteria for Key Fixes

### AUD-001 — Workflow removal

- obsolete workflow files are absent;
- no active workflow references `assets/js/app.js` or `assets/css/styles.css`;
- no workflow directly pushes application transformations to `main`;
- CI passes after removal.

### AUD-002 — Deployment gating

- a deliberately failing browser test prevents Pages deployment;
- deployment consumes the same SHA that passed CI;
- manual deploy cannot select an untested commit;
- protected environment is enabled where possible.

### AUD-003/AUD-004 — Release integrity

- SDK version and SHA-256 are documented;
- checksum mismatch fails release;
- actions are immutable-SHA pinned;
- installer version matches release tag;
- previous releases remain immutable;
- checksums, SBOM and provenance are attached;
- binaries are signed and signature verification is automated.

### AUD-005 — Companion tests

- `dotnet test` runs in CI and release;
- tests cover validator, origin, session, redaction and query builder;
- expired/wrong-origin tokens are rejected;
- malformed filters return expected status;
- tests do not depend on the local user's Everything installation.

### AUD-006/AUD-007 — Backend reliability

- concurrent distinct SDK queries cannot mix results;
- cancellation stops waiting work;
- timed-out `es.exe` is terminated;
- no child process remains after failure;
- service accepts subsequent searches after timeout;
- timeout behavior is visible to the browser.

### AUD-008 — Import limits

- oversized file is rejected before reading;
- excessive depth is rejected without stack overflow;
- excessive node count is rejected;
- valid templates at each boundary are accepted;
- rejection creates no folders and does not replace current state.

---

## 14. Verification Audit Plan

After corrections are implemented, run a separate Verification Audit.

### 14.1 Record

- original baseline SHA;
- correction branch;
- final correction SHA;
- pull request number;
- verification date/time;
- exact release artifact identifiers.

### 14.2 Automated verification

Run:

- JavaScript syntax/lint checks;
- locked dependency install;
- browser unit/integration tests;
- Playwright UI tests;
- `.NET` unit tests;
- companion endpoint tests;
- concurrent-search tests;
- cancellation/process cleanup tests;
- link and manifest validation;
- staged Pages smoke test;
- release checksum/SBOM/signature validation.

### 14.3 Windows manual verification

On a clean Windows x64 environment:

1. install Everything;
2. install signed companion;
3. confirm scheduled task and custom protocol;
4. confirm loopback-only listener;
5. test allowed production origin;
6. test blocked unapproved origin;
7. test search session expiry;
8. test path redaction;
9. test SDK search;
10. test `es.exe` fallback;
11. test browser cancellation;
12. test concurrent queries;
13. upgrade from previous version;
14. uninstall and confirm cleanup;
15. reinstall;
16. verify hashes and signature.

### 14.4 File safety verification

Test:

- duplicate file names;
- duplicate folder names;
- permission denial;
- picker cancellation;
- destination inside source;
- retained root inside source;
- oversized folder limits;
- partial write failure;
- rollback success;
- rollback failure disclosure;
- stale mode change;
- cross-tab locking;
- imported tree limits;
- partial folder-tree creation behavior.

### 14.5 Final verification report

The verification report should state:

- what was fixed;
- what passed;
- what failed;
- what remains open;
- any new risks introduced;
- original and final SHAs;
- whether the public release is approved.

---

## 15. Final Conclusion

The repository demonstrates unusually careful thinking about user-controlled filesystem operations. The archive algorithms, permission model, duplicate handling, rollback strategy, privacy controls and local companion boundary are substantial strengths.

The principal weakness is not the core purpose of the application; it is the engineering system around delivery:

- legacy write-enabled automation;
- independent deployment;
- unverified third-party release input;
- unsigned mutable releases;
- missing companion tests;
- incomplete backend concurrency and cancellation controls.

The recommended order is therefore:

1. secure the repository automation;
2. gate production deployment;
3. harden and version the release chain;
4. add companion tests and backend isolation;
5. add import resource limits;
6. then refactor for long-term modularity.

With those changes, the project can move from a strong personal safety-oriented implementation to a more dependable and auditable public software product.

---

## Appendix A — Audited Source Map

| Area | Primary files |
|---|---|
| Product documentation | `README.md`, `PRIVACY.md`, `THIRD_PARTY_NOTICES.md` |
| Main page | `index.html` |
| App state | `assets/js/app-state.js` |
| Folder tree | `assets/js/folder-tree*.js`, `assets/js/template-selector.js` |
| Import validation | `assets/js/folder-tree-import.js` |
| Folder creation | `assets/js/folder-creation.js` |
| File archive | `assets/js/file-archive.js` |
| Folder archive | `assets/js/folder-archive.js` |
| Archive locking | `assets/js/archive-operation.js` |
| Everything browser client | `assets/js/everything-search*.js`, `assets/js/everything-install-guide.js` |
| Analytics/privacy | `assets/js/analytics.js`, `assets/js/privacy-notice.js` |
| App initialization | `assets/js/app-init.js` |
| Browser tests | `tests/archive-core-tests.html`, `tests/run-browser-tests.mjs` |
| Companion service | `everything-companion/Program.cs` |
| Search contracts/core | `everything-companion/SearchCore.cs` |
| SDK backend | `everything-companion/EverythingSdkBackend.cs` |
| CLI fallback | `everything-companion/EverythingEsExeBackend.cs` |
| Companion project | `everything-companion/EverythingCompanion.csproj` |
| Installer | `everything-companion/installer/EverythingCompanion.iss` |
| Installation scripts | `everything-companion/install/*` |
| CI | `.github/workflows/ci.yml` |
| Pages deployment | `.github/workflows/deploy-pages.yml` |
| Release | `.github/workflows/everything-companion-release.yml` |
| Obsolete automation | `.github/workflows/generalize-dropdown-options.yml`, `.github/workflows/replace-structure-fields-with-rows.yml`, `.github/workflows/convert-structure-textareas.yml` |

---

## Appendix B — Baseline Audit Declaration

This report is a read-only baseline assessment of commit:

`2ee6866d7a05d83f6379f2ab14674e02ff52c713`

No application source, workflow, branch, pull request, release, issue, setting or repository file was changed during the audit.
