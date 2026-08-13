<#requires -Version 7.0
.SYNOPSIS
  Syncs the RNUR UNIDATA mirror in this repository from the upstream rnur
  repository (local <Documents>\rnur or GitHub).

.DESCRIPTION
  Watches the rnur UNIDATA folder and copies any changes into this repo's
  rnur/UNIDATA mirror, preserving the site-specific index.html and README.md
  pages. The upstream source is resolved in this order:

    1. -Source (explicit path to the rnur repo or UNIDATA folder)
    2. The local repo at <MyDocuments>\rnur (detected for the current user)
    3. A clone of the GitHub repo (default rnur-consortium/rnur)

.PARAMETER Mirror
  Path to this repo's UNIDATA mirror. Defaults to <repo>\rnur\UNIDATA.

.PARAMETER Source
  Explicit path to the upstream rnur repo (or directly its UNIDATA folder).
  Overrides auto-detection.

.PARAMETER FromGitHub
  Always fetch from GitHub instead of the local repo.

.PARAMETER GitHubRepo
  GitHub "owner/repo" to fetch from. Default: rnur-consortium/rnur.

.PARAMETER DryRun
  Report what would change without modifying anything.

.PARAMETER NoPull
  Do not git fetch/pull the local repo; use its working tree as-is.

.PARAMETER Watch
  Keep running, re-syncing every -IntervalSeconds.

.PARAMETER IntervalSeconds
  Poll interval used with -Watch. Default: 300.

.EXAMPLE
  pwsh ./scripts/sync-unidata.ps1

.EXAMPLE
  pwsh ./scripts/sync-unidata.ps1 -DryRun

.EXAMPLE
  pwsh ./scripts/sync-unidata.ps1 -FromGitHub

.EXAMPLE
  pwsh ./scripts/sync-unidata.ps1 -Watch -IntervalSeconds 60
#>
[CmdletBinding()]
param(
    [string]$Mirror,
    [string]$Source,
    [switch]$FromGitHub,
    [string]$GitHubRepo = "rnur-consortium/rnur",
    [switch]$DryRun,
    [switch]$NoPull,
    [switch]$Watch,
    [int]$IntervalSeconds = 300
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Site-specific files that must never be touched by the sync.
$Preserved = @("index.html", "README.md")

function Resolve-MirrorPath {
    if ($Mirror) { return $Mirror }
    $repoRoot = Split-Path -Parent $PSScriptRoot
    return Join-Path $repoRoot "rnur\UNIDATA"
}

function Find-LocalRnurRepo {
    $candidates = @()
    try {
        $candidates += (Join-Path ([Environment]::GetFolderPath("MyDocuments")) "rnur")
    } catch { }
    if ($env:USERPROFILE) {
        $candidates += (Join-Path $env:USERPROFILE "Documents\rnur")
        $candidates += (Join-Path $env:USERPROFILE "rnur")
    }
    foreach ($c in $candidates) {
        if (Test-Path -LiteralPath (Join-Path $c ".git")) { return $c }
    }
    return $null
}

function Update-LocalRepo {
    param([string]$Repo, [switch]$SkipPull)

    & git -C $Repo fetch origin 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "git fetch failed in '$Repo' (offline?). Using the existing working tree."
        return
    }
    if ($SkipPull) { return }

    & git -C $Repo pull --ff-only --no-rebase 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "git pull failed (uncommitted local changes?). Using the existing working tree."
    }
}

function Get-GitHubSource {
    param([string]$Repo)

    $tmpRoot = Join-Path ([IO.Path]::GetTempPath()) ("rnur-sync-" + [guid]::NewGuid().ToString("N"))
    New-Item -ItemType Directory -Path $tmpRoot -Force | Out-Null
    $cloneUrl = "https://github.com/$Repo.git"
    & git clone --depth 1 $cloneUrl (Join-Path $tmpRoot "src") 2>$null
    if ($LASTEXITCODE -ne 0) {
        Remove-Item -LiteralPath $tmpRoot -Recurse -Force -ErrorAction SilentlyContinue
        throw "git clone failed for $cloneUrl"
    }
    return (Join-Path $tmpRoot "src")
}

function Get-DataRoot {
    param([string]$Repo)

    $candidate = Join-Path $Repo "UNIDATA"
    if (Test-Path -LiteralPath $candidate) { return $candidate }
    return $Repo
}

