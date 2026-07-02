# Start Metro for Expo Go (scan QR with the Expo Go app).
$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)
Write-Host "Starting Metro for Expo Go. Scan the QR code with the Expo Go app." -ForegroundColor Cyan
npx expo start --go
