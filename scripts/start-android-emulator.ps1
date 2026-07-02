# Starts a single lightweight Kudya_Pixel emulator (stable on 16 GB RAM machines).
param(
  [switch]$WipeData
)

$ErrorActionPreference = "Stop"

$sdkRoot = "$env:LOCALAPPDATA\Android\Sdk"
$jdkHome = (Get-ChildItem "$env:LOCALAPPDATA\Android\jdk" -Directory -ErrorAction SilentlyContinue | Select-Object -First 1).FullName
if (-not (Test-Path $sdkRoot)) {
  Write-Error "Android SDK not found at $sdkRoot"
}

$env:JAVA_HOME = $jdkHome
$env:ANDROID_HOME = $sdkRoot
$env:ANDROID_SDK_ROOT = $sdkRoot
$env:Path = "$jdkHome\bin;$sdkRoot\emulator;$sdkRoot\platform-tools;$env:Path"

Write-Host "Stopping other emulators..." -ForegroundColor Yellow
Get-Process qemu-system-x86_64,emulator -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

$emulatorArgs = @(
  "-avd", "Kudya_Pixel",
  "-port", "5554",
  "-memory", "1536",
  "-cores", "2",
  "-gpu", "swiftshader_indirect",
  "-no-audio",
  "-no-boot-anim",
  "-no-snapshot-load",
  "-no-snapshot-save"
)
if ($WipeData) {
  $emulatorArgs += "-wipe-data"
}

Write-Host "Starting Kudya_Pixel (1536 MB RAM, cold boot)..." -ForegroundColor Cyan
Start-Process -FilePath "$sdkRoot\emulator\emulator.exe" -ArgumentList $emulatorArgs -WindowStyle Normal

Write-Host "Waiting for device..." -ForegroundColor Cyan
adb wait-for-device
for ($i = 0; $i -lt 60; $i++) {
  $boot = (adb -s emulator-5554 shell getprop sys.boot_completed 2>$null).Trim()
  if ($boot -eq "1") { break }
  Start-Sleep -Seconds 2
}

Write-Host "Applying performance tweaks..." -ForegroundColor Cyan
adb -s emulator-5554 shell settings put global window_animation_scale 0 2>$null
adb -s emulator-5554 shell settings put global transition_animation_scale 0 2>$null
adb -s emulator-5554 shell settings put global animator_duration_scale 0 2>$null
adb -s emulator-5554 shell settings put global hidden_api_policy 1 2>$null

Write-Host "Ready: emulator-5554" -ForegroundColor Green
adb devices -l
