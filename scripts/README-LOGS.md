# Opening the app and capturing logs

## "Opening on iOS..." never finishes (dev client + tunnel)

With **dev client** and **tunnel**, pressing **i** in the Expo terminal often stays on "Opening on iOS..." and never opens the app. Use two terminals instead:

1. **Terminal 1** – start Metro and tunnel (do **not** press `i`):
   ```bash
   npm run start:dev-client:tunnel
   ```
2. **Terminal 2** – build (if needed), install, and launch the app on the simulator. It will use the server from Terminal 1:
   ```bash
   npm run open:ios
   ```
   Or: `npm run ios` (same command).

First time may take a few minutes to build; later runs are faster. The app should open in the simulator and connect to your tunnel.

For Android: same idea – `npm run start:dev-client:tunnel` in one terminal, then `npm run open:android` in another.

---

## Capturing logs when the app won't open

## 1. Metro / terminal (JS errors)

With `npx expo start` (or dev-client + tunnel) running, **watch the same terminal** when you press `i` (iOS) or `a` (Android). Any uncaught JavaScript error will appear there with a `[Kudya] Uncaught error` line.

## 2. iOS Simulator (Xcode console)

1. Open **Xcode**.
2. **Window → Devices and Simulators**.
3. Select your **simulator** in the left column.
4. Click **Open Console** (or **View Device Logs**).
5. Reproduce: in the Expo terminal press `i` to open on iOS.
6. Copy any crash or error lines and share them.

## 3. iOS logs via script (terminal)

From the project root:

```bash
./scripts/capture-ios-logs.sh
```

Then in the Expo terminal press `i` to open the app. Let it run a few seconds, then **Ctrl+C**. Logs are saved to `ios-logs-<timestamp>.txt`. Share that file (or the relevant part) if you need help.

## 4. Android device / emulator

1. Connect a device or start an emulator.
2. Run:

```bash
./scripts/capture-android-logs.sh
```

3. In the Expo terminal press `a` to open the app.
4. After a few seconds press **Ctrl+C**. Logs are in `android-logs-<timestamp>.txt`.

Or use **Android Studio**: View → Tool Windows → Logcat, then filter by `com.ludmil.kudyaclient` or “ReactNative”.

## 5. Development build (native crash)

If you use a **dev client** (`expo run:ios` / `expo run:android`):

- **iOS**: Run from Xcode (open `ios/kudya.xcworkspace`) and reproduce; the crash will show in the Xcode debug console.
- **Android**: Run `adb logcat` or the script above while opening the app.
