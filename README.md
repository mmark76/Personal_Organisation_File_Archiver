# Personal Memory-Based File Archiver

**Personal Memory-Based File Archiver**, presented in the interface as **Organize Your PC**, is a standalone browser-based tool that helps the user search local file and folder names, build a personal memory-based folder tree, view an existing one, archive files manually, and archive folders manually into user-selected archive destinations.

The app follows a memory-based approach: files and folders are organised according to how the user naturally remembers them, such as by life area, work period, responsibility, project, subject, interest, or document function.

The current app has five main choices:

- **Search this PC** — search local file and folder names through Everything by voidtools and the optional local companion service. Search supports filters for result type, file category, modified date, size, filename matching, result count, and Windows location.
- **Build New Folder Tree on this PC** — create, review, and optionally create a memory-based folder tree on the local computer. The copy, export, import, and official template download buttons for this mode are currently implemented in the codebase but temporarily disabled and hidden in the visible app interface.
- **View Existing Folder Tree on this PC** — choose a local folder and read only folder names up to the selected depth as a starting tree.
- **Archive a File** — choose an archive folder tree from this PC or from a JSON file, load one file, review its basic browser metadata, receive a simple offline folder suggestion, select a destination, and archive the file after the user grants browser permission.
- **Archive a Folder** — choose an archive folder tree from this PC or from a JSON file, choose one source folder, select a destination, and archive a recursive copy of that folder after the user grants browser permission.

The app does not delete, upload, rename, modify, automatically scan, or automatically move files or folders. Archive actions leave the original file or source folder untouched. Search results are discovery-only and do not grant filesystem access.

As a good practice, users are encouraged to keep a backup of important files. The app displays this recommendation in a small panel on the main screen and explains in the Disclaimer that archive actions create copies without deleting the originals.

Recent safety improvements include:

- explicit read/write permission checks before filesystem writes;
- use of the selected existing folder-tree root as the actual archive destination, without creating a duplicate `Organize Your PC` wrapper;
- prevention of simultaneous file or folder archive operations in the same page and, where supported, across browser tabs;
- preflight limits that stop unusually large folder archives before any destination output is created;
- rejection of both direct and retained-root folder destinations that point inside the source folder;
- automatic rollback attempts that remove incomplete file or folder archives if copying fails;
- clear user-facing messages for permission denial, cancellation, blocked concurrent operations, oversized folders, rollback, and success;
- loopback-only Everything search with origin checks, expiring in-memory sessions, rate limiting, structured filter validation, and redacted display paths.

## Current App Structure

```text
index.html
site.webmanifest
LICENSE.md
PRIVACY.md
CHANGELOG.md
THIRD_PARTY_NOTICES.md

docs/philosophy.md

assets/css/base.css
assets/css/layout.css
assets/css/components.css
assets/css/everything-search.css
assets/css/everything-brand.css
assets/css/modals.css
assets/css/privacy.css
assets/css/responsive.css

assets/js/app-state.js
assets/js/utils.js
assets/js/error-messages.js
assets/js/browser-support.js
assets/js/accessibility.js
assets/js/app-navigation.js

assets/js/folder-tree.js
assets/js/folder-tree-codes.js
assets/js/folder-tree-render.js
assets/js/folder-tree-import.js
assets/js/folder-tree-export.js
assets/js/folder-tree-templates.js
assets/js/template-selector.js
assets/js/folder-tree-existing.js
assets/js/folder-creation.js

assets/js/file-advisor.js
assets/js/everything-search-api.js
assets/js/everything-search-ui.js
assets/js/everything-install-guide.js
assets/js/everything-search.js
assets/js/file-import.js
assets/js/archive-operation.js
assets/js/file-archive.js
assets/js/folder-archive.js

assets/js/modals.js
assets/js/feedback.js
assets/js/analytics.js
assets/js/privacy-notice.js
assets/js/app-init.js
assets/js/color-theme-picker.js

assets/images/organize-your-pc-logo.svg
assets/images/organize-your-pc-social-preview.png
assets/images/local-copyright-protected-badge.svg

tests/archive-core-tests.html
tests/run-browser-tests.mjs

everything-companion/
  EverythingCompanion.csproj
  Program.cs
  SearchCore.cs
  EverythingSdkBackend.cs
  EverythingEsExeBackend.cs
  README.md

integration/everything/
  README.md
  ARCHITECTURE.md
  INTEGRATION-CONTRACT.md
  UI-UX-SPEC.md
  SECURITY-PRIVACY.md
  TEST-PLAN.md
  ACTIVATION-CHECKLIST.md
```