function Get-NormalizedHash {
    param([string]$Path)

    $bytes = [IO.File]::ReadAllBytes($Path)
    $text = [Text.Encoding]::UTF8.GetString($bytes)
    $text = $text.Replace("`r`n", "`n")
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    $normBytes = $utf8NoBom.GetBytes($text)
    $sha = [Security.Cryptography.SHA256]::Create()
    return [BitConverter]::ToString($sha.ComputeHash($normBytes))
}

function Sync-Data {
    param(
        [string]$SourceData,
        [string]$MirrorData,
        [switch]$DryRun
    )

    $changed = 0
    $deleted = 0

    $srcFiles = Get-ChildItem -LiteralPath $SourceData -Recurse -File
    foreach ($f in $srcFiles) {
        if ($Preserved -contains $f.Name) { continue }
        $rel = $f.FullName.Substring($SourceData.Length).TrimStart("\", "/")
        $dest = Join-Path $MirrorData $rel
        $needs = $true
        if (Test-Path -LiteralPath $dest) {
            $h1 = Get-NormalizedHash -Path $f.FullName
            $h2 = Get-NormalizedHash -Path $dest
            $needs = $h1 -ne $h2
        }
        if ($needs) {
            $changed++
            Write-Host ("  + {0}" -f $rel)
            if (-not $DryRun) {
                $dir = Split-Path -Parent $dest
                if (-not (Test-Path -LiteralPath $dir)) {
                    New-Item -ItemType Directory -Path $dir -Force | Out-Null
                }
                Copy-Item -LiteralPath $f.FullName -Destination $dest -Force
            }
        }
    }

    if (Test-Path -LiteralPath $MirrorData) {
        $mirrorFiles = Get-ChildItem -LiteralPath $MirrorData -Recurse -File
        foreach ($f in $mirrorFiles) {
            if ($Preserved -contains $f.Name) { continue }
            $rel = $f.FullName.Substring($MirrorData.Length).TrimStart("\", "/")
            $srcPath = Join-Path $SourceData $rel
            if (-not (Test-Path -LiteralPath $srcPath)) {
                $deleted++
                Write-Host ("  - {0}" -f $rel)
                if (-not $DryRun) { Remove-Item -LiteralPath $f.FullName -Force }
            }
        }
    }

    return [pscustomobject]@{ Changed = $changed; Deleted = $deleted }
}

function Invoke-SyncOnce {
    $sourceRepo = $null
    $tempSource = $null

    if ($Source) {
        $sourceRepo = $Source
        if (-not (Test-Path -LiteralPath $sourceRepo)) { throw "Source not found: $sourceRepo" }
    }
    elseif ($FromGitHub) {
        $sourceRepo = Get-GitHubSource -Repo $GitHubRepo
        $tempSource = $sourceRepo
    }
    else {
        $sourceRepo = Find-LocalRnurRepo
        if (-not $sourceRepo) {
            Write-Host "Local rnur repo not found; falling back to GitHub ($GitHubRepo)."
            $sourceRepo = Get-GitHubSource -Repo $GitHubRepo
            $tempSource = $sourceRepo
        }
        else {
            Write-Host "Using local repo: $sourceRepo"
            Update-LocalRepo -Repo $sourceRepo -SkipPull:$NoPull
        }
    }

    try {
        $sourceData = Get-DataRoot -Repo $sourceRepo
        $sourceData = [IO.Path]::GetFullPath($sourceData)
        $mirrorFull = [IO.Path]::GetFullPath($MirrorPath)
        if ($sourceData -eq $mirrorFull) { throw "Source and mirror are the same folder." }

        Write-Host ("Syncing '{0}' -> '{1}'" -f $sourceData, $mirrorFull)
        $result = Sync-Data -SourceData $sourceData -MirrorData $mirrorFull -DryRun:$DryRun
        if ($result.Changed -eq 0 -and $result.Deleted -eq 0) {
            Write-Host "UNIDATA is up to date."
        }
        else {
            Write-Host ("{0} file(s) updated, {1} file(s) deleted." -f $result.Changed, $result.Deleted)
        }
    }
    finally {
        if ($tempSource) {
            Remove-Item -LiteralPath $tempSource -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}

$MirrorPath = Resolve-MirrorPath
if (-not (Test-Path -LiteralPath $MirrorPath)) { throw "Mirror not found: $MirrorPath" }

if ($Watch) {
    Write-Host ("Watching for UNIDATA changes every {0}s. Press Ctrl+C to stop." -f $IntervalSeconds)
    while ($true) {
        Invoke-SyncOnce
        Start-Sleep -Seconds $IntervalSeconds
    }
}
else {
    Invoke-SyncOnce
}
