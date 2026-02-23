#!/usr/bin/env bash
# Capture Android device logs for the app.
# Usage: Connect device or start emulator, then: ./scripts/capture-android-logs.sh [output.txt]
# Press 'a' in Expo terminal to open the app; wait a few seconds; Ctrl+C to stop.

OUT="${1:-android-logs-$(date +%Y%m%d-%H%M%S).txt}"
echo "Capturing Android logcat to $OUT (open the app, then Ctrl+C to stop)..."
adb logcat -c && adb logcat 2>&1 | tee "$OUT"
