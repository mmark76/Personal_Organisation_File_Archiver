# Everything Integration Activation Checklist

## Implementation

- [x] Dedicated Search this PC screen.
- [x] Existing header, footer, and four original workflows remain available.
- [x] Compact main-choice layout.
- [x] Everything branding at the entry point and search screen.
- [x] Permanent Install Everything action with short guidance.
- [x] Official voidtools download link.
- [x] Basic filters for type, category, modified date, size, matching, location, and result count.
- [x] Clear filters and Cancel actions.

## Companion readiness

- [x] Loopback-only binding.
- [x] Exact allowed-origin handling.
- [x] Origin-bound expiring session token.
- [x] Session token sent through a header, never a URL.
- [x] Rate limiting.
- [x] Query and structured-filter validation.
- [x] SDK-first backend with `es.exe` fallback.
- [x] Shell-free CLI execution.
- [x] Redacted display paths by default.
- [x] Search failure isolated from the four original workflows.

## Documentation and attribution

- [x] Root README describes the fifth workflow and companion requirements.
- [x] Companion README describes endpoints and filters.
- [x] Integration architecture and contract are current.
- [x] UI/UX specification reflects branding, compact choices, filters, and install guidance.
- [x] Test plan reflects automated and manual checks.
- [x] Changelog records the integration.
- [x] Third-party notice identifies Everything by voidtools and states that no Everything binaries are bundled.

## Automated validation

- [x] Latest JavaScript syntax checks succeed.
- [x] Existing browser regression suite succeeds.
- [x] Dedicated Everything screen and filter tests succeed.
- [x] Windows CI builds the .NET companion.

## Manual Windows validation

- [x] Search screen opens.
- [x] Companion reports the SDK backend ready.
- [x] Real filename searches return local results.
- [x] File-only and PDF filters return expected results.
- [x] Permanent Install Everything button is visible.
- [x] Everything branding is visible.
- [x] Compact main-choice layout is visible.
- [ ] Test every remaining basic filter individually.
- [ ] Test two or more filters together.
- [ ] Confirm Clear filters restores defaults.
- [ ] Confirm the four original workflows still open normally.
- [ ] Stop the companion and confirm the unavailable setup state.

## Release gate

- [x] Latest CI run is green.
- [ ] Remaining manual Windows checks are accepted.
- [ ] Final Pull Request diff is reviewed.
- [ ] Pull Request is merged only after explicit approval.
- [ ] Production publication occurs only after the merged version is verified.
