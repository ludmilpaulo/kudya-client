# 🔧 Building for Real iOS & Android Devices - Expo SDK 54

## ⚠️ Important: After SDK Upgrade, Native Code Must Be Rebuilt

After upgrading to Expo SDK 54, you **cannot use old builds** on real devices. You need to create new builds.

---

## 🎯 Option 1: EAS Build (Recommended for Production)

This is the easiest and most reliable method for Expo managed workflow.

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to EAS
```bash
eas login
```

### Step 3: Configure EAS Build
```bash
cd /Users/ludmil/Desktop/Apps/kudya-client
eas build:configure
```

### Step 4: Build for iOS (Development)
```bash
# For development/testing on your device
eas build --profile development --platform ios

# Or for production
eas build --profile production --platform ios
```

### Step 5: Build for Android (Development)
```bash
# For development/testing on your device
eas build --profile development --platform android

# Or for production APK
eas build --profile production --platform android
```

### Step 6: Install on Device
Once build completes, you'll get a download link. Install the app on your device.

---

## 🎯 Option 2: Development Build (Faster Testing)

Create a development build that includes all native modules but allows hot reloading.

### Create eas.json (if not exists)
```bash
cat > eas.json << 'EOF'
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "buildConfiguration": "Debug"
      },
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
EOF
```

### Build Development Client
```bash
# iOS
eas build --profile development --platform ios

# Android
eas build --profile development --platform android
```

### Start Development Server
```bash
npx expo start --dev-client
```

---

## 🎯 Option 3: Local Build (Advanced)

If you want to build locally, you need to generate native projects first.

### Step 1: Prebuild (Generate Native Projects)
```bash
npx expo prebuild --clean
```

### Step 2: iOS Local Build
```bash
# Install pods
cd ios
pod install
cd ..

# Open in Xcode
open ios/kudya.xcworkspace

# Build and run from Xcode
```

### Step 3: Android Local Build
```bash
# Build APK
cd android
./gradlew assembleDebug
cd ..

# Install on connected device
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🎯 Option 4: Expo Go (Limited - May Not Work)

⚠️ **Warning**: Expo Go might not support all features after SDK 54 upgrade or with Mixpanel native module.

```bash
npx expo start --tunnel
```

If you see errors like "Unable to resolve module" or "Native module not found", you MUST use one of the build options above.

---

## 🐛 Common Errors & Solutions

### Error: "Invariant Violation: Module AppRegistry is not a registered callable module"
**Solution**: Rebuild the app with EAS or locally.

### Error: "Unable to resolve module mixpanel-react-native"
**Solution**: The native module isn't included. Use development build or EAS build.

### Error: "Native module cannot be null"
**Solution**: Rebuild the app to include native dependencies.

### Error: "App keeps crashing on launch"
**Solution**: 
```bash
# Clear build cache
rm -rf node_modules
npm install --legacy-peer-deps

# Rebuild
eas build --profile development --platform all
```

---

## 📱 Quick Fix: Create Development Build Now

### For iOS:
```bash
cd /Users/ludmil/Desktop/Apps/kudya-client
eas build --profile development --platform ios --non-interactive
```

### For Android:
```bash
cd /Users/ludmil/Desktop/Apps/kudya-client
eas build --profile development --platform android --non-interactive
```

This will:
1. Build a development version of your app
2. Include all native modules (Mixpanel, etc.)
3. Support Expo SDK 54
4. Allow hot reloading
5. Give you a downloadable build

---

## ⚡ Fastest Solution (Recommended)

1. **Build development client once**:
   ```bash
   eas build --profile development --platform all
   ```

2. **Install on your devices** (you'll get download links)

3. **Use for development**:
   ```bash
   npx expo start --dev-client
   ```

4. **Make changes and test** - hot reload works!

---

## 🔍 Verify Your Setup

### Check if you can use Expo Go:
```bash
npx expo-doctor
```

### Check EAS configuration:
```bash
eas build:configure
```

### Check what needs to be built:
```bash
npx expo prebuild --no-install --check
```

---

## 📊 Build Time Expectations

| Build Type | Platform | Time | Notes |
|------------|----------|------|-------|
| Development | iOS | ~15-20 min | First build |
| Development | Android | ~10-15 min | First build |
| Production | iOS | ~20-30 min | Includes signing |
| Production | Android | ~15-20 min | Includes signing |

Subsequent builds are faster (~5-10 min).

---

## 🎯 What I Recommend

**For testing your Mixpanel integration now:**

```bash
cd /Users/ludmil/Desktop/Apps/kudya-client

# Build both platforms
eas build --profile development --platform all
```

Wait for builds to complete (~20-30 minutes), then:
1. Download and install on your devices
2. Start dev server: `npx expo start --dev-client`
3. Scan QR code from installed app
4. Test and see Mixpanel events! ✨

---

## 💡 Why This is Necessary

1. **Expo SDK 54** requires new native code
2. **Mixpanel React Native** is a native module
3. **React Native 0.76.5** has native changes
4. Old builds won't work with new code

You only need to rebuild when:
- Upgrading Expo SDK
- Adding/updating native modules
- Changing native configurations

After that, you can use hot reload for JS changes!

---

## 🆘 Still Having Issues?

Run this diagnostic:
```bash
cd /Users/ludmil/Desktop/Apps/kudya-client
npx expo-doctor
npx expo config --type public
```

Share the output and I can help further!

---

**Ready to build?** Run:
```bash
eas build --profile development --platform all
```

🚀 **This will fix your device testing issues!**

