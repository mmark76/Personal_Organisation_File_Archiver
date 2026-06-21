#ifndef SourceDir
  #error SourceDir must be supplied by the build workflow.
#endif

#ifndef OutputDir
  #define OutputDir "."
#endif

#define AppName "Everything Companion for Organize Your PC"
#define AppVersion "1.0.0"
#define AppPublisher "Markellos Markides"
#define AppUrl "https://organizeyourpc.com/"
#define AppExeName "EverythingCompanion.exe"

[Setup]
AppId={{D398168E-5746-4977-BB61-68718B7D9760}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#AppPublisher}
AppPublisherURL={#AppUrl}
AppSupportURL={#AppUrl}
AppUpdatesURL={#AppUrl}
DefaultDirName={localappdata}\Programs\Organize Your PC\Everything Companion
DisableDirPage=yes
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
OutputDir={#OutputDir}
OutputBaseFilename=EverythingCompanion-Setup-win-x64
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
CloseApplications=yes
RestartApplications=no
SetupLogging=yes
UninstallDisplayName={#AppName}
UninstallDisplayIcon={app}\{#AppExeName}
VersionInfoCompany={#AppPublisher}
VersionInfoDescription={#AppName} installer
VersionInfoProductName={#AppName}
VersionInfoProductVersion={#AppVersion}
VersionInfoVersion=1.0.0.0

[Files]
Source: "{#SourceDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[UninstallRun]
Filename: "{sys}\WindowsPowerShell\v1.0\powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy Bypass -File ""{app}\Uninstall-EverythingCompanion.ps1"" -KeepInstallDirectory"; Flags: runhidden waituntilterminated; RunOnceId: "EverythingCompanionCleanup"

[Code]
function RunPowerShellScript(const ScriptName, Arguments, FailureMessage: String): Boolean;
var
  ResultCode: Integer;
  PowerShellPath: String;
  Parameters: String;
begin
  PowerShellPath := ExpandConstant('{sys}\WindowsPowerShell\v1.0\powershell.exe');
  Parameters := '-NoProfile -ExecutionPolicy Bypass -File "' +
    ExpandConstant('{app}\') + ScriptName + '" ' + Arguments;

  Result := Exec(
    PowerShellPath,
    Parameters,
    '',
    SW_HIDE,
    ewWaitUntilTerminated,
    ResultCode
  ) and (ResultCode = 0);

  if not Result then
    MsgBox(FailureMessage + #13#10 + 'Exit code: ' + IntToStr(ResultCode), mbError, MB_OK);
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    if not RunPowerShellScript(
      'Install-EverythingCompanion.ps1',
      '-SkipCopy',
      'The Companion files were installed, but Windows configuration failed.'
    ) then
      RaiseException('Everything Companion configuration failed.');

    if not RunPowerShellScript(
      'Verify-EverythingConnection.ps1',
      '',
      'The Companion was installed, but it could not connect to Everything.'
    ) then
      RaiseException('Everything Companion verification failed.');
  end;
end;
