# setup-windows.ps1 - Install / verify prerequisites for the SDLC pipeline on Windows.
# Checks for jq, perl, bash, node and installs jq via winget (or choco) if missing.
# Run: powershell -ExecutionPolicy Bypass -File scripts\setup-windows.ps1

$ErrorActionPreference = 'Stop'

function Test-Command {
    param([string]$Name)
    $cmd = Get-Command $Name -ErrorAction SilentlyContinue
    if ($null -eq $cmd) { return $null }
    return $cmd.Source
}

function Get-ToolVersion {
    param([string]$Name, [string]$VersionArg = '--version')
    try {
        $out = & $Name $VersionArg 2>&1 | Select-Object -First 1
        return "$out".Trim()
    } catch {
        return '(version check failed)'
    }
}

function Report-Tool {
    param([string]$Name, [string]$VersionArg = '--version')
    $path = Test-Command $Name
    if ($null -ne $path) {
        $ver = Get-ToolVersion -Name $Name -VersionArg $VersionArg
        Write-Host "[OK]      $Name -> $path ($ver)" -ForegroundColor Green
        return $true
    } else {
        Write-Host "[MISSING] $Name not found on PATH" -ForegroundColor Yellow
        return $false
    }
}

Write-Host "=== SDLC Windows setup ===" -ForegroundColor Cyan

$hasWinget = $null -ne (Test-Command 'winget')
$hasChoco  = $null -ne (Test-Command 'choco')

if ($hasWinget) {
    Write-Host "Package manager: winget" -ForegroundColor Cyan
} elseif ($hasChoco) {
    Write-Host "Package manager: choco (winget not found)" -ForegroundColor Cyan
} else {
    Write-Host "Package manager: none detected (install App Installer for winget, or Chocolatey)" -ForegroundColor Yellow
}

Write-Host "`n--- Tool check ---"
$jqOk   = Report-Tool -Name 'jq'   -VersionArg '--version'
$perlOk = Report-Tool -Name 'perl' -VersionArg '--version'
$bashOk = Report-Tool -Name 'bash' -VersionArg '--version'
$nodeOk = Report-Tool -Name 'node' -VersionArg '--version'

if (-not $jqOk) {
    Write-Host "`nInstalling jq..." -ForegroundColor Cyan
    try {
        if ($hasWinget) {
            & winget install --id jqlang.jq --silent --accept-source-agreements --accept-package-agreements
            if ($LASTEXITCODE -ne 0) { throw "winget exited with code $LASTEXITCODE" }
        } elseif ($hasChoco) {
            & choco install jq -y
            if ($LASTEXITCODE -ne 0) { throw "choco exited with code $LASTEXITCODE" }
        } else {
            Write-Host "Cannot auto-install jq: no package manager available." -ForegroundColor Red
            Write-Host "Install winget (App Installer from Microsoft Store) or Chocolatey, then re-run." -ForegroundColor Yellow
        }
        # Re-check after install (PATH may need refresh in current session).
        $jqOk = Report-Tool -Name 'jq' -VersionArg '--version'
        if (-not $jqOk) {
            Write-Host "jq installed but not on PATH in this session. Open a new shell and re-run to verify." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "Failed to install jq: $($_.Exception.Message)" -ForegroundColor Red
    }
}

if (-not $perlOk -or -not $bashOk) {
    Write-Host "`nperl and bash ship with Git for Windows. Install from https://git-scm.com/download/win" -ForegroundColor Yellow
}
if (-not $nodeOk) {
    Write-Host "node not found. Install Node.js LTS from https://nodejs.org/" -ForegroundColor Yellow
}

Write-Host "`n--- Summary ---" -ForegroundColor Cyan
$status = [ordered]@{ jq = $jqOk; perl = $perlOk; bash = $bashOk; node = $nodeOk }
$missing = @()
foreach ($k in $status.Keys) {
    if ($status[$k]) {
        Write-Host "  ready:   $k" -ForegroundColor Green
    } else {
        Write-Host "  missing: $k" -ForegroundColor Yellow
        $missing += $k
    }
}

if ($missing.Count -eq 0) {
    Write-Host "`nAll prerequisites are ready." -ForegroundColor Green
    exit 0
} else {
    Write-Host "`nStill missing: $($missing -join ', '). See messages above for install steps." -ForegroundColor Yellow
    exit 1
}
