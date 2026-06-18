# Everything Integration Architecture

## 1. Objective

Provide fast local filename and folder search inside Organize Your PC while keeping the existing application independent from Everything-specific implementation details.

## 2. Architectural boundaries

### A. Application UI

Responsibilities:

- render the dedicated search screen inside the existing application shell;
- collect query, result type, and result-limit choices;
- show connection, loading, empty, success, and error states;
- present safe result metadata;
- hand selected results to existing archive workflows only after explicit user action.

The UI must not call Everything DLL functions or execute `es.exe` directly.

### B. Browser search client

Responsibilities:

- communicate only with the local companion API;
- perform health and session negotiation;
- validate client-side input;
- apply request cancellation and UI timeouts;
- normalize API errors for presentation.

### C. Local companion API

Responsibilities:

- bind only to loopback;
- validate origin, session token, query, type, and limit;
- apply rate limits, execution timeouts, and cancellation;
- choose one search provider;
- normalize provider output into a stable response contract;
- redact full paths unless explicitly enabled by approved configuration.

### D. Search-provider abstraction

The companion should eventually depend on one stable provider contract rather than on concrete Everything implementations.

Planned provider roles:

- `EverythingSdkProvider`: preferred native SDK route;
- `EverythingCliProvider`: controlled `es.exe` fallback;
- `UnavailableProvider`: explicit diagnostic state when neither provider is usable.

Provider selection must be deterministic and reported by the health endpoint.

### E. Everything runtime

Everything remains external third-party software running locally on Windows. Its indexing and search engine are not reimplemented by Organize Your PC.

## 3. Runtime sequence

1. User opens the dedicated search screen.
2. Browser client calls the local health endpoint.
3. Companion verifies readiness and returns active backend information.
4. Browser client obtains or refreshes an origin-bound session token.
5. User submits a validated query.
6. Companion enforces limits and sends the request to one provider.
7. Provider queries Everything locally.
8. Companion returns normalized results with redacted display paths by default.
9. UI displays results.
10. For the initial release, the user reselects the matching file or folder through the existing browser picker before archiving.
11. A future direct handoff may use a short-lived opaque result reference, but only after a separate contract and security review.

## 4. Result handoff boundary

A redacted search result is not authority to manipulate a filesystem item.

The initial integration must use the existing browser picker and confirmation flow. The search result helps the user identify the item, but the browser picker supplies the actual user-authorized file or folder selection.

A future opaque-reference mechanism must:

- avoid exposing the full path to the browser;
- expire quickly;
- be bound to the active session and origin;
- prevent replay;
- resolve only through a narrowly scoped local endpoint;
- require explicit user confirmation;
- receive separate tests and security review.

## 5. Deployment modes

### User-managed Everything

The user installs and runs Everything separately. Organize Your PC distributes only its own integration code. This is the preferred initial deployment model.

### Bundled companion dependencies

A future installer may include approved Everything SDK or CLI files only after licensing, notices, version pinning, integrity verification, and update responsibilities are defined.

## 6. Failure isolation

Failure of Everything, its SDK, `es.exe`, or the companion service must never prevent the four existing application areas from operating. Search remains optional and independently degradable.

## 7. Activation rule

Nothing in this scaffold becomes active until existing application files are deliberately connected in a separate reviewed change.
