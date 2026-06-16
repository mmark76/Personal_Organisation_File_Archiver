# Everything Companion Service

This optional Windows-only companion service exposes a small localhost API for the **Search this PC with Everything** panel in Organize Your PC.

## What it does

- binds only to `127.0.0.1`;
- offers `GET /api/health`;
- offers `GET /api/search?q=&type=all|file|folder&limit=`;
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

## API responses

- `GET /api/health` returns a small readiness object.
- `GET /api/search` returns local filename search results only.

## Security notes

- The service listens only on loopback.
- The service accepts only local browser origins.
- Search input is validated and length-limited.
- Command execution uses fixed argument lists and does not invoke a shell.
