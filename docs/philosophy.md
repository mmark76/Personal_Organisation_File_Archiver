# Personal File Organisation Philosophy

Version: Master philosophy file aligned with **Personal Memory-Based File Archiver**  
Status: Active working document  
Purpose: To document the personal, memory-based logic behind the current application structure and workflow.

## 1. Purpose

This file organisation system is not based primarily on traditional archival theory, file types, exact dates, or storage locations.

It is designed around the way I naturally remember and retrieve information.

**Make files easy to find by following the way my memory works.**

The current application uses the following fixed first-level structure:

```text
DOCUMENTS
├── 01_PROFILE
├── 02_PERSONAL
└── 03_PROFESSIONAL
```

This structure is the active master structure for the current browser app.

## 2. Core Discovery and Core Principle

The main discovery is that my memory is not organised mainly around file types, dates, or technical storage locations.

Most file systems are organised using one of the following approaches:

- File type, such as PDF, Word, Excel
- Date
- Department
- Client
- Project
- Topic

These approaches can be useful, but they do not fully match the way I recall information.

I usually remember:

- Which area of my life the file belongs to
- Which professional period or responsibility it relates to
- Which role I had at the time
- Which project or work object was involved
- Which life theme or interest it belongs to
- What function the document serves
- Why the file matters

I rarely remember first:

- The file type
- The exact storage location
- The exact date

Therefore, the system follows:

```text
Context → Role / Period / Theme / Function → Subject → File
```

instead of:

```text
File Type → Date → File
```

## 3. Current Application Identity

The current app name is:

```text
Personal Memory-Based File Archiver
```

The word **Archiver** is important.

The current app is not an automatic classifier, background file manager, or AI document sorter. It is a user-controlled local browser app that helps me build a memory-based folder tree and copy files manually into folders I choose.

The current app has two main modes:

1. **Build Folder Tree** — create, import, export, copy, and optionally create the folder tree locally on the computer.
2. **Archive File** — load one file, review basic file information, view the folder tree as guidance, and manually choose a destination folder for copying.

The app does not replace my judgement. It supports it.

## 4. Active Folder Organisation Structure

The active app structure has three fixed first-level branches.

```text
DOCUMENTS
│
├── 01_PROFILE
│   ├── CVS
│   ├── DEGREES
│   ├── CERTIFICATES
│   ├── REFERENCES
│   └── SUPPORTING_EVIDENCE
│
├── 02_PERSONAL
│   ├── FAMILY
│   ├── HEALTH
│   ├── FINANCIAL
│   └── INTERESTS
│       ├── CHESS
│       ├── SWIMMING
│       ├── MNEMONIC_TECHNIQUES
│       ├── BLOG_WRITING
│       ├── WEB_APPS
│       └── LEARNING
│
└── 03_PROFESSIONAL
    ├── 2002-2010_PRIVATE_SECTOR
    ├── 2010-2019_MARINAS_PPP_DBFOT
    ├── 2019-2026_STATE_FAIR_SITE_MANAGEMENT
    └── 2026-NOW_HEALTH_AND_SAFETY_OFFICER
```

This is the default example structure used by the current app.

The first level is fixed. Each layer below the fixed first level may be organised using one thinking type:

```text
001_CHRONOLOGICAL
002_THEMATIC
003_FUNCTIONAL
004_ROLE_BASED
```

The thinking type guides the naming of the next layer. It is not itself a folder name.

The app also displays visual folder selection codes beside folders, such as `01`, `01.001`, or `02.004.001`. These codes help me identify folders quickly in the interface. They are visual aids generated from the current tree order and are not part of the real folder names.

## 5. Logic Behind 01_PROFILE

The `01_PROFILE` branch contains documents that define, prove, support, or present my personal and professional identity.

This branch is remembered primarily by document function.

Examples:

- CVs
- Degrees
- Certificates
- References
- Supporting evidence

Therefore, the logic is:

```text
Profile Function → Document → File
```

This branch is useful for applications, professional presentations, official procedures, career development, and any situation where I need to prove who I am, what I studied, what I have done, or what evidence supports my profile.

## 6. Logic Behind 02_PERSONAL

The `02_PERSONAL` branch contains personal files that are not primarily remembered through work periods.

