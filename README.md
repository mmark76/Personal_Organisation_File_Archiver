# Personal Memory-Based File Advisor

**Personal Memory-Based File Advisor** is a standalone browser-based tool that helps the user build a personal folder tree and decide where new files should be archived.

The app follows a memory-based approach: files are organised according to how the user naturally remembers them, such as by life area, work period, responsibility, project, subject, interest, or document function.

The app has two workflow modes:

- **Advisor Mode** — suggests destinations and prepares filing advice only.
- **Archiver Mode** — can copy the currently imported file to one user-confirmed destination folder after the user chooses a root folder and gives browser permission.

The app does not delete, upload, rename, modify, or automatically move files. Archiver Mode copies the imported file and leaves the original file untouched.

## Current App Structure

```text
index.html
site.webmanifest
LICENSE.md
PRIVACY.md

docs/philosophy.md

assets/css/styles.css
assets/css/legal.css
assets/css/examples.css
assets/css/header-hero.css
assets/css/responsive.css
assets/css/app-explanation.css
assets/css/theme-toggle.css

assets/js/app.js
assets/js/folder-tree-codes.js
assets/js/top-folder-suggestions.js
assets/js/workflow-mode.js
assets/js/folder-creation.js
assets/js/json-export.js
assets/js/example-import.js
assets/js/feedback.js
assets/js/privacy-notice.js
assets/js/theme-toggle.js

assets/images/organize-your-pc-logo.svg
```

The visible app interface is English-only. Imported files may be in English, Greek, Greeklish, or another language, depending on the keywords that can be matched.

## How to Run

Open `index.html` in a modern browser.

For direct local folder creation and Archiver Mode copy operations, use a supported browser such as Chrome or Edge. Browser support may depend on secure-context rules and the File System Access API.

## What the App Does

The app provides two main working areas:

1. **Folder Tree** — the user can build, review, copy, download, and optionally create a personal folder tree. The visible tree also shows folder selection codes beside each folder, such as `01`, `01.001`, or `02.004.001`. These codes are visual selection aids and do not change the actual folder names.
2. **File Destination Guide** — the user can type or import a file name, review up to three ranked folder suggestions, choose one final destination, follow the tree step by step, copy the resulting filing advice, or use Archiver Mode to copy the imported file to the confirmed destination.

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

## Folder Selection Codes

The app displays visual folder selection codes beside folders in the left folder tree.

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

These codes help the user identify a destination quickly. They are generated from the current tree order and are not inserted into the real folder names.

## File Import Analysis

When the user imports a file, the app may use:

- file name;
- browser metadata, such as file type, size, and modified date;
- readable text content where the browser can read it directly.

Readable text content is currently supported for simple text-based files such as:

```text
.txt
.md
.csv
.json
.html
.htm
.xml
.rtf
```

For files such as PDF, DOCX, XLSX, PPTX, scanned documents, or images, the browser may provide only the filename and basic metadata unless additional parsing libraries are added later.

The app may show up to three suggested destination folders. The user must choose one final destination. The suggestions are advisory until the user confirms a destination.

## Advisor Mode and Archiver Mode

In **Advisor Mode**, the app only:

- analyses the imported file or typed file name;
- suggests up to three relevant destination folders;
- lets the user choose one final destination;
- prepares advice that can be previewed or copied.

In **Archiver Mode**, the app can additionally copy the currently imported file to the confirmed destination folder.

Archiver Mode works only when all of the following are true:

1. A file has been imported through the browser file input.
2. The user has confirmed one final destination folder.
3. The browser supports direct folder access.
4. The user chooses the root folder and gives permission.

Archiver Mode copies the file. It does not delete, move, rename, upload, or modify the original file. If a file with the same name already exists in the destination, the app creates a safe copy name instead of overwriting the existing file.

## One File, One Canonical Destination

The app follows this principle:

```text
One file → one canonical destination
```

The app may suggest several relevant folders, but the user should select only one final folder for the file. This avoids duplicate filing, conflicting versions, and uncertainty about which copy is the final one.

## Privacy and Safety

The app is local and browser-based.

It does not upload imported files or send imported file data to a server. It does not read or inspect the user's files automatically. A file is analysed only when the user imports it through the file input.

The app may use local browser storage only for simple preferences, such as theme preference and whether the privacy notice has been accepted.

When folder creation or Archiver Mode is used, the user must manually choose a destination/root folder and give permission through the browser.

## Third-Party Copyright Badge Script

The page currently loads a third-party helper script from Copyrighted.com to display the copyright registration badge in the footer.

This script is separate from the file advisor and archiver logic. The app does not use it to analyse files, upload files, move files, copy files, create folders, or classify documents.

If a fully self-contained offline build is required, this external badge helper can be removed or replaced with a static local badge/link.

## Known Limitations

- The app is an advisory tool and optional user-controlled copy archiver, not a background automatic file manager.
- Automatic suggestions are based on folder names, keyword mappings, file name, browser metadata, and readable text content where available.
- Suggestions may be incomplete or inaccurate when file names are vague or when readable text is not available.
- The app may show up to three ranked destination suggestions, but the user remains responsible for selecting the final folder.
- Archiver Mode copies only the currently imported file after user confirmation and browser permission.
- Archiver Mode does not move, delete, rename, upload, or modify the original file.
- PDF, DOCX, XLSX, PPTX, scanned documents, and images are not deeply parsed by the current version.
- Keyword mappings are limited and do not cover every possible English, Greek, or Greeklish term.
- Folder selection codes are visual aids generated from the current tree order. They are not permanent IDs stored inside the actual folder names.
- Folder creation and Archiver Mode depend on browser support for direct local folder access.
- Direct folder access may require a supported browser and a secure context, depending on browser rules.
- The app does not currently include user accounts, cloud sync, background monitoring, automatic indexing, or automatic file moving.
- Persistent custom tree storage is a future improvement.

## Related Documentation

The personal philosophy behind this system is documented separately in:

```text
docs/philosophy.md
```

That document explains the memory-based file organisation principles in more depth.

## Project Status

This project is currently a standalone browser-based advisory and optional copy-archiving tool with:

- English-only app UI;
- editable personal folder tree;
- default memory-based example tree;
- visual folder selection codes in the left folder tree;
- Advisor Mode for advice only;
- Archiver Mode for user-confirmed file copying;
- step-by-step destination guidance;
- up to three ranked folder suggestions;
- one final user-selected destination for each file;
- local file import analysis;
- optional local folder creation;
- JSON export and import of the folder tree;
- local privacy notice preference;
- local theme preference;
- text export.