The visible app interface is English-only.

## How to Run

For ordinary browser use, open `index.html` in a modern browser. For reliable local development and the Everything integration, serve the repository over localhost:

```powershell
python -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/
```

For direct local folder creation, existing folder tree reading, file archiving, and folder archiving operations, use a browser that supports the File System Access API, such as Chrome or Edge. Browser support may also depend on secure-context rules.

## Settings and Appearance

The app includes a local **Settings** panel for user-controlled appearance changes, including colours, borders, layout sizes, and fonts.

Settings preview live in the browser and are saved locally only when the user clicks **Save settings**.

The current default settings are defined in `assets/js/color-theme-picker.js` and are based on the saved settings export used by the project owner.

Saved settings are stored in local browser storage under:

```text
organizeYourPcColorTheme
```

The user can download the saved settings to the computer from inside the **Settings** panel by clicking **Download settings**. The downloaded JSON file is named:

```text
organize_your_pc_settings.json
```

The settings export contains the app name, export type, schema version, export date, storage key, and the saved settings object.

The **Settings** button remains available above ordinary app modals so the user can open the settings panel while a modal dialog is visible.

## Optional Everything Search

The app includes a dedicated **Search this PC** screen. It connects only to a local Windows companion service bound to `127.0.0.1:51337`.

The companion service is implemented as a small .NET 8 Windows app in `everything-companion/`.

It:

- exposes `GET /api/health`;
- exposes `GET /api/search?q=&type=&limit=&ext=&modified=&size=&location=&match=`;
- validates all query and filter values;
- prefers the Everything SDK when available;
- falls back to `es.exe` when the SDK is unavailable;
- requires a short-lived session established through the health endpoint;
- sends temporary session information through a request header and never through a URL;
- applies rate limiting;
- redacts display paths by default;
- does not expose file downloads or arbitrary filesystem access; and
- does not send local search queries or file paths to a remote server.

The search screen supports:

- all results, files only, or folders only;
- common file categories such as PDF, documents, spreadsheets, presentations, images, audio, video, and archives;
- modified-date ranges;
- file-size ranges;
- contains, exact-name, and starts-with matching;
- an optional Windows drive or folder location;
- 20 or 50 results;
- cancellation and Clear filters.

A permanent **Install Everything** button opens the official voidtools download page and shows the sequence **Download · Install · Start**. The repository does not distribute the Everything installer, executable, SDK DLL, or `es.exe` binary.

The search feature is optional. If Everything or the companion service is unavailable, the four original app workflows continue to work normally.

Run the companion from the repository root with:

```powershell
dotnet run --project .\everything-companion\EverythingCompanion.csproj
```

Everything branding is used only to identify the optional integration. Organize Your PC is not affiliated with or endorsed by voidtools. See `THIRD_PARTY_NOTICES.md` and `integration/everything/` for attribution, architecture, contract, security, testing, and activation notes.

## What the App Does

The app provides five main working areas:

1. **Search this PC** — the user can search local file and folder names through Everything, apply the supported filters, and review safe result metadata. Search results do not automatically archive or manipulate files.
2. **Build New Folder Tree** — the user can build, review, and optionally create a personal folder tree on the computer. The visible tree also shows folder selection codes beside each folder, such as `01`, `01.001`, or `02.004.001`. These codes are visual selection aids and do not change the actual folder names. The copy, export, import, and official template download buttons for this mode are temporarily disabled and hidden in the visible app interface.
3. **View Existing Folder Tree on this PC** — the user can choose one local root folder and select a reading depth of 1, 2, or 3 levels. The app reads only folder names up to that depth and turns them into a starting folder tree for review.
4. **Archive a File** — the user can choose an archive folder tree from this PC or import a folder tree JSON file, load one file, review basic browser metadata, receive a simple offline folder suggestion, select a destination folder from the archive tree preview, and archive the file to the corresponding local folder after choosing the app root folder or its parent folder through the browser folder picker.
5. **Archive a Folder** — the user can choose an archive folder tree from this PC or import a folder tree JSON file, choose one source folder, select a destination folder from the archive tree preview, and archive a recursive copy of the chosen folder to that destination.