Personal files are usually remembered according to major life themes.

Examples:

- Family
- Health
- Financial
- Interests
- Learning

Therefore, the logic is:

```text
Life Theme → Subject → File
```

This branch should remain personal, practical, and easy to remember.

## 7. Logic Behind INTERESTS

Interests represent long-term personal areas of engagement. These areas are remembered independently and naturally form their own categories.

Examples in the current app:

- Chess
- Swimming
- Mnemonic techniques
- Blog writing
- Web apps
- Learning

Therefore, the logic is:

```text
Interest → Subject → File
```

The `INTERESTS` branch should not become a random storage area. If an interest grows large enough, it may later need deeper subfolders based on subject, project, function, or chronology.

## 8. Logic Behind 03_PROFESSIONAL

The `03_PROFESSIONAL` branch contains work-related documents.

Professional files are remembered primarily by professional period, responsibility, role, project, or work object.

The current default example structure is chronological at the first professional layer:

```text
03_PROFESSIONAL
├── 2002-2010_PRIVATE_SECTOR
├── 2010-2019_MARINAS_PPP_DBFOT
├── 2019-2026_STATE_FAIR_SITE_MANAGEMENT
└── 2026-NOW_HEALTH_AND_SAFETY_OFFICER
```

This reflects the fact that, for professional documents, I often remember the broad work period first, and then the project, responsibility, or role connected to the file.

Therefore, the logic is:

```text
Professional Period → Responsibility / Project / Role → Subject → File
```

## 9. Thinking Types Used Below the Fixed First Level

The application allows each layer below the fixed first level to follow one thinking type.

### 9.1 Chronological

Used when the next level is best remembered by period, year, phase, or time range.

Examples:

```text
2002-2010_PRIVATE_SECTOR
2010-2019_MARINAS_PPP_DBFOT
2019-2026_STATE_FAIR_SITE_MANAGEMENT
2026-NOW_HEALTH_AND_SAFETY_OFFICER
```

### 9.2 Thematic

Used when the next level is best remembered by life area, subject, or theme.

Examples:

```text
FAMILY
HEALTH
FINANCIAL
INTERESTS
LEARNING
```

### 9.3 Functional

Used when the next level is best remembered by the function of the document.

Examples:

```text
CVS
DEGREES
CERTIFICATES
REFERENCES
SUPPORTING_EVIDENCE
```

### 9.4 Role-Based

Used mainly inside professional branches when files are best remembered by role or responsibility.

In the current app, role-based thinking is intentionally available under the professional branch and restricted outside it.

Examples:

```text
PROJECT_MANAGER
PUBLIC_OFFICER
COORDINATOR
HEALTH_AND_SAFETY_OFFICER
```

## 10. Current Folder Tree Workflow

The current app lets me build the folder structure manually.

The workflow is:

1. Start from the fixed first level: `01_PROFILE`, `02_PERSONAL`, `03_PROFESSIONAL`.
2. Choose a thinking type for the next layer.
3. Add folders that match that thinking type.
4. Keep that layer internally consistent.
5. Review the visible structure.
6. Copy, export, import, or create the folder tree locally.

This preserves the memory logic of the system.

The folder tree is not only a storage structure. It is a retrieval map.

## 11. Current File Archiving Workflow

The current app supports manual copy archiving.

The workflow is:

1. Load or import the folder tree.
2. Load one file through the browser file input.
3. Review the file's basic browser metadata: name, type, size, and last modified date.
4. View the folder tree as a memory guide.
5. Click **Archive the File**.
6. Choose the final destination folder manually through the browser folder picker.
7. Give browser permission.
8. Let the app write a copy of the file into that selected folder.

The app does not currently choose the folder automatically.

The decisive question remains:

```text
Where will I naturally look for this file in the future?
```

not only:

```text
What type of file is this?
```

## 12. Current Scope and Non-Implemented Features

The current version does **not** yet include:

- automatic folder suggestions;
- ranked destination scoring;
- keyword mapping for destination recommendation;
- deep parsing of PDF, DOCX, XLSX, PPTX, scanned documents, or images;
- semantic search;
- AI classification;
- background file monitoring;
- automatic file movement;
- cloud sync;
- user accounts.

