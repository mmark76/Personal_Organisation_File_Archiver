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
2. Browser client calls local health endpoint.
3. Companion verifies readiness and returns active provider information.
4. Browser client obtains or refreshes an origin-bound session token.
5. User submits a validated query.
6. Companion enforces limits and sends the request to one provider.
7. Provider queries Everything locally.
8. Companion normalizes and redacts results.
9. UI displays results.
10. A selected result may be passed to an existing archive workflow through a later approved adapter.

## 4. Deployment modes

### User-managed Everything

The user installs and runs Everything separately. Organize Your PC distributes only its own integration code. This is the preferred initial deployment model.

### Bundled companion dependencies

A future installer may include approved Everything SDK or CLI files only after licensing, notices, version pinning, integrity verification, and update responsibilities are defined.

## 5. Failure isolation

Failure of Everything, its SDK, `es.exe`, or the companion service must never prevent the four existing application areas from operating. Search remains optional and independently degradable.

## 6. Activation rule

Nothing in this scaffold becomes active until existing application files are deliberately connected in a separate reviewed change.
