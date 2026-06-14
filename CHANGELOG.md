# Changelog

## 2026-06-14

### Archive Safety and Reliability

- Existing folder trees now retain the selected root as the actual archive destination.
- Archive paths for an existing tree are relative to that root, without an additional or duplicated `Organize Your PC` wrapper.
- Read/write permission is explicitly checked before folder creation or archive writes.
- Permission denial and picker cancellation stop the operation with a clear message and no intentional archive output.
- Stale asynchronous existing-tree loads cannot update another mode or overwrite newer tree state.
- Folder archives are checked before copying and stop when they exceed the documented browser safety limits.
- Folder destinations inside the source folder are rejected.
- Incomplete folder archives are rolled back after a mid-copy failure when the browser supports safe recursive removal.
- Folder archiving does not start when the browser cannot provide the removal capability required for safe rollback.
- Simultaneous file and folder archive operations are blocked in the page and, where supported, across tabs on the same origin.

### User Experience and Documentation

- Added optional, explicit Google Analytics consent with a persistent reject option and footer control for changing the choice.
- Restricted analytics to a fixed set of non-sensitive usage events and prevented the Google tag from loading on local test pages or before consent.
- Added clear messages for permission, cancellation, oversized folders, blocked operations, rollback, and successful archives.
- Added a discreet backup recommendation to the main page and Disclaimer while clarifying that the app copies files and does not delete originals.
- Moved the Settings control into the initial HTML so the main-page control is available without being created dynamically.
- Expanded the in-browser core suite to 23 focused tests.
- Updated the README, privacy notice, testing guidance, project philosophy, metadata, web manifest, and sitemap to describe the current behavior.
