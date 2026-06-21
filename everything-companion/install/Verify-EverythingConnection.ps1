$ErrorActionPreference = 'Stop'

$healthUri = 'http://127.0.0.1:51337/api/health'
$healthResponse = $null
$lastHealthError = $null

for ($attempt = 1; $attempt -le 20; $attempt++) {
    try {
        $healthResponse = Invoke-RestMethod -Uri $healthUri -TimeoutSec 3
        if ($healthResponse.status -eq 'ok' -and $healthResponse.everythingAvailable -eq $true) {
            break
        }
    }
    catch {
        $lastHealthError = $_.Exception.Message
    }

    Start-Sleep -Seconds 1
}

if ($null -eq $healthResponse -or $healthResponse.status -ne 'ok') {
    $detail = if ($lastHealthError) { " Last error: $lastHealthError" } else { '' }
    throw "The Companion was copied, but its local health endpoint did not become ready.$detail"
}

if ($healthResponse.everythingAvailable -ne $true) {
    throw 'The Companion was installed, but it could not connect to Everything. Install and start the 64-bit Everything application, then run the installer again.'
}

Write-Host "Everything Companion is connected through the $($healthResponse.backend) backend."
