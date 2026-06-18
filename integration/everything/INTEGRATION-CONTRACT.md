# Everything Integration Contract

This document records the **current companion API baseline** and the rules for any future versioned contract. The current application and companion remain unchanged by this scaffold.

## 1. Current health endpoint

`GET /api/health`

Current response shape:

```json
{
  "status": "ok",
  "service": "EverythingCompanion",
  "everythingAvailable": true,
  "backend": "sdk",
  "message": "The companion service is ready on 127.0.0.1."
}
```

Current backend values are implementation names such as:

- `sdk`
- `es.exe`
- `unavailable`

When the request comes from an approved origin, the health response also supplies the short-lived session token through response headers. The token is not returned in the URL or JSON body.

## 2. Current search endpoint

`GET /api/search?q=&type=all|file|folder&limit=`

Current request rules:

- `q` must be non-empty after trimming;
- `q` is limited to 256 characters;
- `type` must be `all`, `file`, or `folder`;
- the default limit is 20;
- the maximum limit is 50;
- the approved session token must be sent in the `X-Everything-Session` request header;
- the request uses the browser or connection cancellation token.

Current response shape follows the existing C# records:

```json
{
  "source": "sdk",
  "query": "invoice",
  "type": 1,
  "limit": 20,
  "count": 1,
  "results": [
    {
      "name": "invoice.pdf",
      "path": "…/Documents/invoice.pdf",
      "kind": 0
    }
  ]
}
```

Current enum values:

- search type: `0 = all`, `1 = file`, `2 = folder`;
- result kind: `0 = file`, `1 = folder`.

The `path` field is a redacted display path unless full-path exposure is explicitly enabled in the companion configuration.

## 3. Current errors

The current endpoints use HTTP status codes and Problem Details responses. Existing browser code and tests must remain compatible with that behaviour until a coordinated, versioned API change is approved.

Typical current failures include:

- invalid request: HTTP 400;
- invalid or expired session: HTTP 401;
- origin not allowed: HTTP 403;
- rate limited: HTTP 429;
- Everything unavailable: HTTP 503.

## 4. Future normalized contract

A future API version may introduce string enum values, stable machine-readable error codes, explicit provider metadata, and opaque result references. That future format must not silently replace the current contract.

It requires, in one reviewed change:

1. a versioned endpoint or explicit contract version;
2. companion implementation changes;
3. browser-client changes;
4. contract tests;
5. migration and compatibility documentation.

## 5. Result handoff rule

The current search response is for display and discovery only. A redacted display path is not sufficient authority to archive or manipulate a local item.

The initial safe workflow is:

1. the user finds the item through search;
2. the user chooses the matching file or folder through the existing browser picker;
3. the existing archive workflow continues after explicit confirmation.

A future direct handoff may use a short-lived opaque result reference resolved locally by the companion. Such a reference must not expose the full path to the browser and must be separately designed, authorized, tested, and reviewed before activation.

## 6. Compatibility rule

The UI must depend only on the documented companion contract and never on Everything SDK structures, CLI output columns, DLL names, or raw provider-specific error text.
