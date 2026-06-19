# Everything Integration Security and Privacy

## Security boundary

The companion service is a local search bridge, not a general filesystem API. It exposes only narrowly defined health and search operations.

## Implemented controls

- Binds only to `127.0.0.1`.
- Rejects non-approved browser origins.
- Requires a short-lived, origin-bound search session.
- Sends session information through a request header and never through the URL.
- Validates and length-limits every query.
- Validates filters for result type, extension, modified date, size, location, match mode, and result count.
- Restricts results to a maximum of 50 per request.
- Applies request rate limiting and cancellation.
- Executes `es.exe` without a command shell.
- Returns safe error responses rather than raw backend output.
- Keeps search failure isolated from the four original application workflows.

## Path handling

Full local paths are private data.

Default behaviour:

- return the final name and a redacted display location;
- do not expose arbitrary file-access endpoints;
- do not write search results or full paths to browser storage;
- do not send paths to analytics, crash reporting, or remote services.

Any future full-path or direct-result handoff mode requires explicit configuration, clear UI disclosure, a separate contract, and a new security review.

## Query handling

The browser sends structured filter values rather than raw Everything command syntax. The companion validates those values and constructs the provider query locally.

The current integration does not persist search history. Query and result data remain only as long as needed for the active screen and browser session.

## Provider trust

Everything remains user-installed third-party software. The companion uses approved SDK or CLI locations and does not search arbitrary writable directories for executables or DLLs.

No Everything executable, installer, SDK DLL, or CLI binary is bundled in this repository.

## Install and branding links

The Install Everything action opens the official voidtools download page in a new browser tab. It does not proxy, mirror, or automatically download an installer.

Everything branding is used only to identify the optional integration. It is not included in analytics events and does not alter the local-only search boundary.

## Data retention

- No persistent search history.
- No query or result storage in local browser storage.
- No remote transmission of queries or local paths.
- Temporary session data is kept only in memory and expires automatically.

## Failure isolation

A companion or backend failure disables only Search this PC. It does not affect folder-tree building, existing-tree viewing, file archiving, or folder archiving.
