# Verification Report

## Scope

Everything Companion public release correction.

## Implemented

- The release ZIP adds the official `Everything64.dll` SDK runtime and official licence text.
- The SDK backend reports availability only when the Everything database is running and reachable through IPC.
- The installer launcher performs a separate connection verification and exits with failure when the Companion cannot connect to Everything.
- Pull requests build and validate the same release package without publishing it.

## Automated verification

Pending GitHub Actions execution on the correction pull request.

## Publication gate

The public release is corrected only after the pull-request checks pass, the change is merged into `main`, and the release workflow republishes `EverythingCompanion-win-x64.zip`.
