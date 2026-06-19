# Everything Integration

This folder documents the active, optional integration with **Everything by voidtools** used by the **Search this PC** screen in Organize Your PC.

## Current status

- The integration is implemented in the feature branch and Pull Request.
- The browser application includes a dedicated search screen and compact main-screen entry point.
- The browser communicates only with the local companion service on `127.0.0.1:51337`.
- The companion prefers the Everything SDK and falls back to `es.exe` when needed.
- No Everything installer, executable, SDK DLL, or CLI binary is bundled in this repository.
- Users install and run Everything separately from the official voidtools website.

## Current structure

```text
integration/everything/
├── README.md
├── ARCHITECTURE.md
├── INTEGRATION-CONTRACT.md
├── UI-UX-SPEC.md
├── SECURITY-PRIVACY.md
├── TEST-PLAN.md
├── ACTIVATION-CHECKLIST.md
└── config/
    └── everything.integration.example.json
```

## Runtime flow

```text
Organize Your PC UI
        |
        v
Everything browser client
        |
        v
Everything Companion API on 127.0.0.1
        |
        +--> Everything SDK backend
        |
        +--> es.exe fallback backend
        |
        v
Everything running locally on Windows
```

## User-visible capabilities

The search screen supports:

- all results, files only, or folders only;
- common file-category filters;
- modified-date ranges;
- file-size ranges;
- contains, exact-name, or starts-with matching;
- optional Windows drive or folder location;
- 20 or 50 results;
- cancellation and Clear filters;
- readiness, unavailable, empty, success, and error states.

The screen also includes a permanent **Install Everything** button that opens the official voidtools download page and shows the short sequence: **Download · Install · Start**.

## Design principle

Everything remains an external local search engine. Organize Your PC owns the interface, validation, privacy boundary, and archive workflows. Search results are discovery-only and do not grant permission to manipulate local files.

## Branding and attribution

The interface includes Everything branding solely to identify the optional integration. Everything and its associated branding belong to their respective owner(s). The project is not affiliated with or endorsed by voidtools.

See the root `THIRD_PARTY_NOTICES.md` for attribution and official source links.

## Non-goals

- Replacing the Everything desktop application.
- Recreating the Everything desktop interface.
- Sending local file paths or search queries to a remote server.
- Providing arbitrary filesystem access through the companion API.
- Bundling Everything binaries without a separate licensing and packaging review.
