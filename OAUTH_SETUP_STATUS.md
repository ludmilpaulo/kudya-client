# Kudya Client — Social login setup status

## Already implemented in the app

| Feature | Login screen | Sign up screen |
|---------|--------------|----------------|
| Google | Yes | Yes |
| Facebook | Yes | Yes |
| TikTok | Yes | Yes |
| Face ID / biometrics | Yes | After first login (enrollment prompt) |

Redirect URI for all providers: **`kudya://oauth`**

---

## Configured automatically

| Provider | Mobile `.env` | Notes |
|----------|---------------|--------|
| Facebook | `EXPO_PUBLIC_FACEBOOK_APP_ID=557245288279218` | Meta app **Django APi** (your account) |

---

## Action required (you — in browser)

### 1. Facebook (Meta) — **Django APi** app

Opened in Cursor browser: [App settings](https://developers.facebook.com/apps/557245288279218/settings/basic/)

1. Click **Restore Access** (app was deactivated due to inactivity).
2. **App settings → Basic** → click **Show** next to **App secret** → copy secret.
3. Add to **Render** (`kudya-api` environment):
   ```
   FACEBOOK_APP_ID=557245288279218
   FACEBOOK_APP_SECRET=<paste secret>
   ```
4. **Facebook Login → Settings** → **Valid OAuth Redirect URIs** → add:
   ```
   kudya://oauth
   ```
5. **iOS** platform: Bundle ID `com.ludmil.kudyaclient`
6. **Android** platform: Package `com.ludmil.kudyaclient` (+ EAS SHA-1 key hash for release builds)

### 2. Google Cloud

Project: `data-eng-248912` (ludmilpaulo@gmail.com)

1. [Credentials](https://console.cloud.google.com/apis/credentials)
2. Create OAuth clients: **iOS**, **Android**, **Web**
3. Fill `kudya-client/.env`:
   ```
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=...
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...
   ```
4. Render:
   ```
   GOOGLE_OAUTH_CLIENT_IDS=ios-id,android-id,web-id
   ```

### 3. TikTok

1. [developers.tiktok.com](https://developers.tiktok.com/apps/) → **Connect an app** or use existing app
2. Enable **Login Kit**, redirect: `kudya://oauth`
3. Copy **Client Key** → `EXPO_PUBLIC_TIKTOK_CLIENT_KEY` and Render `TIKTOK_CLIENT_KEY`

---

## Test locally

```bash
cd kudya-client
npx expo start --clear
```

1. Open **Login** or **Sign up**
2. Tap **Continue with Facebook** (after steps above)
3. After email/password or social login → enable **Face ID** when prompted
4. Next visit → **Sign in with biometrics**

---

## EAS production

OAuth keys are in `eas.json` production env for Facebook ID. Add Google/TikTok keys to [expo.dev](https://expo.dev) → project **kudya** → Secrets before store builds.