In **Build New Folder Tree on the PC**, the first level is fixed:

```text
01_PROFILE
02_PERSONAL
03_PROFESSIONAL
```

Each layer below the fixed first level uses one thinking type:

```text
001_CHRONOLOGICAL
002_THEMATIC
003_FUNCTIONAL
004_ROLE_BASED
```

The thinking type guides the naming of the next layer. It does not become a folder name by itself.

In the current app, role-based thinking is available under the professional branch and restricted outside it.

Windows reserved device names are not allowed as folder names. This includes names such as `CON`, `PRN`, `AUX`, `NUL`, `COM1`, and `LPT1`, including the same reserved stem followed by an extension.

## Build New Folder Tree Mode

Build New Folder Tree Mode lets the user:

- load the default example tree;
- add folders below the fixed first-level branches;
- choose one thinking type for each new layer;
- keep sibling folders in the same layer under one consistent thinking type;
- delete user-created folders;
- create the folder tree on the local computer, after choosing a root folder and granting browser permission.

The default example tree is created locally in the browser. It includes `01_PROFILE`, `02_PERSONAL`, and `03_PROFESSIONAL`, with example subfolders aligned with the memory-based philosophy.

The codebase contains support for copying the visible tree as text, exporting the tree as JSON, importing a previously exported JSON tree, and downloading official JSON templates. In the current visible app interface, these Build New Folder Tree utility buttons are temporarily disabled and hidden.

## View Existing Folder Tree on this PC Mode

View Existing Folder Tree on this PC Mode lets the user:

- choose one local root folder through the browser directory picker;
- choose a folder reading depth of 1, 2, or 3 levels;
- read only folder names inside that chosen root folder up to the selected depth;
- display the detected structure as a simple folder tree;
- use the detected tree as the current folder tree in the app.

This mode does not read files, inspect file content, or perform OCR. It reads folder names only, only inside the root folder selected by the user, and only up to the selected depth.

## Archive File Mode

Archive File Mode lets the user:

- choose an archive folder tree;
- use a folder tree on this PC by choosing a local root folder and reading folder names up to the selected depth;
- import a folder tree JSON file if the user has a saved or shared tree template;
- import one file through the browser file input;
- review the loaded file's basic browser metadata;
- receive a simple offline suggestion based on filename, extension, metadata, and folder-tree matching;
- select the folder where the loaded file should be archived;
- archive the loaded file to the selected folder-tree destination.

The archive action uses the browser directory picker with read/write permission. The user selects a folder from the app's folder tree first, then chooses the `Organize Your PC` folder or its parent folder when the browser asks for folder access. The app verifies permission before creating the corresponding subfolder path and copying the loaded file into that destination.

When the archive tree was loaded from an existing folder on this PC, that selected root folder is retained as the real destination. Archive paths are treated as relative to that root, so the app does not add another `Organize Your PC` wrapper or repeat the selected root name.

If a file with the same name already exists in the selected destination folder, the app creates a safe archive name such as:

```text
filename_copy_1.ext
filename_copy_2.ext
```

The existing file is not overwritten.

Only one archive operation may run at a time. A second file or folder archive request is stopped with a clear message until the active operation finishes.

## Archive Folder Mode

Archive Folder Mode lets the user:

- choose an archive folder tree;
- use a folder tree on this PC by choosing a local root folder and reading folder names up to the selected depth;
- import a folder tree JSON file if the user has a saved or shared tree template;
- choose one source folder through the browser folder picker;
- select the folder-tree destination where the source folder should be archived;
- archive a recursive copy of the chosen folder and its contents to that destination.

