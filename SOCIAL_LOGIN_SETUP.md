# Social login + biometrics (Kudya customer app)

## Quick start

1. Copy `.env.example` → `.env` and fill OAuth client IDs.
2. On the **backend** (`www_kudya_shop/.env`), set matching secrets (see below).
3. Restart Expo: `npx expo start --clear`
4. Sign in once with email/social, then enable **Face ID / biometrics** when prompted.

## Redirect URI (all providers)

Register this in Google, Meta (Facebook), and TikTok developer consoles:

```
kudya://oauth
```

Run `npx expo start` and check the console for the exact redirect URI if using Expo Go.

---

## Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client IDs:
   - **iOS** — bundle id: `com.ludmil.kudyaclient`
   - **Android** — package: `com.ludmil.kudyaclient` + SHA-1 from EAS credentials
   - **Web** — for Expo Go dev; authorized redirect: `https://auth.expo.io/@ludmil/kudya`
3. Copy client IDs to:
   - Mobile: `EXPO_PUBLIC_GOOGLE_*_CLIENT_ID`
   - Backend: `GOOGLE_OAUTH_CLIENT_IDS=ios-id,android-id,web-id`

---

## Meta (Facebook Login)

1. [developers.facebook.com](https://developers.facebook.com/) → Create app → **Consumer** → add **Facebook Login**
2. Settings → Basic → copy **App ID** and **App Secret**
3. Facebook Login → Settings → Valid OAuth Redirect URIs: `kudya://oauth`
4. Mobile: `EXPO_PUBLIC_FACEBOOK_APP_ID`
5. Backend: `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`

---

## TikTok Login Kit

1. [developers.tiktok.com](https://developers.tiktok.com/) → Manage apps → Create app
2. Add **Login Kit** product
3. Redirect URI: `kudya://oauth`
4. Mobile: `EXPO_PUBLIC_TIKTOK_CLIENT_KEY`
5. Backend: `TIKTOK_CLIENT_KEY` and `TIKTOK_CLIENT_SECRET` (token exchange runs on the API, not in the app)

---

## Backend env (`www_kudya_shop`)

```env
GOOGLE_OAUTH_CLIENT_IDS=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
```

Deploy these on Render as environment variables. Run migration if needed:

```bash
python manage.py migrate contas
```

---

## EAS production builds

Add the same `EXPO_PUBLIC_*` variables in [expo.dev](https://expo.dev) → project **kudya** → Secrets, or in `eas.json` production env.

---

## Biometrics (Face ID / fingerprint)

- Uses device **Face ID**, **Touch ID**, or **Android biometrics** via `expo-local-authentication`.
- After first successful login, the app offers to save a **refresh token** in the OS secure keychain (`expo-secure-store`).
- No custom camera face recognition — platform biometrics only (recommended for security).

iOS: `NSFaceIDUsageDescription` is set in `app.config.ts`.

---

## API endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/auth/login/` | Email/username + password |
| `POST /api/auth/social/` | Google / Facebook / TikTok token exchange |
| `POST /api/auth/refresh/` | Refresh JWT (used by biometric login) |
| `POST /customer/signup/` | Email registration (returns JWT) |
