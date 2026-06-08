# Personal File Organisation Philosophy

**Consolidated from the TXT, DOCX and Markdown versions; all unique ideas preserved.**

Version: Master consolidated file  
Purpose: To keep one single source of truth for the personal file organisation system, while preserving the full philosophy, structure, rules and future-development ideas from the three similar source files.

## 1. Purpose

This file organisation system is not based on traditional archival theory, file types, or dates.

Instead, it is designed around the way I naturally remember and retrieve information.

**Make files easy to find by following the way my memory works.**

## 2. Core Discovery and Core Principle

The main discovery is that my memory is not organised around file types, dates, or storage locations. Instead, it is primarily organised around context.

Most file systems are organised using one of the following approaches:

- File type, such as PDF, Word, Excel
- Date
- Department
- Client
- Project
- Topic

While these approaches are useful, they do not fully match the way I recall information.

I usually remember:

- Which phase of my life it belonged to
- Which role I had at the time
- Which project I was working on
- Which responsibility I had
- Which life theme it relates to
- Which interest it belongs to

I rarely remember:

- The file type
- The exact storage location
- The exact date

Therefore, the system follows:

```text
Context → Role / Period → Subject → File
Life Context → Role / Period → Subject → File
```

instead of:

```text
File Type → Date → File
```

## 3. File Organisation Structure

```text
DOCUMENTS
│
├── 00_INBOX_FROM_NOW
│
├── 01_OFFICE
│   │
│   ├── 2002-01-01_to_2010-01-31_PRIVATE_SECTOR
│   │   ├── PROJECT_1
│   │   ├── PROJECT_2
│   │   ├── PROJECT_3
│   │   ├── PROJECT_4
│   │   ├── PROJECT_5
│   │   ├── ...
│   │   └── REFERENCE
│   │
│   ├── 2010-02-01_to_2018-12-31_MECIT
│   │   ├── MARINAS_PPP_DBFOT
│   │   ├── RECREATIONAL_BOAT_MOORING_FACILITIES_PERMITS
│   │   ├── TOURISM_GENERAL
│   │   ├── ADMINISTRATION
│   │   └── REFERENCE
│   │
│   └── 2019-01-01_to_NOW_MECI
│       ├── STATE_FAIR
│       ├── HEALTH_AND_SAFETY
│       ├── ADMINISTRATION
│       └── REFERENCE
│
└── 02_PERSONAL
    │
    ├── FAMILY
    ├── HEALTH
    ├── FINANCIAL
    ├── TRAVELS
    │
    ├── INTERESTS
    │   ├── CHESS
    │   ├── MNEMONICS
    │   ├── BLOGS
    │   ├── APPS
    │   ├── AI
    │   ├── MEDITATION
    │   ├── SWIMMING
    │   ├── MOVIES_SERIES
    │   └── MUSIC
    │
    ├── LEARNING
    │   └── PMP_PMI
    │
    └── REFERENCE
```

## 4. Logic Behind OFFICE

### 4.1 Office Documents: Professional Period First

For work-related information, I first remember the professional period of my life. The OFFICE structure therefore follows role, period and responsibility before file type or date.

### 4.2 Private Sector, 2002–2010

Files are remembered primarily by project.

When looking for information from this period, I usually remember:

- The project
- The construction site
- The client
- The contract

I do not usually remember the year or file type first.

Therefore, the primary organisational unit is the project itself:

```text
Project → Subject → File
```

### 4.3 MECIT, 2010–2018

Files are remembered primarily by area of responsibility.

Examples:

- Marinas, PPP / DBFOT
- Recreational Boat Mooring Facilities Permits
- Tourism
- Administration

Therefore:

```text
Area of Responsibility → Subject → File
```

### 4.4 MECI, 2019–Present

Files are remembered primarily by work object or operational responsibility.

Examples:

- State Fair
- Health and Safety
- Administration

Therefore:

```text
Work Object → Subject → File
```

## 5. Logic Behind PERSONAL

Personal files are not remembered chronologically. They are remembered according to major life themes.

Examples:

- Family
- Health
- Financial
- Travels
- Interests

Therefore:

```text
Life Theme → Subject → File
```

## 6. Logic Behind INTERESTS

Interests represent long-term personal areas of engagement. These areas are remembered independently and naturally form their own categories.

Examples:

- Chess
- Mnemonics
- Blogs
- Apps
- Artificial Intelligence / AI
- Meditation
- Swimming
- Movies & Series
- Music

Therefore:

```text
Interest → Subject → File
```

## 7. INBOX Philosophy

The purpose of the following folder is to serve as a temporary landing area for newly received files:

```text
00_INBOX_FROM_NOW
```

Rules:

1. New files arrive here first.
2. Files should not remain permanently inside the Inbox.
3. Files are periodically moved to their proper location.
4. The Inbox prevents immediate decision fatigue.

## 8. REFERENCE Philosophy

REFERENCE folders are intended for:

- Manuals
- Templates
- Standards
- Guides
- Supporting documents
- Material consulted occasionally

REFERENCE should not become a dumping ground.

If a document clearly belongs to a specific project, responsibility, life theme, or interest, it should be stored there instead.

## 9. Future Development

This folder structure is Version 1.0.

Future improvements may include:

- File indexing
- Metadata extraction
- Search database
- Tagging system
- Semantic search using AI
- Automated classification using Python

The objective is not only to store files efficiently but also to retrieve information quickly and naturally.

## 10. Final Principle

The system is built around a simple observation:

**I do not remember where a file is stored. I remember the context in which it was created.**

Therefore:

```text
Context → Subject → File
```

is the foundation of this entire file organisation system.

The file organisation system should follow context first and storage structure second.

## 11. Consolidation Notes

This master file consolidates the three similar source files into one single source of truth.

Preserved from the full README/TXT and DOCX versions:

- Purpose
- Core Principle
- Full folder structure
- Logic behind OFFICE
- Logic behind PERSONAL
- Logic behind INTERESTS
- INBOX Philosophy
- REFERENCE Philosophy
- Future Development
- Final Principle

Preserved from the Markdown philosophy file:

- Core Discovery
- Life Context → Role / Period → Subject → File
- Office Documents as professional-period-first retrieval
- The explicit distinction between natural memory search and storage structure
- The final statement that the system should follow context first and storage structure second

Recommended archive handling for the older files: move the three source files to a folder such as `REFERENCE / OLD_VERSIONS`, and use this master file as the active working document.
