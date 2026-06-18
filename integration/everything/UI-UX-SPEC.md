# Everything Search UI/UX Specification

## Purpose

The Everything integration appears as a dedicated **Search this PC** screen inside the existing Organize Your PC application. It uses the existing black-and-gold shell and keeps the four archive and folder-tree workflows unchanged.

## Entry point

The main choice screen includes a fifth card:

- **Search this PC**
- orange search mark;
- short explanation that the feature finds local file and folder names through Everything.

## Search screen

The dedicated screen includes:

1. **Back to main choices**;
2. one primary search field;
3. Search and Cancel buttons;
4. basic filters;
5. local connection status;
6. results;
7. Everything attribution.

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

The download action opens the official voidtools download page and does not redistribute Everything binaries.

## Results

Each result displays:

- local item name;
- file or folder kind;
- the path value returned by the companion, redacted by default.

The results are discovery-only. They do not automatically start an archive action or grant filesystem access.

## Responsive behaviour

- desktop: filters appear in a compact multi-column grid;
- medium screens: filters use two columns;
- small screens: filters stack into one column and action buttons become full-width where appropriate.

## Accessibility

- every field has a visible or screen-reader label;
- status and results use polite live regions;
- disabled and busy states are reflected in native controls;
- keyboard navigation follows normal form order;
- the back action returns to the main choice screen.
