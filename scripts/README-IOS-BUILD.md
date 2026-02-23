# iOS build: "Unable to find a destination" / "iOS 26.2 is not installed"

If `npx expo run:ios` fails with:

- **Unable to find a destination matching the provided destination specifier**
- **Ineligible destinations … error: iOS 26.2 is not installed**

then Xcode 26.2 is installed but the **iOS 26.2 Simulator** runtime is not.

## Fix: Install the iOS 26.2 simulator

1. Open **Xcode**.
2. Go to **Xcode → Settings…** (or **Preferences** on older versions).
3. Open the **Platforms** tab (or **Components** on older Xcode).
4. Find **iOS 26.2** and click **Get** / **Download** to install the simulator runtime.
5. When the download finishes, run again:

   ```bash
   npx expo run:ios
   ```

Expo will then build and install the app on the new iOS 26.2 simulator.

## Alternative: Use an older Xcode

If you have another Xcode (e.g. 16.x) that already has iOS 18 simulators:

```bash
sudo xcode-select -s /Applications/Xcode-16.app/Contents/Developer
npx expo run:ios
```

Replace `Xcode-16.app` with your other Xcode app name. To switch back to 26.2:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```
