# Personal File Organisation Philosophy

Version: Master philosophy file aligned with the current browser app  
Status: Active working document  
Purpose: To document the personal, memory-based logic behind the current application structure.

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

## 3. Active Folder Organisation Structure

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
│   ├── INTERESTS
│   │   ├── CHESS
│   │   ├── SWIMMING
│   │   ├── MNEMONIC_TECHNIQUES
│   │   ├── BLOG_WRITING
│   │   └── WEB_APPS
│   └── LEARNING
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

The app may also display visual folder selection codes beside folders, such as `01`, `01.001`, or `02.004.001`. These codes help the user identify folders quickly in the interface. They are visual aids generated from the current tree order and are not part of the real folder names.

## 4. Logic Behind 01_PROFILE

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

## 5. Logic Behind 02_PERSONAL

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

## 6. Logic Behind INTERESTS

Interests represent long-term personal areas of engagement. These areas are remembered independently and naturally form their own categories.

Examples in the current app:

- Chess
- Swimming
- Mnemonic techniques
- Blog writing
- Web apps

Therefore, the logic is:

```text
Interest → Subject → File
```

The `INTERESTS` branch should not become a random storage area. If an interest grows large enough, it may later need deeper subfolders based on subject, project, function, or chronology.

## 7. Logic Behind 03_PROFESSIONAL

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

## 8. Thinking Types Used Below the Fixed First Level

The application allows each layer below the fixed first level to follow one thinking type.

### 8.1 Chronological

Used when the next level is best remembered by period, year, phase, or time range.

Examples:

```text
2002-2010_PRIVATE_SECTOR
2010-2019_MARINAS_PPP_DBFOT
2019-2026_STATE_FAIR_SITE_MANAGEMENT
2026-NOW_HEALTH_AND_SAFETY_OFFICER
```

### 8.2 Thematic

Used when the next level is best remembered by life area, subject, or theme.

Examples:

```text
FAMILY
HEALTH
FINANCIAL
INTERESTS
LEARNING
```

### 8.3 Functional

Used when the next level is best remembered by the function of the document.

Examples:

```text
CVS
DEGREES
CERTIFICATES
REFERENCES
SUPPORTING_EVIDENCE
```

### 8.4 Role-Based

Used mainly inside professional branches when files are best remembered by role or responsibility.

Examples:

```text
PROJECT_MANAGER
PUBLIC_OFFICER
COORDINATOR
HEALTH_AND_SAFETY_OFFICER
```

## 9. File Destination Philosophy

The app is an advisor.

It helps the user decide where a file should belong, but it does not replace the user's final judgement.

The app may consider:

- File name
- Browser metadata
- Readable text content, where the browser can read it directly
- Folder names
- Keyword mappings
- English, Greek, and Greeklish keywords where mappings exist

The app may show up to three ranked destination suggestions. These suggestions are possible destinations, not automatic filing decisions.

The user chooses one final folder.

The result is guidance, not an automatic decision.

The user should always ask:

```text
Where will I naturally look for this file in the future?
```

not only:

```text
What type of file is this?
```

## 10. One File, One Canonical Destination

The system follows this rule:

```text
One file → one canonical destination
```

A file may be relevant to more than one theme, function, period, or role. The app may therefore show several useful suggestions.

However, the file should be assigned to one final folder only. This avoids duplicate copies, conflicting versions, and confusion about which file is the final or authoritative version.

If a file is related to other areas, that relationship can be remembered through notes, tags, references, or future metadata, but not by placing duplicate copies in multiple folders.

## 11. Privacy and Safety Principle

The app is local and browser-based.

It does not:

- Upload files
- Delete files
- Move files
- Copy files
- Rename files
- Modify documents
- Read the user's file system automatically
- Monitor folders in the background
- Replace the user's final decision

A file is analysed only when the user imports it through the file input.

Folder creation is optional and controlled by the user. If direct folder creation is used, the user must choose a destination folder and give browser permission.

## 12. Inbox Handling

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
- Use the file destination guide before moving files into their final place

The principle remains:

1. New files may first arrive in a temporary place.
2. They should not remain there permanently.
3. They should later be assigned to the most natural memory-based destination.
4. The inbox should reduce decision fatigue, not become a dumping ground.

## 13. Reference Handling

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

## 14. Future Development

Future improvements may include:

- Local saving of the folder tree
- Safer import and export of personal folder structures
- Richer file parsing for PDF, DOCX, XLSX, PPTX, scanned documents, and images
- Improved keyword mappings in English, Greek, and Greeklish
- Better scoring for automatic folder suggestions
- Clearer explanation of why a folder was suggested
- Optional local indexing
- Optional tagging system
- Optional semantic search or AI classification in a future version
- Optional user-approved file copy or move workflow in a future version

The current app already includes JSON export and import of the folder tree, visual folder selection codes, and up to three ranked destination suggestions.

The objective is not only to store files efficiently, but also to retrieve information quickly and naturally.

## 15. Final Principle

The system is built around a simple observation:

**I do not remember files mainly by file type or exact storage location. I remember the context in which they matter.**

Therefore:

```text
Context → Function / Theme / Period / Role → Subject → File
```

is the foundation of the current file organisation system.

The file organisation system should follow memory first and storage structure second.

## 16. Consolidation Notes

This file replaces the older philosophy structure that used `00_INBOX_FROM_NOW`, `01_OFFICE`, and `02_PERSONAL` as the master first-level layout.

The current active master layout is now the same as the browser app and README:

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

This document is now the active philosophy document for the current app.
