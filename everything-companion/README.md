# Everything Companion Service

This optional Windows-only companion service exposes a small localhost API for the **Search this PC with Everything** screen in Organize Your PC.

## What it does

- binds only to `127.0.0.1`;
- offers `GET /api/health`;
- offers `GET /api/search?q=&type=&limit=&ext=&modified=&size=&location=&match=`;
- validates the search term and every structured filter;
- supports basic filters for result type, file category, modified date, file size, location, name matching, and result count;
- prefers the Everything SDK when it is available;
- falls back to `es.exe` if the SDK cannot be used;
- never exposes file downloads or arbitrary filesystem access;
- never forwards local file paths to a remote server.

## Requirements

- Windows 10 or Windows 11;
- .NET 8 runtime or SDK;
- Voidtools Everything installed or available as a portable companion;
- optionally, `Everything64.dll` or `Everything.dll` for SDK access;
- optionally, `es.exe` for the controlled fallback path.

## Running the service

```powershell
dotnet run --project .\everything-companion\EverythingCompanion.csproj
```

The default port is `51337`. You can override it with:

```powershell
$env:EverythingCompanion__Port = "51337"
```

## Companion files

- `Everything64.dll` or `Everything.dll` - preferred SDK path
- `es.exe` - fallback command-line search path

Place the companion file next to the service executable or in a standard Everything installation folder.

## Search filters

The search endpoint accepts these optional values:

- `type`: `all`, `file`, or `folder`;
- `ext`: one or more semicolon-separated extensions such as `pdf` or `doc;docx`;
- `modified`: `any`, `today`, `thisweek`, `thismonth`, `last7days`, or `last30days`;
- `size`: `any`, `upto100kb`, `100kbto1mb`, `1mbto16mb`, `16mbto128mb`, or `over128mb`;
- `location`: a Windows drive or folder path beginning with a drive letter;
- `match`: `contains`, `exact`, or `startswith`;
- `limit`: from 1 to 50 results.

## API responses

- `GET /api/health` returns a small readiness object.
- `GET /api/search` returns local filename search results only.

## Security notes

- The service listens only on loopback.
- The service accepts only approved browser origins.
- Search input and filters are validated and length-limited.
- The browser sends a short-lived session token in the `X-Everything-Session` header.
- Command execution uses fixed argument lists and does not invoke a shell.
