# Testing

After every code change, modification, or repository update, all necessary checks must be completed before considering the change finished.

## Automated Browser Tests

Open `tests/archive-core-tests.html` in a modern browser. The current suite contains 25 focused in-memory tests covering the core archive behavior, including:

- duplicate-safe file and folder naming;
- existing-tree destination paths relative to the selected root;
- explicit read/write permission handling and denial messages;
- stale asynchronous folder-tree load protection;
- oversized-folder safeguards;
- rejection of direct and retained-root destinations inside the source folder;
- rollback of incomplete file and folder archives after a copy failure;
- safe refusal when rollback support is unavailable;
- prevention of simultaneous archive operations;
- rejection of analytics before consent and filtering of analytics events after consent; and
- preservation of the normal new-folder-structure workflow.

All tests must pass before a related change is considered complete.

## Static Checks

Run the applicable JavaScript syntax checks and `git diff --check`. Review the complete diff and confirm that no unrelated files were changed.

## Manual Browser Checks

These checks include, as applicable:

- Opening the app in Chrome or Edge through a local or deployed web origin when the File System Access API is involved.
- Verifying the affected screen or workflow.
- Checking that the existing main workflows still behave correctly.
- Confirming that no unintended upload, deletion, automatic move, or file modification behavior has been introduced.
- Confirming that permission denial creates no archive output.
- Confirming that an existing selected folder remains the actual archive root and is not duplicated in generated paths.
- Confirming that oversized folders are stopped before destination creation and that the user receives clear manual copy guidance.
- Confirming that a failed folder copy either rolls back completely or clearly reports any output that could not be removed.
- Confirming that a failed file write is aborted and its incomplete output is removed or clearly reported.
- Confirming that a second archive action cannot run while another archive operation is active.
- Confirming that temporarily hidden or disabled interface elements remain hidden or disabled when required.
- Confirming that rejecting analytics sends no GA4 request and that allowing analytics sends only approved non-sensitive events on the deployed production origin.
- Checking the browser console for unhandled errors.
- Reviewing the result manually before treating the change as complete.

Manual testing is part of the normal development process for this project.
