# Pre-builds the Metro bundle, then opens kudya-client on the emulator.
param(
  [int]$Port = 8082
)

$ErrorActionPreference = "Stop"
$env:Path = "$env:LOCALAPPDATA\Android\Sdk\platform-tools;$env:Path"

if (-not (adb devices 2>&1 | Select-String "emulator-5554\s+device")) {
  Write-Error "Kudya_Pixel (emulator-5554) is not running. Run: npm run android:emulator"
}

$metro = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $metro) {
  Write-Error "Metro is not running on port $Port. Run: npx expo start --dev-client --port $Port"
}

Write-Host "Warming Metro bundle (first load can take ~1 min)..." -ForegroundColor Cyan
try {
  $null = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/node_modules/expo/AppEntry.bundle?platform=android&dev=true&minify=false" -UseBasicParsing -TimeoutSec 300
  Write-Host "Bundle ready." -ForegroundColor Green
} catch {
  Write-Error "Metro bundle failed: $($_.Exception.Message)"
}

adb -s emulator-5554 reverse "tcp:$Port" "tcp:$Port" | Out-Null
adb -s emulator-5554 reverse tcp:8000 tcp:8000 | Out-Null

$url = [uri]::EscapeDataString("http://127.0.0.1:$Port")
adb -s emulator-5554 shell am force-stop com.ludmil.kudyaclient | Out-Null
Start-Sleep -Seconds 1
adb -s emulator-5554 shell am start -a android.intent.action.VIEW -d "exp+kudya://expo-development-client/?url=$url"
Write-Host "Launched kudya-client on emulator-5554" -ForegroundColor Green
