param(
  [ValidateSet("apk", "aab")]
  [string]$Output = "apk"
)

$ErrorActionPreference = "Stop"
$appRoot = Split-Path $PSScriptRoot -Parent
Set-Location $appRoot

$sdkRoot = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { "$env:LOCALAPPDATA\Android\Sdk" }
if (-not (Test-Path $sdkRoot)) {
  Write-Error "Android SDK not found at $sdkRoot. Install Android Studio first."
}
$env:ANDROID_HOME = $sdkRoot
$env:ANDROID_SDK_ROOT = $sdkRoot

$ndkRoot = Join-Path $sdkRoot "ndk\27.1.12297006"
$ndkToolchain = Join-Path $ndkRoot "toolchains\llvm\prebuilt"
if (-not (Test-Path $ndkToolchain)) {
  Write-Error @"
Android NDK 27.1.12297006 is not fully installed (found stub at $ndkRoot).
Open Android Studio -> Settings -> Languages & Frameworks -> Android SDK -> SDK Tools,
check 'NDK (Side by side)' and 'CMake', apply, then re-run this script.
"@
}

Write-Host "Using ANDROID_HOME=$sdkRoot" -ForegroundColor Cyan

if (-not (Test-Path "android\gradlew.bat")) {
  Write-Host "Generating native Android project (expo prebuild)..." -ForegroundColor Yellow
  npx expo prebuild --platform android --clean
}

Set-Location android
$gradleTask = if ($Output -eq "aab") { "bundleRelease" } else { "assembleRelease" }
Write-Host "Running gradlew $gradleTask (Windows-native; EAS --local requires macOS/Linux)..." -ForegroundColor Cyan
.\gradlew $gradleTask --no-daemon

$artifact = if ($Output -eq "aab") {
  Get-ChildItem -Path "app\build\outputs\bundle\release" -Filter "*.aab" -ErrorAction SilentlyContinue | Select-Object -First 1
} else {
  Get-ChildItem -Path "app\build\outputs\apk\release" -Filter "*.apk" -ErrorAction SilentlyContinue | Select-Object -First 1
}

if ($artifact) {
  Write-Host ""
  Write-Host "Build succeeded:" -ForegroundColor Green
  Write-Host $artifact.FullName
} else {
  Write-Error "Gradle finished but no $Output artifact was found."
}
