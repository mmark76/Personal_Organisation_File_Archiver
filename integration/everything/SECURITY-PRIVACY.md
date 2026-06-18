# Everything Integration Security and Privacy

## Security boundary

The companion service is a local bridge, not a general filesystem API. It must expose only narrowly defined health and search operations.

## Required controls

- Bind only to `127.0.0.1`.
- Reject non-approved browser origins.
- Require a short-lived, origin-bound session token.
- Never place the session token in a URL.
- Validate and length-limit every query.
- Restrict result type to `all`, `file`, or `folder`.
- Restrict result count to a configured maximum.
- Apply request rate limiting.
- Apply a hard execution timeout.
- Support cancellation.
- Serialize or otherwise isolate native SDK calls when required by provider state.
- Execute `es.exe` without a shell and only through fixed argument construction.
- Capture and evaluate CLI exit code and standard error.
- Terminate the CLI process on timeout or cancellation.
- Return safe normalized errors rather than raw provider output.

## Path handling

Full local paths are private data.

Default behaviour:

- return only the final name and a safe display location;
- keep `fullPath` absent or `null`;
- never log full paths in normal operation;
- never send paths to remote analytics, crash reporting, or network services.

Any future full-path mode requires explicit configuration, clear UI disclosure, and a separate security review.

## Provider trust

If native DLL or CLI files are supported, the companion must:

- load only from approved directories;
- use pinned supported versions where practical;
- document expected filenames and architecture;
- verify integrity before any bundled distribution;
- never search arbitrary writable directories for executables or DLLs.

## Readiness

Health must verify real provider readiness, not only the presence of a DLL or executable. A provider is ready only when it can communicate successfully with the local Everything runtime.

## Data retention

Search queries and results should remain in memory only for the duration needed to render the current screen. Persistent search history must not be introduced without explicit user choice and a separate privacy design.

## Failure isolation

A companion or provider failure must disable only the optional search feature. It must not affect folder-tree building, viewing, file archiving, or folder archiving.
