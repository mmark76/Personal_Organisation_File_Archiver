# Everything Integration Test Plan

## Purpose

Verify that the optional search feature works correctly, fails safely, and does not affect the existing application areas.

## Contract tests

- Health response uses documented status and backend values.
- Search accepts valid query, type, limit, extension, modified-date, size, location, and match values.
- Invalid query and filter values return stable Problem Details responses.
- Results follow the documented response shape.
- Display paths remain redacted by default.
- The short-lived session token is accepted only through the approved request header.

## Provider tests

### SDK backend

- Ready Everything instance returns results.
- Zero-result search completes normally.
- File-only and folder-only filters return the requested kinds.
- Structured filters are translated into the expected Everything query.
- Cancellation returns promptly.
- Provider errors become safe API errors.

### CLI fallback

- Zero-result output reaches end-of-stream and completes.
- Fewer results than the configured limit complete normally.
- Arguments are passed without shell interpretation.
- Cancellation terminates the child process.
- Structured filters use the same validated provider query as the SDK backend.

## Browser tests

- The main screen contains five choices.
- Search this PC opens a dedicated screen.
- Health check controls ready and unavailable states.
- Session token is sent in the approved header and never in the URL.
- Search results are rendered safely.
- Basic filters are transmitted correctly:
  - result type;
  - file category;
  - modified date;
  - file size;
  - filename matching;
  - result count;
  - Windows location.
- Clear filters restores the documented defaults.
- The permanent Install Everything action points to the official voidtools download page.
- The unavailable setup panel and installation guide remain accessible.
- Back to main choices restores the main screen.

## Visual and responsive checks

- Everything branding appears at the main entry point and search screen.
- The word **Everything** remains legible at supported desktop sizes.
- Main choices use the compact multi-column layout.
- Medium and small screens reduce columns without overlap.
- Search, Install Everything, and Cancel stack correctly on narrow screens.
- Focus outlines and keyboard order remain visible and logical.

## Privacy tests

- Search requests target loopback only.
- No query or path is sent to a remote origin.
- Full paths are not written to browser storage.
- Search history is not persisted by default.
- Session tokens are not placed in URLs.

## Regression tests

With the companion stopped, verify that these areas still work unchanged:

1. Build New Folder Tree.
2. View Existing Folder Tree on this PC.
3. Archive a File.
4. Archive a Folder.

## Manual Windows test

1. Start Everything.
2. Start the updated .NET companion.
3. Start the local HTTP server from the repository root.
4. Open Search this PC and confirm the ready state.
5. Test every basic filter individually.
6. Test two or more filters together.
7. Confirm Clear filters restores defaults.
8. Confirm Install Everything opens the official voidtools download page.
9. Confirm the compact main screen and Everything branding render correctly.
10. Confirm the four existing application choices still open normally.
11. Stop the companion and confirm the unavailable state.

## Release condition

The feature may be merged and published only after the latest CI run succeeds, the manual Windows checks are accepted, documentation and attribution are current, and the four existing application areas remain unaffected.
