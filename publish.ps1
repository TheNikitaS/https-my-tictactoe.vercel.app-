$ErrorActionPreference = 'Stop'

$root = $PSScriptRoot

$mappings = @(
    @{
        Source = Join-Path $root 'Мой\calculator.html'
        Target = Join-Path $root 'moy\index.html'
    },
    @{
        Source = Join-Path $root 'Парт\Partcalculator.html'
        Target = Join-Path $root 'part\index.html'
    },
    @{
        Source = Join-Path $root 'Продажи\orders_light.html'
        Target = Join-Path $root 'prodazhi\index.html'
    }
)

foreach ($mapping in $mappings) {
    if (-not (Test-Path -LiteralPath $mapping.Source)) {
        throw "Source file not found: $($mapping.Source)"
    }

    $targetDir = Split-Path -Parent $mapping.Target
    New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
    Copy-Item -LiteralPath $mapping.Source -Destination $mapping.Target -Force
}

& 'C:\Program Files\Git\cmd\git.exe' add README.md .gitignore publish.ps1 moy part prodazhi

$status = & 'C:\Program Files\Git\cmd\git.exe' status --porcelain
if (-not $status) {
    Write-Host 'No changes to publish.'
    exit 0
}

$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
& 'C:\Program Files\Git\cmd\git.exe' commit -m "Publish update $timestamp"
& 'C:\Program Files\Git\cmd\git.exe' push origin main

Write-Host 'Published successfully.'
