# Everything Integration Contract

This document defines the stable boundary that the future UI and the local companion should share. It is intentionally implementation-neutral.

## Health endpoint

`GET /api/health`

Expected response shape:

```json
{
  "status": "ready",
  "provider": "sdk",
  "providerVersion": "unknown",
  "pathsRedacted": true,
  "sessionRequired": true
}
```

Allowed status values:

- `ready`
- `degraded`
- `unavailable`

Allowed provider values:

- `sdk`
- `cli`
- `none`

## Search endpoint

`GET /api/search?q=&type=all|file|folder&limit=`

Required request rules:

- `q` must be non-empty after trimming;
- `type` must be `all`, `file`, or `folder`;
- `limit` must remain within the configured safe range;
- an origin-bound session token must be sent through the approved request header;
- the request must be cancellable.

Expected response shape:

```json
{
  "query": "invoice",
  "type": "file",
  "provider": "sdk",
  "count": 2,
  "truncated": false,
  "results": [
    {
      "name": "invoice.pdf",
      "kind": "file",
      "displayLocation": "Documents",
      "fullPath": null
    }
  ]
}
```

## Result rules

Each result should contain only normalized values:

- `name`: final file or folder name;
- `kind`: `file` or `folder`;
- `displayLocation`: safe, user-facing location text;
- `fullPath`: omitted or `null` by default;
- optional future metadata must not expose file contents.

## Error contract

Errors should use a stable machine-readable code and a safe message:

```json
{
  "error": {
    "code": "SEARCH_TIMEOUT",
    "message": "The local search did not finish in time."
  }
}
```

Planned codes:

- `COMPANION_UNAVAILABLE`
- `EVERYTHING_UNAVAILABLE`
- `INVALID_QUERY`
- `INVALID_TYPE`
- `INVALID_LIMIT`
- `SESSION_REQUIRED`
- `ORIGIN_NOT_ALLOWED`
- `RATE_LIMITED`
- `SEARCH_TIMEOUT`
- `SEARCH_CANCELLED`
- `PROVIDER_FAILURE`

## Compatibility rule

The UI must depend on this normalized contract and not on Everything SDK structures, CLI output columns, DLL names, or provider-specific error text.
