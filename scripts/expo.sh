#!/usr/bin/env bash
# Use full Xcode (not Command Line Tools only) for Simulator / native builds.
export DEVELOPER_DIR="${DEVELOPER_DIR:-/Applications/Xcode.app/Contents/Developer}"
export LANG="${LANG:-en_US.UTF-8}"
export LC_ALL="${LC_ALL:-en_US.UTF-8}"

if [[ ! -d "$DEVELOPER_DIR" ]]; then
  echo "ERROR: Xcode not found at $DEVELOPER_DIR"
  echo "Install Xcode from the App Store, then run:"
  echo "  sudo xcode-select -s /Applications/Xcode.app/Contents/Developer"
  exit 1
fi

exec npx expo "$@"
