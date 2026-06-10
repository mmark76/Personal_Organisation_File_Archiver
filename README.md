# Personal Memory-Based File Archiver

**Personal Memory-Based File Archiver** is a standalone browser-based tool that helps the user build a personal memory-based folder tree and archive files manually into user-selected archive folders.

The app follows a memory-based approach: files are organised according to how the user naturally remembers them, such as by life area, work period, responsibility, project, subject, interest, or document function.

The current app has three main choices:

- **Build New Folder Tree** — create, review, copy, export, import, and optionally create a memory-based folder tree on the local computer.
- **Build Existing Folder Tree on this PC** — choose a local folder and read only folder names up to the selected depth as a starting tree.
- **Archive a File** — load one file, review its basic browser metadata, receive a simple offline folder suggestion, select a destination from the current folder tree, and archive the file to the corresponding local folder after the user grants browser permission.

The app does not delete, upload, rename, modify, automatically scan, or automatically move files. The archive action leaves the original file untouched.

## Current App Structure

```text
index.html
site.webmanifest
LICENSE.md
PRIVACY.md

docs/philosophy.md

assets/css/base.css
assets/css/layout.css
assets/css/components.css
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
assets/js/folder-tree-existing.js
assets/js/folder-creation.js

assets/js/file-advisor.js
assets/js/file-import.js
assets/js/file-archive.js

assets/js/modals.js
assets/js/feedback.js
assets/js/privacy-notice.js
assets/js/app-init.js

assets/images/organize-your-pc-logo.svg
assets/images/local-copyright-protected-badge.svg
```

The visible app interface is English-only.

## How to Run

Open `index.html` in a modern browser.

For direct local folder creation, existing folder tree reading, and archiving operations, use a browser that supports the File System Access API, such as Chrome or Edge. Browser support may also depend on secure-context rules.

## What the App Does

The app provides three main working areas:

1. **Build New Folder Tree** — the user can build, review, copy, export, import, and optionally create a personal folder tree on the computer. The visible tree also shows folder selection codes beside each folder, such as `01`, `01.001`, or `02.004.001`. These codes are visual selection aids and do not change the actual folder names.
2. **Build Existing Folder Tree on this PC** — the user can choose one local root folder and select a reading depth of 1, 2, or 3 levels. The app reads only folder names up to that depth and turns them into a starting folder tree for review.
3. **Archive a File** — the user can load one file, review basic browser metadata, receive a simple offline folder suggestion, select a destination folder from the current folder tree preview, and archive the file to the corresponding local folder after choosing the app root folder or its parent folder through the browser folder picker.

In **Build New Folder Tree**, the first level is fixed:

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
- copy the visible folder tree as text;
- export the tree as JSON;
- import a previously exported JSON tree that matches the app schema and fixed first-level structure;
- create the folder tree on the local computer, after choosing a root folder and granting browser permission.

The default example tree is created locally in the browser. It includes `01_PROFILE`, `02_PERSONAL`, and `03_PROFESSIONAL`, with example subfolders aligned with the memory-based philosophy.

## Build Existing Folder Tree on this PC Mode

Build Existing Folder Tree on this PC Mode lets the user:

- choose one local root folder through the browser directory picker;
- choose a folder reading depth of 1, 2, or 3 levels;
- read only folder names inside that chosen root folder up to the selected depth;
- display the detected structure as a simple folder tree;
- use the detected tree as the current folder tree in the app.

This mode does not read files, inspect file content, or perform OCR. It reads folder names only, only inside the root folder selected by the user, and only up to the selected depth.

## Archive File Mode

Archive File Mode lets the user:

- import or load a folder tree JSON file;
- view the current folder tree as a selectable archive destination tree;
- import one file through the browser file input;
- review the loaded file's basic browser metadata;
- receive a simple offline suggestion based on filename, extension, metadata, and folder-tree matching;
- select the folder where the loaded file should be archived;
- archive the loaded file to the selected folder-tree destination.

The archive action uses the browser directory picker. The user selects a folder from the app's folder tree first, then chooses the `Organize Your PC Root Folder` or its parent folder when the browser asks for folder access. The app creates or reuses the corresponding subfolder path and archives the loaded file into that destination.

If a file with the same name already exists in the selected destination folder, the app creates a safe archive name such as:

```text
filename_copy_1.ext
filename_copy_2.ext
```

The existing file is not overwritten.

## Simple Offline Folder Advisor

The app includes a small rule-based advisor. It runs locally in the browser and does not use Ollama, cloud AI, OCR, or external services.

The advisor uses these signals in this order:

1. filename keywords;
2. matching against the current folder-tree names;
3. file extension and browser file type;
4. basic metadata such as size and last modified date;
5. a simple confidence label: `High`, `Medium`, `Low`, or `Unsure`.

The advisor only suggests a destination. It does not select a folder unless the user clicks **Use suggested destination**, and it never archives a file automatically.

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

The app creates an application root folder named `Organize Your PC Root Folder` and then creates the visible folder tree below it. It does not inspect, delete, move, rename, or modify existing files.

## Existing Folder Tree Reading

Existing folder tree reading works only when all of the following are true:

1. The browser supports direct folder access.
2. The user clicks **Build Existing Folder Tree on this PC**.
3. The user chooses a folder depth: 1, 2, or 3 levels.
4. The user clicks **Choose Root Folder**.
5. The user chooses one local folder and grants browser permission.

The app reads only folder names inside the chosen root folder up to the selected depth. It does not read files or file content.

## Archiving

Archiving works only when all of the following are true:

1. A file has been imported through the browser file input.
2. A destination folder has been selected from the archive folder tree preview.
3. The browser supports direct folder access.
4. The user clicks **Archive the File**.
5. The user chooses the app root folder or its parent folder and grants browser permission.

The archive action sends the file to the selected folder-tree destination. It does not delete, move, rename, upload, or modify the original file.

## One File, One Canonical Destination

The app follows this principle:

```text
One file → one canonical destination
```

The current app leaves the final destination decision to the user. The folder tree acts as a memory guide and selectable destination map so the user can choose the folder where the file will be most naturally found later.

## Privacy and Safety

The app is local and browser-based.

It does not upload imported files or send imported file data to a server. It does not read or inspect the user's files automatically. A file is used only when the user imports it through the file input.

When reading an existing folder tree, it reads only folder names from the user-selected root folder up to the selected depth.

The app may use local browser storage only for simple preferences, such as whether the privacy notice has been accepted.

When folder creation, existing folder tree reading, or archiving is used, the user must manually choose a folder and give permission through the browser.

## Local Copyright Badge

The footer displays a local SVG copyright badge stored at `assets/images/local-copyright-protected-badge.svg`.

The badge links only to the local `LICENSE.md` file. It does not load images, scripts, badges, or tracking resources from third-party domains.

## Known Limitations

- The app is a user-controlled folder tree builder and archiver, not a background automatic file manager.
- Existing folder tree reading is limited to 1, 2, or 3 folder levels, selected by the user.
- The advisor is rule-based and depends mostly on filename quality and folder-tree names.
- The advisor does not read file content, perform OCR, or use AI.
- The current version does not deeply parse PDF, DOCX, XLSX, PPTX, scanned documents, images, or other rich document formats.
- The current version displays basic browser file metadata only.
- Folder selection codes are visual aids generated from the current tree order. They are not permanent IDs stored inside the actual folder names.
- Folder creation, existing folder tree reading, and archiving depend on browser support for direct local folder access.
