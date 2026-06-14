# Privacy Notice

The **Personal Memory-Based File Archiver** is designed as a local, browser-based folder tree builder and user-controlled archiving tool.

## Local Use

The app runs in the user's browser.

It does not upload imported files to a server.
It does not delete, move, rename, or modify original files or folders.
It does not scan the user's file system automatically.
It accesses files or folders only after the user selects them through a browser picker.

In Archive File mode, the app can archive the currently imported file to a user-selected destination folder only after the user chooses that folder and gives browser permission. The original file is not deleted or moved. If a file with the same name already exists, the new copy receives a duplicate-safe name.

In Archive Folder mode, the app can read and recursively copy the selected folder only after the user chooses it. The original folder and its contents are not deleted or moved.

## File Information

When a file is imported, the current version displays browser-available information such as:

- file name;
- file type;
- file size;
- last modified date.

Some formats, such as PDF, DOCX, XLSX, PPTX, scanned documents, or images, are not deeply parsed by the current version.

## Simple Offline Folder Advisor

The app includes a small rule-based folder advisor. It runs locally in the browser and does not use Ollama, cloud AI, OCR, or external services.

The advisor uses only the imported file's name, extension, browser file type, size, last modified date, and the current folder tree. It does not read the file content.

The advisor only suggests a destination. It does not archive anything automatically.

## Existing Folder Tree Reading

The app can read an existing folder tree only after the user chooses one local root folder through the browser directory picker.

It reads only folder names inside the selected root folder, up to the user-selected depth of 1, 2, or 3 levels. It does not read files, inspect file content, perform OCR, or scan beyond the selected depth.

When the existing tree is selected for an archive workflow, the app requests read/write permission because that same selected root becomes the actual archive destination. Archive paths are created relative to that root; the app does not add another `Organize Your PC` wrapper around it.

## Folder Tree

The app lets the user build, import, export, copy, and optionally create a folder tree on the local computer.

Folder tree JSON files are handled locally in the browser. The user chooses when to import or export them.

## File System Permission and Safety

The app requests explicit read/write permission before creating archive output or a new folder structure. Where supported, it checks existing permission with the browser permission API and requests permission when needed.

If permission is denied, unavailable, or cancelled, the operation stops and displays a message. Archive output is not intentionally created before permission and destination checks succeed.

Folder archiving applies preflight limits to avoid attempting unusually large browser-based copies. It stops before destination output is created when the selected folder exceeds the supported file count, scanned-entry count, total size, individual-file size, or folder-depth limits. In that case, the app recommends using the operating system's normal copy-and-paste tools.

The app also prevents archiving a folder inside itself. If a recursive folder copy fails after it starts, the app attempts to remove the incomplete archive. It does not begin the copy when the browser cannot provide the removal capability required for safe rollback.

Only one archive operation is allowed at a time in the page. Where the browser supports Web Locks, the app also prevents simultaneous archive operations from other tabs on the same origin.

## Folder Selection Codes

The app may display visual folder selection codes beside folders in the folder tree, such as `01`, `01.001`, or `02.004.001`.

These codes are generated locally from the visible folder tree order. They are visual aids only and are not added to the real folder names.

## Local Browser Storage

The app may use local browser storage for simple preferences, such as remembering whether the privacy notice has been accepted.

This information stays in the user's browser unless the user clears browser data.

## Feedback Email

The feedback form uses the user's email client through a `mailto:` link.

The message is sent only if the user chooses to send it through their email client.

## Local Copyright Badge

The footer displays a local SVG copyright badge stored inside the app files.

The badge links only to the local `LICENSE.md` file. It does not load images, scripts, badges, or tracking resources from third-party domains.

## No Analytics or Advertising Tracking

The app does not include analytics scripts, advertising trackers, or advertising features.

## Backup Recommendation

As a good practice, users should keep a backup of important files. The app creates copies and does not delete original files or folders.

## Contact

For feedback or questions, use the feedback button inside the app or contact Markellos Markides directly.