These may be future improvements, but they are not part of the current implemented app.

This distinction matters because the present philosophy must describe the actual working app, not a future imagined version.

## 13. One File, One Canonical Destination

The system follows this rule:

```text
One file → one canonical destination
```

A file may be relevant to more than one theme, function, period, or role.

However, the file should be assigned to one final folder only. This avoids duplicate copies, conflicting versions, and confusion about which file is the final or authoritative version.

If a file is related to other areas, that relationship can be remembered through notes, tags, references, or future metadata, but not by placing duplicate copies in multiple folders.

## 14. Privacy and Safety Principle

The app is local and browser-based.

It does not:

- Upload files
- Delete files
- Move files automatically
- Rename files
- Modify documents
- Read the user's file system automatically
- Monitor folders in the background
- Replace the user's final decision

A file is used only when the user imports it through the file input.

Copy archiving can copy the currently imported file only after the user explicitly clicks the archive action, chooses a destination folder, and grants browser permission.

Folder creation is optional and controlled by the user. If direct folder creation is used, the user must choose a destination folder and give browser permission.

## 15. Inbox Handling

The current app does not use `00_INBOX_FROM_NOW` as a fixed first-level folder.

The active first-level structure remains:

```text
01_PROFILE
02_PERSONAL
03_PROFESSIONAL
```

However, an inbox-style workflow can still be used outside the fixed structure if needed.

Possible options:

- Keep a temporary inbox outside the app-generated structure
- Add an `INBOX` folder manually under one of the fixed branches
- Use the folder tree before copying or moving files into their final place

The principle remains:

1. New files may first arrive in a temporary place.
2. They should not remain there permanently.
3. They should later be assigned to the most natural memory-based destination.
4. The inbox should reduce decision fatigue, not become a dumping ground.

## 16. Reference Handling

Reference material should be stored where it is most naturally remembered.

Examples of reference material:

- Manuals
- Templates
- Standards
- Guides
- Supporting documents
- Material consulted occasionally

`REFERENCE` should not become a general dumping ground.

If a document clearly belongs to a specific profile function, personal theme, professional period, responsibility, project, or interest, it should be stored there instead.

## 17. Future Development

Future improvements may include:

- Local saving of the folder tree
- Further refinements to import validation and recovery messages
- Richer file parsing for PDF, DOCX, XLSX, PPTX, scanned documents, and images
- Optional keyword mappings in English, Greek, and Greeklish
- Optional automatic destination suggestions
- Optional scoring for destination recommendations
- Clear explanations of why a folder is suggested
- Optional local indexing
- Optional tagging system
- Optional semantic search or AI classification
- Optional user-approved file move workflow

The current app already includes:

- fixed first-level memory structure;
- user-created deeper folder levels;
- thinking types for each layer;
- visual folder selection codes;
- JSON export and import of the folder tree;
- strict JSON import validation against the fixed first-level structure;
- copyable text output of the folder tree;
- optional local folder creation;
- one-file manual copy archiving;
- duplicate-safe copy naming;
- privacy notice preference stored locally.

The objective is not only to store files efficiently, but also to retrieve information quickly and naturally.

## 18. Final Principle

The system is built around a simple observation:

**I do not remember files mainly by file type or exact storage location. I remember the context in which they matter.**

Therefore:

```text
Context → Function / Theme / Period / Role → Subject → File
```

is the foundation of the current file organisation system.

The file organisation system should follow memory first and storage structure second.

## 19. Consolidation Notes

This file replaces older philosophy structures that used `00_INBOX_FROM_NOW`, `01_OFFICE`, and `02_PERSONAL` as the master first-level layout.

The current active master layout is now:

```text
DOCUMENTS
├── 01_PROFILE
├── 02_PERSONAL
└── 03_PROFESSIONAL
```

Older ideas are not discarded. They are absorbed as principles where useful:

- The old `OFFICE` logic is absorbed into `03_PROFESSIONAL`.
- The old `INBOX` logic remains a workflow principle, not a fixed first-level folder.
- The old `REFERENCE` logic remains a caution against dumping unrelated files into general reference folders.
- The memory-based principle remains unchanged.

This document is now the active philosophy document for **Personal Memory-Based File Archiver**.