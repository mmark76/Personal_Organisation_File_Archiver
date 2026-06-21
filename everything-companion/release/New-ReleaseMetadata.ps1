[CmdletBinding()]
param(
  [Parameter(Mandatory)]
  [ValidatePattern('^\d+\.\d+\.\d+$')]
  [string]$Version,

  [Parameter(Mandatory)]
  [string]$PackageDirectory,

  [Parameter(Mandatory)]
  [string]$OutputDirectory,

  [Parameter(Mandatory)]
  [string[]]$ReleaseFiles
)

$ErrorActionPreference = 'Stop'

$packagePath = (Resolve-Path -LiteralPath $PackageDirectory).Path
if (-not (Test-Path -LiteralPath $OutputDirectory)) {
  New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
}
$outputPath = (Resolve-Path -LiteralPath $OutputDirectory).Path

$sourceCommit = if ([string]::IsNullOrWhiteSpace($env:GITHUB_SHA)) {
  'local-build'
}
else {
  $env:GITHUB_SHA.ToLowerInvariant()
}

$createdUtc = [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ')
$documentNamespace = "https://github.com/mmark76/Personal_Organisation_File_Archiver/spdx/everything-companion-v$Version/$sourceCommit"
$packageSpdxId = 'SPDXRef-Package-EverythingCompanion'

$spdxFiles = [System.Collections.Generic.List[object]]::new()
$relationships = [System.Collections.Generic.List[object]]::new()
$relationships.Add([ordered]@{
  spdxElementId = 'SPDXRef-DOCUMENT'
  relationshipType = 'DESCRIBES'
  relatedSpdxElement = $packageSpdxId
})

$fileIndex = 0
Get-ChildItem -LiteralPath $packagePath -File -Recurse |
  Sort-Object FullName |
  ForEach-Object {
    $fileIndex += 1
    $relativePath = [IO.Path]::GetRelativePath($packagePath, $_.FullName).Replace('\', '/')
    $hash = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
    $fileSpdxId = "SPDXRef-File-$fileIndex-$($hash.Substring(0, 12))"

    $spdxFiles.Add([ordered]@{
      fileName = "./$relativePath"
      SPDXID = $fileSpdxId
      checksums = @(
        [ordered]@{
          algorithm = 'SHA256'
          checksumValue = $hash
        }
      )
      licenseConcluded = 'NOASSERTION'
      copyrightText = 'NOASSERTION'
    })

    $relationships.Add([ordered]@{
      spdxElementId = $packageSpdxId
      relationshipType = 'CONTAINS'
      relatedSpdxElement = $fileSpdxId
    })
  }

if ($spdxFiles.Count -eq 0) {
  throw 'The Companion package directory is empty; an SBOM cannot be generated.'
}

$spdxDocument = [ordered]@{
  spdxVersion = 'SPDX-2.3'
  dataLicense = 'CC0-1.0'
  SPDXID = 'SPDXRef-DOCUMENT'
  name = "Everything Companion v$Version"
  documentNamespace = $documentNamespace
  creationInfo = [ordered]@{
    created = $createdUtc
    creators = @(
      'Person: Markellos Markides',
      'Tool: New-ReleaseMetadata.ps1'
    )
  }
  packages = @(
    [ordered]@{
      name = 'Everything Companion for Organize Your PC'
      SPDXID = $packageSpdxId
      versionInfo = $Version
      downloadLocation = 'NOASSERTION'
      filesAnalyzed = $true
      licenseConcluded = 'NOASSERTION'
      licenseDeclared = 'NOASSERTION'
      copyrightText = 'Copyright Markellos Markides'
      primaryPackagePurpose = 'APPLICATION'
    }
  )
  files = @($spdxFiles)
  relationships = @($relationships)
}

$sbomName = "EverythingCompanion-v$Version.spdx.json"
$sbomPath = Join-Path $outputPath $sbomName
$spdxDocument |
  ConvertTo-Json -Depth 12 |
  Set-Content -LiteralPath $sbomPath -Encoding utf8NoBOM

$checksumTargets = [System.Collections.Generic.List[System.IO.FileInfo]]::new()
foreach ($releaseFile in $ReleaseFiles) {
  $candidatePath = if ([IO.Path]::IsPathRooted($releaseFile)) {
    $releaseFile
  }
  else {
    Join-Path $outputPath $releaseFile
  }

  if (-not (Test-Path -LiteralPath $candidatePath -PathType Leaf)) {
    throw "Release file does not exist: $candidatePath"
  }

  $checksumTargets.Add((Get-Item -LiteralPath $candidatePath))
}
$checksumTargets.Add((Get-Item -LiteralPath $sbomPath))

$checksumLines = $checksumTargets |
  Sort-Object Name |
  ForEach-Object {
    $hash = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
    "$hash  $($_.Name)"
  }

$checksumsPath = Join-Path $outputPath 'SHA256SUMS.txt'
$checksumLines | Set-Content -LiteralPath $checksumsPath -Encoding utf8NoBOM

Write-Host "Generated SPDX SBOM: $sbomPath"
Write-Host "Generated checksum manifest: $checksumsPath"
