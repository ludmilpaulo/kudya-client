# Start Metro for the Kudya development build (NOT Expo Go).
$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)
Write-Host "Starting Metro for development build (do NOT use Expo Go)." -ForegroundColor Cyan
Write-Host "Install the dev app first if needed: npx expo run:android" -ForegroundColor Yellow
npx expo start --dev-client
