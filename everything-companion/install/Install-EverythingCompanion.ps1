$ErrorActionPreference = 'Stop'

$taskName = 'Organize Your PC - Everything Companion'
$installDirectory = Join-Path $env:LOCALAPPDATA 'Programs\Organize Your PC\Everything Companion'
$sourceDirectory = Split-Path -Parent $PSScriptRoot
$sourceExecutable = Join-Path $sourceDirectory 'EverythingCompanion.exe'
$installedExecutable = Join-Path $installDirectory 'EverythingCompanion.exe'

if (-not (Test-Path $sourceExecutable)) {
    throw "EverythingCompanion.exe was not found next to the install folder. Extract the complete release ZIP before installing."
}

New-Item -ItemType Directory -Path $installDirectory -Force | Out-Null

Get-Process -Name 'EverythingCompanion' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Get-ChildItem -Path $sourceDirectory -File | Where-Object {
    $_.Name -notin @('Install-EverythingCompanion.cmd', 'Uninstall-EverythingCompanion.cmd')
} | Copy-Item -Destination $installDirectory -Force

$action = New-ScheduledTaskAction -Execute $installedExecutable -WorkingDirectory $installDirectory
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit ([TimeSpan]::Zero) `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -StartWhenAvailable
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited

Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description 'Starts the local Everything companion for Organize Your PC when this user signs in.' `
    -Force | Out-Null

Start-ScheduledTask -TaskName $taskName
Start-Sleep -Seconds 2

try {
    $response = Invoke-RestMethod -Uri 'http://127.0.0.1:51337/api/health' -TimeoutSec 5
    Write-Host "Everything Companion installed and running: $($response.status)"
}
catch {
    Write-Warning 'Installation completed, but the local health check did not respond yet. Ensure Everything is installed and running, then use Check Again in Organize Your PC.'
}

Write-Host 'The companion will now start automatically in the background whenever this Windows user signs in.'
