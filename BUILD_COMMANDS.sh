#!/bin/bash

echo "🚀 Building Kudya App for Real Devices (Expo SDK 54)"
echo "=================================================="
echo ""

cd /Users/ludmil/Desktop/Apps/kudya-client

echo "📱 Step 1: Build for iOS (Development)"
echo "This will take ~15-20 minutes..."
echo ""
echo "Run this command:"
echo "eas build --profile development --platform ios"
echo ""
echo "=================================================="
echo ""

echo "🤖 Step 2: Build for Android (Development)"
echo "This will take ~10-15 minutes..."
echo ""
echo "Run this command:"
echo "eas build --profile development --platform android"
echo ""
echo "=================================================="
echo ""

echo "Or build both at once:"
echo "eas build --profile development --platform all"
echo ""
echo "=================================================="
echo ""

echo "After builds complete:"
echo "1. You'll get download links for both apps"
echo "2. Install them on your devices"
echo "3. Start dev server: npx expo start --dev-client"
echo "4. Scan QR code from the installed apps"
echo "5. Test your Mixpanel integration! ✨"
echo ""
echo "=================================================="

