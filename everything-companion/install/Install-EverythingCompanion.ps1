param(
    [switch]$SkipCopy
)

$ErrorActionPreference = 'Stop'

$taskName = 'Organize Your PC - Everything Companion'
$protocolName = 'organizeyourpc-companion'
$protocolRoot = "HKCU:\Software\Classes\$protocolName"
$installDirectory = Join-Path $env:LOCALAPPDATA 'Programs\Organize Your PC\Everything Companion'
$sourceDirectory = $PSScriptRoot
$sourceExecutable = Join-Path $sourceDirectory 'EverythingCompanion.exe'
$installedExecutable = Join-Path $installDirectory 'EverythingCompanion.exe'
$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name

if (-not (Test-Path $sourceExecutable)) {
    throw "EverythingCompanion.exe was not found beside the installer. Extract the complete release ZIP before installing."
}

New-Item -ItemType Directory -Path $installDirectory -Force | Out-Null

Get-Process -Name 'EverythingCompanion' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

if (-not $SkipCopy) {
    Get-ChildItem -Path $sourceDirectory -File | Where-Object {
        $_.Name -notin @(
            'Install-EverythingCompanion.cmd',
            'Install-EverythingCompanion.ps1',
            'Uninstall-EverythingCompanion.cmd',
            'Uninstall-EverythingCompanion.ps1'
        )
    } | Copy-Item -Destination $installDirectory -Force
}

if (-not (Test-Path $installedExecutable)) {
    throw "EverythingCompanion.exe was not found in the installation directory: $installDirectory"
}

$action = New-ScheduledTaskAction -Execute $installedExecutable -WorkingDirectory $installDirectory
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $currentUser
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit ([TimeSpan]::Zero) `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -StartWhenAvailable
$principal = New-ScheduledTaskPrincipal -UserId $currentUser -LogonType Interactive -RunLevel Limited

Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description 'Starts the local Everything companion for Organize Your PC when this user signs in.' `
    -Force | Out-Null

New-Item -Path $protocolRoot -Force | Out-Null
Set-Item -Path $protocolRoot -Value 'URL:Organize Your PC Companion Protocol'
New-ItemProperty -Path $protocolRoot -Name 'URL Protocol' -Value '' -PropertyType String -Force | Out-Null

$defaultIconKey = Join-Path $protocolRoot 'DefaultIcon'
New-Item -Path $defaultIconKey -Force | Out-Null
Set-Item -Path $defaultIconKey -Value ('"' + $installedExecutable + '",0')

$commandKey = Join-Path $protocolRoot 'shell\open\command'
New-Item -Path $commandKey -Force | Out-Null
Set-Item -Path $commandKey -Value ('"' + $installedExecutable + '"')

Start-ScheduledTask -TaskName $taskName
Start-Sleep -Seconds 2

try {
    $response = Invoke-RestMethod -Uri 'http://127.0.0.1:51337/api/health' -TimeoutSec 5
    Write-Host "Everything Companion installed and running: $($response.status)"
}
catch {
    Write-Warning 'Installation completed, but the local health check did not respond yet. Ensure Everything is installed and running, then use Check Again in Organize Your PC.'
}

Write-Host 'The companion is running now and will start automatically in the background whenever this Windows user signs in.'