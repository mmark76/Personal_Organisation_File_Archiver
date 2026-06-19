# Changelog

## 2026-06-19

### Everything Search Integration

- Added a fifth main choice, **Search this PC**, inside the existing Organize Your PC interface.
- Added a dedicated local search screen powered by Everything through the loopback-only .NET companion service.
- Added basic filters for result type, file category, modified date, file size, filename matching, result count, and Windows location.
- Added a permanent **Install Everything** button that opens the official voidtools download page and includes short installation guidance.
- Added Everything branding to the search entry point and changed the main-choice layout to smaller, more compact controls.
- Added structured filter validation in both the browser client and companion API.
- Added SDK-first search with controlled `es.exe` fallback.
- Added origin checks, short-lived session headers, rate limiting, redacted display paths, and loopback-only communication.
- Added browser and companion CI coverage for the dedicated search screen, filters, session handling, unavailable state, navigation, and regression safety.
- Added and updated Everything integration documentation and third-party attribution.

## 2026-06-14

### Archive Safety and Reliability

- Existing folder trees now retain the selected root as the actual archive destination.
- Archive paths for an existing tree are relative to that root, without an additional or duplicated `Organize Your PC` wrapper.
- Read/write permission is explicitly checked before folder creation or archive writes.
- Permission denial and picker cancellation stop the operation with a clear message and no intentional archive output.
- Stale asynchronous existing-tree loads cannot update another mode or overwrite newer tree state.
- Folder archives are checked before copying and stop when they exceed the documented browser safety limits.
- Folder destinations inside the source folder are rejected, including relative paths below a retained existing-tree root.
- Failed file writes are aborted and incomplete archived files are removed when the browser provides safe removal support.
- Incomplete folder archives are rolled back after a mid-copy failure when the browser supports safe recursive removal.
- Folder archiving does not start when the browser cannot provide the removal capability required for safe rollback.
- Simultaneous file and folder archive operations are blocked in the page and, where supported, across tabs on the same origin.

### User Experience and Documentation

- Added optional, explicit Google Analytics consent with a persistent reject option and footer control for changing the choice.
- Restricted analytics to a fixed set of non-sensitive usage events and prevented the Google tag from loading on local test pages or before consent.
- Added clear messages for permission, cancellation, oversized folders, blocked operations, rollback, and successful archives.
- Added a discreet backup recommendation to the main page and Disclaimer while clarifying that the app copies files and does not delete originals.
- Moved the Settings control into the initial HTML so the main-page control is available without being created dynamically.
- Expanded the in-browser core suite to 25 focused tests.
- Updated the README, privacy notice, testing guidance, project philosophy, metadata, web manifest, and sitemap to describe the current behavior.
