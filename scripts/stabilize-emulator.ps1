# Fixes "System UI isn't responding" by freeing RAM and tuning the running emulator.
$ErrorActionPreference = "SilentlyContinue"

$sdkRoot = "$env:LOCALAPPDATA\Android\Sdk"
$env:Path = "$sdkRoot\platform-tools;$sdkRoot\emulator;$env:Path"

Write-Host "=== Emulator stabilizer ===" -ForegroundColor Cyan

# Keep only one emulator
$devices = adb devices 2>&1 | Select-String "emulator-\d+\s+device"
if (($devices | Measure-Object).Count -gt 1) {
  Write-Host "Multiple emulators detected — keep only Kudya_Pixel (5554)." -ForegroundColor Yellow
  adb devices | Select-String "emulator" | ForEach-Object {
    if ($_ -notmatch "emulator-5554") {
      if ($_ -match "(emulator-\d+)") { adb -s $matches[1] emu kill 2>$null }
    }
  }
  Start-Sleep -Seconds 3
}

# Stop duplicate Metro servers (keep 8082 for kudya-client)
foreach ($port in @(8081, 8083, 8084)) {
  $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($conn -and $conn.OwningProcess -gt 0) {
    Write-Host "Stopping unused Metro on port $port" -ForegroundColor Yellow
    Stop-Process -Id $conn.OwningProcess -Force
  }
}

if (-not (adb devices 2>&1 | Select-String "emulator-5554\s+device")) {
  Write-Host "Kudya_Pixel not running. Start with: npm run android:emulator" -ForegroundColor Red
  exit 1
}

Write-Host "Disabling animations and freeing memory..." -ForegroundColor Cyan
adb -s emulator-5554 shell settings put global window_animation_scale 0
adb -s emulator-5554 shell settings put global transition_animation_scale 0
adb -s emulator-5554 shell settings put global animator_duration_scale 0
adb -s emulator-5554 shell am kill-all 2>$null
Start-Sleep -Seconds 2

$free = [math]::Round((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory / 1MB, 1)
Write-Host "Free RAM: ${free} GB" -ForegroundColor Green
Write-Host "Done. If still frozen, run: npm run android:emulator" -ForegroundColor Green
