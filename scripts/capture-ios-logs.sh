#!/usr/bin/env bash
# Capture iOS simulator / device logs to a file for debugging.
# Usage: ./scripts/capture-ios-logs.sh [output.txt]
# Then press 'i' in Expo terminal to open the app; wait a few seconds; Ctrl+C to stop.

OUT="${1:-ios-logs-$(date +%Y%m%d-%H%M%S).txt}"
echo "Capturing iOS logs to $OUT (open the app, then Ctrl+C to stop)..."
xcrun simctl spawn booted log stream --predicate 'eventMessage CONTAINS "kudya" OR eventMessage CONTAINS "Expo" OR eventMessage CONTAINS "com.ludmil" OR processImagePath CONTAINS "Expo" OR processImagePath CONTAINS "kudya"' 2>&1 | tee "$OUT"
