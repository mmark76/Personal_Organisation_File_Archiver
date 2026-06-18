# Everything Integration Activation Checklist

This checklist is for a later phase. Completing this scaffold does not activate the feature.

## Before changing existing files

- [ ] Confirm the final search-screen UX.
- [ ] Confirm whether the initial release uses only user-installed Everything.
- [ ] Confirm whether SDK, CLI fallback, or both are supported.
- [ ] Confirm the exact attribution wording.
- [ ] Confirm packaging and third-party licensing requirements.
- [ ] Resolve all high-severity companion audit findings.
- [ ] Define supported Everything and Windows versions.

## Companion readiness

- [ ] Fix end-of-stream handling for `es.exe` output.
- [ ] Add hard timeouts and cancellation cleanup.
- [ ] Check CLI exit code and standard error.
- [ ] Prevent orphaned processes.
- [ ] Serialize or isolate SDK operations safely.
- [ ] Apply filtering without losing valid results because of provider-side limits.
- [ ] Verify real Everything runtime readiness.
- [ ] Add backend unit and integration tests.

## Future minimal connection points

The following existing areas will eventually require small reviewed edits:

- application navigation or main-choice markup;
- application initialization that currently hides the search UI;
- existing search client wiring;
- component styling or a dedicated new stylesheet reference;
- CI configuration to run new companion tests;
- package documentation and third-party notices.

No such edit is made by this scaffold.

## UI acceptance

- [ ] Dedicated screen, not modal.
- [ ] Existing header and footer remain.
- [ ] Back to main choices works and restores focus.
- [ ] Black-and-gold application identity is preserved.
- [ ] Attribution is visible but not dominant.
- [ ] Loading, empty, unavailable, cancelled, timeout, and error states are covered.
- [ ] Results are keyboard accessible.
- [ ] Full paths are hidden by default.
- [ ] Archive actions require explicit confirmation.

## Security acceptance

- [ ] Loopback-only binding.
- [ ] Exact origin allowlist.
- [ ] Origin-bound expiring session token.
- [ ] Rate limiting.
- [ ] Query and limit validation.
- [ ] Safe provider loading paths.
- [ ] No shell execution.
- [ ] No remote path transmission.
- [ ] No persistent search history by default.

## Packaging acceptance

- [ ] State whether Everything must be installed separately.
- [ ] Include attribution in the UI and documentation.
- [ ] If any Everything binary or substantial component is distributed, include the required copyright notice and complete applicable license text in the delivered package.
- [ ] Keep third-party notices in the installed directory and release archive.
- [ ] Record bundled component versions and integrity hashes.

## Release gate

The feature may be made visible only after functionality, security, privacy, licensing, and regression tests all pass without affecting the four existing application areas.
