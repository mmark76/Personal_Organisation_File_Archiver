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
- safe display location;
- optional action to continue into an approved archive workflow.

Full local paths remain hidden by default. No result action should move, copy, delete, or archive anything without a separate explicit user confirmation.

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
