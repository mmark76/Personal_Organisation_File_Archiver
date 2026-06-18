# Everything Integration Scaffold

This folder prepares the repository for a future, optional integration with **Everything by voidtools** without changing or activating any existing application code.

## Current status

- No existing file is modified by this scaffold.
- No Everything binary is bundled here.
- No current build, test, UI, or runtime path references this folder.
- The existing application remains unchanged until a later, explicitly approved integration step.

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

## Design principle

Everything is treated as an external search engine. Organize Your PC owns the user experience, workflow, validation, presentation, and archive actions. The Everything integration owns only local filename and folder lookup through a controlled localhost bridge.

## Planned runtime flow

```text
Organize Your PC UI
        |
        v
Local Search Client
        |
        v
Everything Companion API on 127.0.0.1
        |
        +--> Everything SDK adapter
        |
        +--> es.exe fallback adapter
        |
        v
Everything running locally on Windows
```

## Non-goals

- Replacing the current application.
- Copying the Everything desktop interface.
- Sending local file paths to a remote server.
- Providing arbitrary filesystem access through the companion API.
- Bundling Everything binaries before licensing and packaging requirements are completed.
