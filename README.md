# Personal Memory-Based File Advisor

**Personal Memory-Based File Advisor** is a simple browser-based tool that helps the user build a personal folder tree and decide where new files should be archived.

The app follows a memory-based approach: files are organised according to how the user naturally remembers them, such as by life area, work period, responsibility, project, subject, interest, or document function.

The app is designed as an advisor. It does not move, delete, upload, or modify files. It can optionally create the suggested folder tree locally on the user's computer, only after the user chooses a destination folder and gives browser permission.

## Current App

The app is implemented as a standalone browser app:

```text
index.html
assets/css/styles.css
assets/js/app.js
```

It can be opened directly in a web browser.

The visible app interface is English-only. Imported files may be in English, Greek, Greeklish, or another language, depending on the keywords that can be matched.

## What the App Does

The app provides two main working areas.

### 1. Folder Tree

The left panel allows the user to build and review a personal folder tree.

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

The current default example tree includes:

```text
01_PROFILE
├── CVS
├── DEGREES
├── CERTIFICATES
├── REFERENCES
└── SUPPORTING_EVIDENCE

02_PERSONAL
├── FAMILY
├── HEALTH
├── FINANCIAL
├── INTERESTS
│   ├── CHESS
│   ├── SWIMMING
│   ├── MNEMONIC_TECHNIQUES
│   ├── BLOG_WRITING
│   └── WEB_APPS
└── LEARNING

03_PROFESSIONAL
├── 2002-2010_PRIVATE_SECTOR
├── 2010-2019_MARINAS_PPP_DBFOT
├── 2019-2026_STATE_FAIR_SITE_MANAGEMENT
└── 2026-NOW_HEALTH_AND_SAFETY_OFFICER
```

The user can copy the structure, download it as text, or optionally create the folders locally through a supported browser.

### 2. File Destination Guide

The right panel helps the user decide where a new file should be archived.

The user can:

- type a file name manually;
- import a file for local browser-based analysis;
- follow the folder tree step by step until a final folder is selected;
- accept an automatic folder suggestion when one is available;
- preview and copy the resulting file destination advice.

The file destination guide does not move the file. It only suggests a folder and leaves the final decision to the user.

## File Import Analysis

When the user imports a file, the app uses browser-available information to suggest the most relevant folder.

The app may use:

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

The app includes keyword matching for English, Greek, and Greeklish where specific keyword mappings exist.

## Folder Tree Creation

The app can create the suggested folder tree locally on the user's computer.

This is done through direct browser folder creation:

- The user clicks **Create Folders on This PC**.
- The browser asks the user to choose a destination folder.
- The app creates the suggested folder tree inside that chosen folder.
- This requires a supported browser such as Chrome or Edge.

Folder creation is optional and controlled by the user.

## What the App Does Not Do

The app does not:

- move files;
- delete files;
- upload files;
- modify documents;
- read the user's file system automatically;
- monitor folders in the background;
- replace the user's final decision.

## Core Idea

People often do not remember files by file type, exact date, or exact storage location.

Instead, they often remember:

- the context in which the file was created;
- the role they had at the time;
- the project or responsibility involved;
- the life theme or interest connected to the file;
- the person connected to the file;
- the reason the file matters;
- whether the file requires future action.

For this reason, the app follows a memory-based approach to file organisation.

## Privacy and Safety

The app is local and browser-based.

It does not upload files or send data to a server.

It does not read or inspect the user's files automatically. A file is analysed only when the user imports it through the file input.

When folder creation is used, the user must manually choose a destination folder and give permission through the browser.

The user should manually check every suggested folder structure or file destination before taking action.

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
- text export.

Possible future improvements may include:

- richer file parsing for PDF, DOCX, XLSX, and other formats;
- optional local storage;
- safer import/export of tree templates;
- more multilingual keyword mappings;
- improved scoring for automatic folder suggestions;
- clearer user guide documentation.