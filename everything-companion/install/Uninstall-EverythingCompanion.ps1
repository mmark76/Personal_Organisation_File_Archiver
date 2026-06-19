$ErrorActionPreference = 'Stop'

$taskName = 'Organize Your PC - Everything Companion'
$protocolName = 'organizeyourpc-companion'
$protocolRoot = "HKCU:\Software\Classes\$protocolName"
$installDirectory = Join-Path $env:LOCALAPPDATA 'Programs\Organize Your PC\Everything Companion'

Get-Process -Name 'EverythingCompanion' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

if (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

if (Test-Path $protocolRoot) {
    Remove-Item -Path $protocolRoot -Recurse -Force
}

if (Test-Path $installDirectory) {
    Remove-Item -Path $installDirectory -Recurse -Force
}

Write-Host 'Everything Companion was removed for this Windows user.'