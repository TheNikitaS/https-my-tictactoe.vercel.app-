$ErrorActionPreference = 'Stop'

$root = $PSScriptRoot

function Invoke-Git {
    param(
        [Parameter(ValueFromRemainingArguments = $true)]
        [string[]]$Args
    )

    & 'C:\Program Files\Git\cmd\git.exe' @Args
    if ($LASTEXITCODE -ne 0) {
        throw "Git command failed: git $($Args -join ' ')"
    }
}

function Get-UnicodeName {
    param(
        [int[]]$Codes
    )

    return -join ($Codes | ForEach-Object { [char]$_ })
}

$mappings = @(
    @{
        Source = Join-Path (Join-Path $root (Get-UnicodeName @(1052,1086,1081))) 'calculator.html'
        Target = Join-Path $root 'moy\index.html'
    },
    @{
        Source = Join-Path (Join-Path $root (Get-UnicodeName @(1055,1072,1088,1090))) 'Partcalculator.html'
        Target = Join-Path $root 'part\index.html'
    },
    @{
        Source = Join-Path (Join-Path $root (Get-UnicodeName @(1055,1088,1086,1076,1072,1078,1080))) 'orders_light.html'
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

Invoke-Git add README.md .gitignore index.html publish.ps1 supabase_setup.sql platform_setup.sql platform_owner_patch.sql platform_light2_patch.sql platform_light2_finance_patch.sql platform_first_run.sql shared moy part prodazhi platform

$status = & 'C:\Program Files\Git\cmd\git.exe' status --porcelain
if ($LASTEXITCODE -ne 0) {
    throw 'Failed to read git status.'
}

if (-not $status) {
    Write-Host 'No changes to publish.'
    exit 0
}

$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
Invoke-Git commit -m "Publish update $timestamp"
Invoke-Git push origin main

Write-Host 'Published successfully.'
