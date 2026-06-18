# Everything Integration Test Plan

## Purpose

Verify that the optional search feature works correctly, fails safely, and does not affect the existing application areas.

## Contract tests

- Health response uses only documented status and provider values.
- Search accepts valid query, type, and limit values.
- Invalid query, type, and limit values return stable error codes.
- Results follow the normalized response shape.
- Full paths remain absent or null by default.

## Provider tests

### SDK provider

- Ready Everything instance returns results.
- Zero-result search completes normally.
- File-only and folder-only filters return the requested kinds.
- Concurrent requests do not contaminate each other.
- Cancellation returns promptly.
- Provider errors become normalized API errors.

### CLI provider

- Zero-result output reaches end-of-stream and completes.
- Fewer results than the configured limit complete normally.
- Exit code and standard error are evaluated.
- Timeout terminates the child process.
- Cancellation terminates the child process.
- Arguments are passed without shell interpretation.

## Browser tests

- Search screen remains hidden until explicitly activated.
- Health check controls the ready and unavailable states.
- Session token is sent in the approved header and never in the URL.
- Duplicate search submission is prevented.
- Cancel action restores the ready state.
- Empty, timeout, unavailable, and provider-failure messages render safely.
- Result text is escaped before rendering.
- Keyboard navigation and focus restoration work.

## Privacy tests

- Search requests target loopback only.
- No query or path is sent to a remote origin.
- Full paths are not written to browser storage.
- Search history is not persisted by default.
- Logs do not contain full local paths during normal operation.

## Regression tests

With the companion stopped, verify that these areas still work unchanged:

1. Build New Folder Tree.
2. View Existing Folder Tree on this PC.
3. Archive a File.
4. Archive a Folder.

## Release condition

The search option remains unavailable to end users until all contract, provider, browser, privacy, accessibility, and regression checks pass.
