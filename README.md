# Personal Memory-Based File Archiver

**Personal Memory-Based File Archiver** is a standalone browser-based tool that helps the user build a personal memory-based folder tree and copy files manually into user-selected archive folders.

The app follows a memory-based approach: files are organised according to how the user naturally remembers them, such as by life area, work period, responsibility, project, subject, interest, or document function.

The current app has two main working modes:

- **Build Folder Tree** — create, review, copy, export, import, and optionally create a memory-based folder tree on the local computer.
- **Archive File** — load one file, review its basic browser metadata, select a destination from the current folder tree, and copy the file to the corresponding local folder after the user grants browser permission.

The app does not delete, upload, rename, modify, automatically scan, or automatically move files. The archive action copies the imported file and leaves the original file untouched.

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
assets/js/folder-creation.js

assets/js/file-import.js
assets/js/file-archive.js

assets/js/modals.js
assets/js/feedback.js
assets/js/privacy-notice.js
assets/js/app-init.js

assets/images/organize-your-pc-logo.svg
```

The visible app interface is English-only.

## How to Run

Open `index.html` in a modern browser.

For direct local folder creation and copy-archiving operations, use a browser that supports the File System Access API, such as Chrome or Edge. Browser support may also depend on secure-context rules.

## What the App Does

The app provides two main working areas:

1. **Folder Tree** — the user can build, review, copy, export, import, and optionally create a personal folder tree on the computer. The visible tree also shows folder selection codes beside each folder, such as `01`, `01.001`, or `02.004.001`. These codes are visual selection aids and do not change the actual folder names.
2. **Archive File** — the user can load one file, review basic browser metadata, select a destination folder from the current folder tree preview, and copy the file to the corresponding local folder after choosing the app root folder or its parent folder through the browser folder picker.

The first level is fixed:

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

## Folder Tree Mode

Folder Tree Mode lets the user:

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

## Archive File Mode

Archive File Mode lets the user:

- import or load a folder tree JSON file;
- view the current folder tree as a selectable archive destination tree;
- select the folder where the loaded file should be archived;
- import one file through the browser file input;
- review the loaded file's basic browser metadata;
- copy the loaded file to the selected folder-tree destination.

The archive action uses the browser directory picker. The user selects a folder from the app's folder tree first, then chooses the `Organize Your PC Root Folder` or its parent folder when the browser asks for folder access. The app creates or reuses the corresponding subfolder path and writes a copy of the loaded file into that destination.

If a file with the same name already exists in the selected destination folder, the app creates a safe copy name such as:

```text
filename_copy_1.ext
filename_copy_2.ext
```

The existing file is not overwritten.

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

The current version also does not yet perform automatic folder suggestion, keyword scoring, semantic classification, or AI-based file classification. Those are possible future improvements.

## Local Folder Creation

Folder creation works only when all of the following are true:

1. The browser supports direct folder access.
2. The user clicks **Create Folder Tree on PC**.
3. The user chooses a root folder.
4. The user grants browser permission.

The app creates an application root folder named `Organize Your PC Root Folder` and then creates the visible folder tree below it. It does not inspect, delete, move, rename, or modify existing files.

## Copy Archiving

Copy archiving works only when all of the following are true:

1. A file has been imported through the browser file input.
2. A destination folder has been selected from the archive folder tree preview.
3. The browser supports direct folder access.
4. The user clicks **Archive the File**.
5. The user chooses the app root folder or its parent folder and grants browser permission.

The archive action copies the file to the selected folder-tree destination. It does not delete, move, rename, upload, or modify the original file.

## One File, One Canonical Destination

The app follows this principle:

```text
One file → one canonical destination
```

The current app leaves the final destination decision to the user. The folder tree acts as a memory guide and selectable destination map so the user can choose the folder where the file will be most naturally found later.

## Privacy and Safety

The app is local and browser-based.

It does not upload imported files or send imported file data to a server. It does not read or inspect the user's files automatically. A file is used only when the user imports it through the file input.

The app may use local browser storage only for simple preferences, such as whether the privacy notice has been accepted.

When folder creation or copy archiving is used, the user must manually choose a folder and give permission through the browser.

## Third-Party Copyright Badge

The footer currently displays a third-party Copyrighted.com badge image/link.

This badge is separate from the file archiver logic. The app does not use it to analyse files, upload files, move files, copy files, create folders, or classify documents.

If a fully self-contained offline build is required, the external badge can be removed or replaced with a static local badge/link.

## Known Limitations

- The app is a user-controlled folder tree builder and copy archiver, not a background automatic file manager.
- The current version does not include an automatic destination suggestion engine.
- The current version does not deeply parse PDF, DOCX, XLSX, PPTX, scanned documents, images, or other rich document formats.
- The current version displays basic browser file metadata only.
- Folder selection codes are visual aids generated from the current tree order. They are not permanent IDs stored inside the actual folder names.
- Folder creation and copy archiving depend on browser support for direct local folder access.
