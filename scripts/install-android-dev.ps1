# Build and install the Kudya dev client on a USB-connected Android device or emulator.
$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

$sdkRoot = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { "$env:LOCALAPPDATA\Android\Sdk" }
if (Test-Path $sdkRoot) {
  $env:ANDROID_HOME = $sdkRoot
  $env:ANDROID_SDK_ROOT = $sdkRoot
}

$devices = adb devices 2>$null | Where-Object { $_ -match "\tdevice\s*$" }
if (-not $devices) {
  Write-Host "No Android device/emulator detected." -ForegroundColor Red
  Write-Host "  1. Connect your phone via USB and enable USB debugging, OR start an emulator." -ForegroundColor Yellow
  Write-Host "  2. Run: adb devices   (should show 'device', not 'unauthorized')" -ForegroundColor Yellow
  exit 1
}

Write-Host "Building and installing Kudya dev client..." -ForegroundColor Cyan
npx expo run:android --device