The folder archive action copies the selected folder. It does not delete, move, rename, upload, or modify the original folder.

Before writing anything, the app scans the selected source folder and stops if it exceeds any current safety limit:

- more than 2,000 files;
- more than 5,000 combined scanned files and folders;
- more than 1 GB total file size;
- any individual file larger than 500 MB;
- folder nesting deeper than 20 levels.

When a folder exceeds a limit, the app creates no destination output and recommends using File Explorer copy and paste instead.

The app also verifies that the destination is outside the source folder. If that relationship cannot be verified safely, folder archiving does not start. Before recursive copying begins, the app checks that the browser can remove an incomplete destination. If copying then fails partway through, the app attempts to remove the entire incomplete archived folder and reports the result clearly to the user.

If a folder with the same name already exists in the selected destination folder, the app creates a safe archive folder name such as:

```text
folder_copy_1
folder_copy_2
```

If a file with the same name already exists during recursive copying, the app also uses safe file names such as `filename_copy_1.ext`. Existing files are not overwritten.

## Simple Offline Folder Advisor

The app includes a small rule-based advisor. It runs locally in the browser and does not use Ollama, cloud AI, OCR, or external services.

The advisor uses these signals in this order:

1. filename keywords;
2. matching against the current folder-tree names;
3. file extension and browser file type;
4. basic metadata such as size and last modified date;
5. a simple confidence label: `High`, `Medium`, `Low`, or `Unsure`.

The advisor only suggests a destination for a loaded file. It does not select a folder unless the user clicks **Use suggested destination**, and it never archives a file automatically.

## Folder Selection Codes

The app displays visual folder selection codes beside folders in the folder tree.

Example:

```text
01        01_PROFILE
01.001    CVS
01.002    DEGREES

02        02_PERSONAL
02.001    FAMILY
02.002    HEALTH
02.003    FINANCIAL
02.004    INTERESTS
02.004.001 CHESS
```

These codes help the user identify a folder quickly. They are generated from the current tree order and are not inserted into the real folder names.

## File Import Information

When the user imports a file, the current version displays browser-available metadata:

- file name;
- file type;
- file size;
- last modified date.

The current version does not deeply parse PDF, DOCX, XLSX, PPTX, scanned documents, images, or other rich document formats.

The current version performs simple rule-based folder suggestions only. It does not perform semantic classification, OCR, content extraction, or AI-based file classification.

## Local Folder Creation

Folder creation works only when all of the following are true:

1. The browser supports direct folder access.
2. The user clicks **Create Folder Tree on PC**.
3. The user chooses a root folder.
4. The user grants browser permission.

The app creates an application root folder named `Organize Your PC` and then creates the visible folder tree below it. It does not inspect, delete, move, rename, or modify existing files.

## Existing Folder Tree Reading

Existing folder tree reading works only when all of the following are true:

1. The browser supports direct folder access.
2. The user chooses a folder-tree mode that reads an existing folder tree from this PC.
3. The user chooses a folder depth: 1, 2, or 3 levels.
4. The user clicks the folder selection button.
5. The user chooses one local folder and grants browser permission.

The app reads only folder names inside the chosen root folder up to the selected depth. It does not read files or file content.

## Archiving

Archiving works only when all of the following are true:

1. A folder tree has been loaded from this PC or imported as JSON.
2. A file has been imported through the browser file input, or a folder has been chosen through the browser folder picker.
3. A destination folder has been selected from the archive folder tree preview.
4. The browser supports direct folder access.
5. The user clicks **Archive the File** or **Archive the Folder**.
6. The app either uses the retained existing-tree root or asks the user to choose the `Organize Your PC` folder or its parent folder, with read/write permission.

The archive action sends the file or recursive folder copy to the selected folder-tree destination. It does not delete, move, rename, upload, or modify the original file or source folder.

Read/write permission is queried and, where supported, requested explicitly before writes. Permission denial or cancellation stops the operation before archive output is created. Archive buttons are temporarily disabled while an operation is active, and a shared lock prevents another archive operation from starting at the same time.

