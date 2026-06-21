# Full Audit Report

## Scope

Published Windows Everything Companion installation and release package.

## Baseline

- Repository: `mmark76/Personal_Organisation_File_Archiver`
- Branch: `main`
- Initial commit: `97ef13fac90b31d01ef9e1b2a0867bdcc03d2b06`
- Recorded: 2026-06-21 13:00 Asia/Nicosia
- Repository state: public repository; no matching open pull request for the Companion release fix.

## Confirmed defect

The published `EverythingCompanion-win-x64.zip` contains the Companion executable and installer scripts but does not contain an Everything search backend. The Companion can therefore install and start successfully while reporting that Everything is unavailable on another Windows computer.

The existing installer verifies only that the local health endpoint responds. It does not require `everythingAvailable` to be true, so an incomplete installation can be reported as successful.

The SDK backend also treats a successfully loaded SDK DLL as availability without verifying that the Everything database is running and reachable through IPC.

## Required correction

1. Bundle the official x64 Everything SDK DLL in the published Companion ZIP.
2. Include the applicable Everything licence notice in the package and repository notices.
3. Make SDK readiness depend on the Everything database being loaded through IPC.
4. Make installation verification fail unless the Companion is connected to Everything.
5. Add a Windows release smoke test before public release publication.

## Audit constraint

No production code was modified during the baseline audit. Corrections are implemented afterwards on a separate branch and reviewed through a pull request.
