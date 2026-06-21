# Verification Report

## Scope

Verification of the correction to the published Windows Everything Companion package.

## Baseline

- Repository: `mmark76/Personal_Organisation_File_Archiver`
- Branch: `main`
- Initial audited commit: `97ef13fac90b31d01ef9e1b2a0867bdcc03d2b06`
- Audit date: 2026-06-21 (Asia/Nicosia)

## Implemented corrections

- The release workflow now downloads and bundles the official x64 Everything SDK runtime, `Everything64.dll`.
- The official Everything licence text is included as `THIRD-PARTY-LICENSE-EVERYTHING.txt`.
- The SDK backend reports availability only when the Everything database is running and reachable through IPC.
- Installation now performs a separate post-install connection verification.
- Installation verification fails unless the local health response reports `everythingAvailable: true`.
- Pull requests build and validate the same Windows release package without publishing it.

## Pull request

- Pull request: `#4` — Fix Everything Companion release package
- Head commit: `9dae84ca2fa7c6a554358ca614e89646d092bb5e`
- Result: squash-merged into `main`
- Final merge commit: `bdebe1c0c66c893726b0c8bb77680b634f132a15`

## Automated verification

The following GitHub Actions checks completed successfully:

- Browser test suite
- .NET restore and Release build of Everything Companion
- Self-contained Windows x64 publish
- Download and extraction of the official Everything SDK
- Presence and non-empty-file validation of all required package files
- Creation of `EverythingCompanion-win-x64.zip`
- Upload of the release-package workflow artifact

## Verified artifact

- Artifact ID: `7774322491`
- Artifact name: `EverythingCompanion-win-x64`
- Artifact size: `42,028,341` bytes
- Artifact digest: `sha256:65c7de5dafc760830f8273746ce09e2d46ec91aec32944e9b4bc76479b1cce86`

The generated ZIP was inspected and confirmed to contain:

- `EverythingCompanion.exe`
- `Everything64.dll`
- `THIRD-PARTY-LICENSE-EVERYTHING.txt`
- `Install-EverythingCompanion.cmd`
- `Install-EverythingCompanion.ps1`
- `Verify-EverythingConnection.ps1`
- the uninstall scripts

## Publication status

The correction is merged into `main`. The release workflow is configured to replace the public `EverythingCompanion-win-x64.zip` asset after a successful push to `main`.

The available GitHub connector exposes pull-request workflow runs but does not expose the post-merge public release asset metadata. Therefore, the corrected build and release package are verified, while direct independent confirmation of the replaced public asset remains an external publication check.

## Remaining risk

A final clean-PC installation test remains necessary to validate the complete user journey from the public download link through installation, Everything IPC connection, restart persistence, and uninstall.
