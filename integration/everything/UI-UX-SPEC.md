# Everything Search UI/UX Specification

## Purpose

The Everything integration appears as a dedicated **Search this PC** screen inside the existing Organize Your PC application. It uses the existing black-and-gold shell and keeps the four archive and folder-tree workflows unchanged.

## Entry point

The main choice screen includes a fifth, compact control:

- **Search this PC**;
- Everything branding with the magnifying-glass graphic and the word **Everything**;
- a short explanation that the feature finds local file and folder names through Everything.

The full main-choice area uses smaller controls in a compact multi-column layout rather than large feature cards.

## Search screen

The dedicated screen includes:

1. **Back to main choices**;
2. Everything branding;
3. one primary search field;
4. Search and Cancel buttons;
5. a permanently visible **Install Everything** button;
6. basic filters;
7. local connection status;
8. results;
9. Everything attribution.

## Install Everything action

The permanent install action:

- appears beside the Search button on wider screens;
- opens the official voidtools download page in a new tab;
- displays **Download · Install · Start** as short guidance;
- includes a longer accessible tooltip/label;
- does not download or redistribute an Everything installer from this repository.

When the companion or Everything runtime is unavailable, the separate setup panel also provides Download Everything, Installation Guide, and Check Again actions.

## Basic filters

The visible filter area includes:

- result type: all, files, or folders;
- file category: PDF, documents, spreadsheets, presentations, images, audio, video, or archives;
- modified date: any time, today, this week, this month, last 7 days, or last 30 days;
- file size: any size, up to 100 KB, 100 KB to 1 MB, 1 MB to 16 MB, 16 MB to 128 MB, or over 128 MB;
- filename matching: contains, exact filename, or starts with;
- result count: 20 or 50;
- optional Windows drive or folder location;
- Clear filters action.

Filters remain simple form controls. Raw Everything syntax is not required from the user.

## Connection states

### Checking

The search controls are temporarily disabled and the screen reports that the local companion is being checked.

### Ready

The status reports the active backend, such as SDK, and enables the search field and filters.

### Unavailable

The screen shows:

- **Everything is required**;
- Download Everything;
- Installation Guide;
- Check Again;
- a reminder that search remains local.

## Results

Each result displays:

- local item name;
- file or folder kind;
- the path value returned by the companion, redacted by default.

The results are discovery-only. They do not automatically start an archive action or grant filesystem access.

## Responsive behaviour

- desktop: compact main choices and filter controls use multi-column layouts;
- medium screens: the main choices and filters reduce their column count;
- small screens: controls stack into one column and Search, Install Everything, and Cancel become full-width where appropriate.

## Accessibility

- every field has a visible or screen-reader label;
- status and results use polite live regions;
- disabled and busy states are reflected in native controls;
- the install action has an explanatory accessible label;
- keyboard navigation follows normal form order;
- the back action returns to the main choice screen.
