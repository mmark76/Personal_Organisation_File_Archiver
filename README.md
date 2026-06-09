# Personal Memory-Based File Advisor

**Personal Memory-Based File Advisor** is a standalone browser-based tool that helps the user build a personal folder tree and decide where new files should be archived.

The app follows a memory-based approach: files are organised according to how the user naturally remembers them, such as by life area, work period, responsibility, project, subject, interest, or document function.

The app is an advisor. It does not move, delete, upload, rename, or modify files. It can optionally create the suggested folder tree locally on the user's computer, only after the user chooses a destination folder and gives browser permission.

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
assets/js/folder-creation.js
assets/js/example-import.js
assets/js/feedback.js
assets/js/privacy-notice.js
assets/js/theme-toggle.js

assets/images/organize-your-pc-logo.svg
```

The visible app interface is English-only. Imported files may be in English, Greek, Greeklish, or another language, depending on the keywords that can be matched.

## How to Run

Open `index.html` in a modern browser.

For direct local folder creation, use a supported browser such as Chrome or Edge. Browser support may depend on secure-context rules and the File System Access API.

## What the App Does

The app provides two main working areas:

1. **Folder Tree** — the user can build, review, copy, download, and optionally create a personal folder tree.
2. **File Destination Guide** — the user can type or import a file name, follow the tree step by step, accept an automatic suggestion, and copy the resulting filing advice.

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

## Privacy and Safety

The app is local and browser-based.

It does not upload imported files or send imported file data to a server. It does not read or inspect the user's files automatically. A file is analysed only when the user imports it through the file input.

The app may use local browser storage only for simple preferences, such as theme preference and whether the privacy notice has been accepted.

When folder creation is used, the user must manually choose a destination folder and give permission through the browser.

## Third-Party Copyright Badge Script

The page currently loads a third-party helper script from Copyrighted.com to display the copyright registration badge in the footer.

This script is separate from the file advisor logic. The app does not use it to analyse files, upload files, move files, create folders, or classify documents.

If a fully self-contained offline build is required, this external badge helper can be removed or replaced with a static local badge/link.

## Known Limitations

- The app is an advisory tool, not an automatic file manager.
- Automatic suggestions are based on folder names, keyword mappings, file name, browser metadata, and readable text content where available.
- Suggestions may be incomplete or inaccurate when file names are vague or when readable text is not available.
- PDF, DOCX, XLSX, PPTX, scanned documents, and images are not deeply parsed by the current version.
- Keyword mappings are limited and do not cover every possible English, Greek, or Greeklish term.
- The current app usually presents one best automatic suggestion rather than several ranked alternatives.
- Folder creation depends on browser support for direct local folder access.
- Direct folder creation may require a supported browser and a secure context, depending on browser rules.
- The app does not currently include user accounts, cloud sync, background monitoring, or automatic indexing.
- Persistent custom tree storage and full template import/export are future improvements.

## Related Documentation

The personal philosophy behind this system is documented separately in:

```text
docs/philosophy.md
```

That document explains the memory-based file organisation principles in more depth.

## Project Status

This project is currently a standalone browser-based advisory tool with:

- English-only app UI;
- editable personal folder tree;
- default memory-based example tree;
- step-by-step destination guidance;
- local file import analysis;
- optional local folder creation;
- local privacy notice preference;
- local theme preference;
- text export.