For an archive tree loaded from an existing local root, the selected handle remains the destination root and all generated paths are relative to it. For the normal new-structure or default-template workflow, the existing `Organize Your PC` application-root behavior remains unchanged.

## One File, One Canonical Destination

The app follows this principle:

```text
One file → one canonical destination
```

The current app leaves the final destination decision to the user. The folder tree acts as a memory guide and selectable destination map so the user can choose the folder where the file or copied folder will be most naturally found later.

## Privacy and Safety

The app is local and browser-based.

It does not upload imported files, chosen folders, file data, search queries, or local search paths to a remote server. It does not read or inspect the user's files automatically. A file or folder is used only when the user imports or chooses it through the browser picker.

When reading an existing folder tree, it reads only folder names from the user-selected root folder up to the selected depth.

The Everything search feature communicates only with the local companion on loopback. Search history is not persisted by default, session information remains in memory, and display paths are redacted unless an explicit local configuration enables full paths.

The deployed website offers optional Google Analytics usage measurement only after the user explicitly allows it. Rejecting analytics does not restrict the app. The fixed analytics events contain no file names, folder names, paths, file contents, imported metadata, destination names, search queries, feedback text, or email addresses. The choice is stored locally and can be changed from the footer.

When folder creation, existing folder tree reading, file archiving, or folder archiving is used, the user must manually choose a folder and give permission through the browser.

As a general good practice, users should keep a separate backup of important files and data. The app creates archive copies and does not delete original files or folders.

## Tests

The repository includes a standalone in-browser core test suite at `tests/archive-core-tests.html` and a Playwright runner at `tests/run-browser-tests.mjs`.

Current automated coverage includes archive behavior, duplicate naming, existing-root path handling, permissions, stale asynchronous state, large-folder limits, destination containment, rollback, concurrent archive prevention, optional analytics consent and event filtering, the dedicated Everything screen, structured filters, session-header handling, unavailable/setup states, navigation, and the unchanged normal folder-tree and archive workflows.

The CI workflow also restores and builds the .NET 8 companion on Windows.

## Local Copyright Badge

The footer displays a local SVG copyright badge stored at `assets/images/local-copyright-protected-badge.svg`.

The badge links only to the local `LICENSE.md` file. It does not load images, scripts, badges, or tracking resources from third-party domains. The separate optional Google Analytics tag is loaded only after explicit consent on the deployed production website.

## Third-Party Attribution

Everything is third-party software by voidtools and must be installed separately by the user. The app links to the official voidtools website and uses Everything branding only to identify the optional integration.

See `THIRD_PARTY_NOTICES.md` for official links and attribution details.

## Known Limitations

- The app is a user-controlled folder tree builder and archiver, not a background automatic file manager.
- Search this PC requires Windows, a running Everything installation, and the local .NET companion service.
- The repository does not bundle or automatically install Everything.
- Search results are discovery-only and do not directly authorize archive actions.
- Display paths are redacted by default.
- In Build New Folder Tree Mode, the copy, import, export, and official template download buttons are temporarily disabled and hidden in the visible app interface.
- Existing folder tree reading is limited to 1, 2, or 3 folder levels, selected by the user.
- Folder archiving copies recursively, but it does not inspect file content or classify files inside the chosen folder.
- Folder archiving intentionally stops at the documented safety limits; larger folders should be copied manually with File Explorer.
- Safe rollback depends on browser support for destination removal. If that support is unavailable, file or folder archiving does not start.
- Cross-tab archive locking uses the Web Locks API where the browser supports it; the same-page lock remains available as a fallback.
- The advisor is rule-based and depends mostly on filename quality and folder-tree names.
- The advisor does not read file content, perform OCR, or use AI.
- The current version does not deeply parse PDF, DOCX, XLSX, PPTX, scanned documents, images, or other rich document formats.
- The current version displays basic browser file metadata only.
- Folder selection codes are visual aids generated from the current tree order. They are not permanent IDs stored inside the actual folder names.
- Folder creation, existing folder tree reading, file archiving, and folder archiving depend on browser support for direct local folder access.
