# Installs the packaged Electron app into Windows (Start Menu + Desktop).
# Run after: npm run electron:pack

$ErrorActionPreference = "Stop"
$appName = "Khalil Dental CRM"
$root = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $root "package.json"))) { $root = $PSScriptRoot }

$src = Join-Path $root "release\win-unpacked"
$dest = Join-Path $env:LOCALAPPDATA "Programs\$appName"
$exeName = "Khalil Dental CRM.exe"
$exePath = Join-Path $dest $exeName

if (-not (Test-Path (Join-Path $src $exeName))) {
  Write-Host "Building app first..."
  Push-Location $root
  npm run electron:pack
  Pop-Location
}

if (-not (Test-Path (Join-Path $src $exeName))) {
  throw "Could not find packaged app at $src"
}

New-Item -ItemType Directory -Force -Path $dest | Out-Null
robocopy $src $dest /MIR /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
if (-not (Test-Path $exePath)) { throw "Install copy failed" }

function New-Shortcut([string]$shortcutPath, [string]$target, [string]$workDir) {
  $w = New-Object -ComObject WScript.Shell
  $s = $w.CreateShortcut($shortcutPath)
  $s.TargetPath = $target
  $s.WorkingDirectory = $workDir
  $s.Description = $appName
  $s.IconLocation = "$target,0"
  $s.Save()
}

$desktop = [Environment]::GetFolderPath("Desktop")
$startMenu = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs"
New-Item -ItemType Directory -Force -Path $startMenu | Out-Null
New-Shortcut (Join-Path $desktop "$appName.lnk") $exePath $dest
New-Shortcut (Join-Path $startMenu "$appName.lnk") $exePath $dest

$regPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\App Paths\KhalilDentalCRM.exe"
New-Item -Path $regPath -Force | Out-Null
New-ItemProperty -Path $regPath -Name "(default)" -Value $exePath -PropertyType String -Force | Out-Null
New-ItemProperty -Path $regPath -Name "Path" -Value $dest -PropertyType String -Force | Out-Null

Write-Host ""
Write-Host "Installed: $exePath"
Write-Host "Desktop shortcut created"
Write-Host "Start Menu: search for '$appName'"
Write-Host ""
