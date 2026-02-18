# Install kudya-client APK on all connected Android devices
$apkPath = "h:\GitHub\Kudya\kudya-client\android\app\build\outputs\apk\debug\app-debug.apk"

# Wait for APK to exist (max 10 min)
$timeout = 600
$elapsed = 0
while (-not (Test-Path $apkPath) -and $elapsed -lt $timeout) {
    Write-Host "Waiting for APK... ($elapsed s)"
    Start-Sleep -Seconds 15
    $elapsed += 15
}

if (-not (Test-Path $apkPath)) {
    Write-Error "APK not found at $apkPath after ${timeout}s. Build may have failed."
    exit 1
}

Write-Host "APK found. Installing on all devices..."

# Get devices with status "device"
$output = adb devices 2>$null
$devices = @()
foreach ($line in $output) {
    if ($line -match "^\s*(.+?)\s+device\s*$") {
        $devices += $Matches[1]
    }
}

if ($devices.Count -eq 0) {
    Write-Error "No devices with status 'device' found."
    exit 1
}

foreach ($device in $devices) {
    Write-Host "Installing on $device..."
    adb -s $device install -r $apkPath
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK - Installed on $device"
    } else {
        Write-Host "  FAILED - $device"
    }
}

Write-Host "Done."
