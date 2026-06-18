# Everything Search UI/UX Specification

## Placement

The search experience should open as a dedicated screen inside the existing application, not as a modal popup and not as a separate external window.

The existing header, footer, visual identity, and navigation conventions remain in place. The main-choice area is temporarily replaced by the search screen and restored through a clear **Back to main choices** action.

## Visual identity

The interface belongs to Organize Your PC and should follow its established black-and-gold design language. It does not need to resemble the Everything desktop application.

A discreet attribution should be visible:

> Search powered by Everything by voidtools

## Screen structure

1. Screen title and short local-search explanation.
2. Companion connection status.
3. Search input.
4. Type filter: all, files, or folders.
5. Result-limit selector.
6. Search and cancel actions.
7. Results summary.
8. Scrollable results area.
9. Empty, unavailable, timeout, and error states.
10. Back to main choices action.

## Result presentation

Each result should present:

- file or folder icon;
- name;
- kind;
- safe redacted display location;
- an optional action to continue toward an approved archive workflow.

Full local paths remain hidden by default. No result action should move, copy, delete, or archive anything without a separate explicit user confirmation.

## Safe archive handoff

The current search response is a discovery aid and does not provide sufficient authority to archive an item automatically.

### Initial implementation

The safe initial flow is:

1. the user selects a search result;
2. the app shows the selected name and redacted location;
3. the app opens the existing file or folder selection workflow;
4. the user selects the matching local item through the browser picker;
5. archiving continues only after the existing confirmation steps.

This preserves the current browser security model and does not require exposing a full local path.

### Possible future direct handoff

A later version may allow the companion to issue a short-lived opaque result reference. The browser would receive the reference rather than the full path, and the companion would resolve it locally only after an explicit user action.

That design is not part of the current implementation. It requires a separate API contract, expiry rules, authorization checks, replay protection, tests, and security review before use.

## Interaction states

### Initial

Explain that search is local and requires Everything plus the companion service.

### Connecting

Show a non-blocking readiness check.

### Ready

Enable the form and place focus in the search field.

### Searching

Keep the screen usable, disable duplicate submission, and expose a cancel action.

### Empty

State clearly that no matching files or folders were found.

### Companion unavailable

Explain that the rest of Organize Your PC still works and provide local setup guidance without blocking navigation.

### Results

Show count, active filter, truncation notice when applicable, and keyboard-accessible rows.

## Accessibility

- full keyboard operation;
- visible focus indicators;
- semantic form labels;
- status announcements through an ARIA live region;
- no meaning communicated by colour alone;
- sufficient contrast within the existing theme;
- predictable focus restoration when returning to main choices.

## Privacy message

The screen should state that searches run locally and that Organize Your PC does not upload search queries or file paths to a remote server.
