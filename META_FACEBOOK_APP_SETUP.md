# Meta app `26291557020518962` — Kudya Facebook Login

App settings: [Basic](https://developers.facebook.com/apps/26291557020518962/settings/basic/?business_id=1109377950148712)

## 1. Basic settings (fix common blockers)

| Field | Value |
|-------|--------|
| **App ID** | `26291557020518962` (use in `EXPO_PUBLIC_FACEBOOK_APP_ID` and backend `FACEBOOK_APP_ID`) |
| **App domains** | `kudya.store`, `www.kudya.store` |
| **Privacy Policy URL** | `https://www.kudya.store/PrivacyPolicy` |
| **Terms of Service URL** | `https://www.kudya.store/PrivacyPolicy` (or add a dedicated Terms page) |
| **User data deletion** | `https://www.kudya.store/PrivacyPolicy` or a contact email |
| **Category** | Shopping / Lifestyle (or closest match) |
| **App icon** | Kudya logo (512×512) |

Click **Save changes** at the bottom.

## 2. Add Facebook Login product

1. Dashboard → **Add product** → **Facebook Login** → **Set up**
2. **Settings** → [Facebook Login settings](https://developers.facebook.com/apps/26291557020518962/fb-login/settings/)

**Valid OAuth Redirect URIs** (one per line):

```
kudya://oauth
kudyaparceiro://oauth
https://www.kudya.store/
```

For Expo Go / dev (optional):

```
exp://127.0.0.1:8081/--/oauth
exp://localhost:8081/--/oauth
```

3. Enable **Login with the JavaScript SDK** only if you use web; mobile uses the URIs above.
4. **Save changes**

## 3. App roles (Development mode)

While the app is in **Development**, only **Roles** (Admin/Developer/Tester) can log in with Facebook.

- [Roles](https://developers.facebook.com/apps/26291557020518962/roles/roles/) → add test users or your Facebook account as **Administrator**.

To go public: **App Review** → request `email` and `public_profile`, then switch app to **Live**.

## 4. App Secret (backend only)

1. **Settings → Basic** → **Show** next to **App secret**
2. Copy into `www_kudya_shop` server `.env`:

```
FACEBOOK_APP_ID=26291557020518962
FACEBOOK_APP_SECRET=<paste secret here>
```

Never commit the secret to git.

## 5. Mobile `.env` (kudya-client)

```
EXPO_PUBLIC_FACEBOOK_APP_ID=26291557020518962
```

Instagram Login often uses the **same** Meta app ID as `EXPO_PUBLIC_INSTAGRAM_APP_ID` if Instagram product is added to this app.

## 6. EAS production

```bash
cd kudya-client
eas secret:create --name EXPO_PUBLIC_FACEBOOK_APP_ID --value 26291557020518962 --scope project
```

Backend secrets on your server: `FACEBOOK_APP_ID` + `FACEBOOK_APP_SECRET`.
