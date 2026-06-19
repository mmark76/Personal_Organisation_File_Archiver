# Everything Integration Architecture

## 1. Objective

Provide fast local filename and folder search inside Organize Your PC while keeping the existing application independent from Everything-specific implementation details.

## 2. Architectural boundaries

### A. Application UI

Responsibilities:

- render the compact Search this PC entry point and dedicated search screen;
- display Everything branding and the permanent Install Everything action;
- collect query, result type, filters, location, and result-limit choices;
- show connection, loading, empty, success, cancelled, unavailable, and error states;
- present safe result metadata;
- keep search results separate from archive authority.

The UI does not call Everything DLL functions or execute `es.exe` directly.

### B. Browser search client

Responsibilities:

- communicate only with the local companion API;
- perform health and session negotiation;
- validate query and filter input;
- send the temporary session token only in the approved header;
- apply request cancellation;
- normalize API errors for presentation.

Browser modules:

- `assets/js/everything-search-api.js` — API, session, and validation;
- `assets/js/everything-search-ui.js` — states and safe result rendering;
- `assets/js/everything-install-guide.js` — install link, guidance, and branding stylesheet loading;
- `assets/js/everything-search.js` — coordination.

### C. Local companion API

Responsibilities:

- bind only to loopback;
- validate origin and session token;
- validate query, type, extension, modified date, size, location, match mode, and limit;
- apply rate limits and cancellation;
- choose one search backend;
- normalize backend output into a stable response contract;
- redact full paths unless explicitly enabled by approved configuration.

### D. Search backend abstraction

Implemented backend roles:

- `EverythingSdkBackend` — preferred native SDK route;
- `EverythingEsExeBackend` — controlled `es.exe` fallback;
- unavailable state — explicit diagnostic state when neither backend is usable.

Both backends receive the same validated provider query constructed by the companion.

### E. Everything runtime

Everything remains external third-party software running locally on Windows. Its indexing and search engine are not reimplemented or distributed by Organize Your PC.

## 3. Runtime sequence

1. User opens the dedicated search screen.
2. Browser client calls the local health endpoint.
3. Companion verifies readiness and returns active backend information.
4. Browser client obtains or refreshes an origin-bound session token.
5. User submits a validated query and optional filters.
6. Companion validates structured values and builds the local Everything provider query.
7. Companion sends the query to the SDK backend or controlled `es.exe` fallback.
8. Everything searches its local index.
9. Companion returns normalized results with redacted display paths by default.
10. UI displays results.
11. The user must still use the existing browser picker and confirmation flow before an archive action.

## 4. Search and archive boundary

A search result is not authority to manipulate a filesystem item. The current integration is discovery-only.

The existing browser picker remains responsible for the actual user-authorized file or folder selection. A future opaque-reference mechanism would require a separate contract, security review, and explicit approval.

## 5. Deployment model

### Current user-managed model

The user installs and runs Everything separately. Organize Your PC distributes only its own UI and companion integration code. The permanent Install Everything action opens the official voidtools download page.

### Future bundled dependencies

Any future installer may include approved Everything SDK or CLI files only after licensing, notices, version pinning, integrity verification, update responsibility, and packaging requirements are separately reviewed.

## 6. Branding boundary

Everything branding is used only to identify the optional integration. It is not presented as Organize Your PC branding and does not imply affiliation or endorsement.

## 7. Failure isolation

Failure of Everything, its SDK, `es.exe`, or the companion service disables only the optional search feature. Folder-tree building, existing-tree viewing, file archiving, and folder archiving remain available.
