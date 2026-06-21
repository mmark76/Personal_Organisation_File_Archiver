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
- Voidtools Everything installed and running;
- optionally, `Everything64.dll` or `Everything.dll` for SDK access;
- optionally, `es.exe` for the controlled fallback path.

The published Windows package is self-contained, so the final user does not need to install .NET.

## Normal user installation

1. Download and extract the complete `EverythingCompanion-win-x64` package produced by the GitHub Actions release workflow.
2. Double-click `Install-EverythingCompanion.cmd` once.
3. Close the installer window after it reports completion.

The installer:

- copies the companion to `%LOCALAPPDATA%\Programs\Organize Your PC\Everything Companion`;
- registers a per-user Windows scheduled task named `Organize Your PC - Everything Companion`;
- starts the companion immediately;
- starts it automatically in the background whenever that Windows user signs in;
- requires no permanently open PowerShell or console window;
- requires no administrator rights.

To remove it, double-click `Uninstall-EverythingCompanion.cmd` from the extracted package.

A per-user logon task is used instead of a machine service because Everything normally runs inside the signed-in user's Windows session.

## Development

Run the companion from the repository root with:

```powershell
dotnet run --project .\everything-companion\EverythingCompanion.csproj
```

The default port is `51337`. You can override it with:

```powershell
$env:EverythingCompanion__Port = "51337"
```

## Building the installable package

Run the GitHub Actions workflow **Build Everything Companion release**, or publish locally:

```powershell
dotnet publish .\everything-companion\EverythingCompanion.csproj `
  --configuration Release `
  --runtime win-x64 `
  --self-contained true `
  --output .\companion-package

Copy-Item .\everything-companion\install\* .\companion-package\ -Force
```

Distribute the complete `companion-package` folder as a ZIP. The user installs it through `Install-EverythingCompanion.cmd`.

## Companion files

- `Everything64.dll` or `Everything.dll` - preferred SDK path;
- `es.exe` - fallback command-line search path.

Place an optional companion file next to the installed service executable or in a standard Everything installation folder.

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
