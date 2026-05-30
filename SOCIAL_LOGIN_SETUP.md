# Social login setup (Kudya customer app)

Sign-in uses **Google**, **Facebook**, **Instagram**, and **TikTok** via `expo-auth-session`, then exchanges tokens with the backend at `POST /api/auth/social/`.

## 1. Mobile environment variables

Copy `.env.example` to `.env` and fill in values from each provider console.

| Variable | Used for |
|----------|----------|
| `EXPO_PUBLIC_BASE_API` | API host (e.g. `https://www.kudya.store`) |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Google iOS OAuth client |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Google Android OAuth client |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google web client (Expo Go / dev) |
| `EXPO_PUBLIC_FACEBOOK_APP_ID` | Meta / Facebook Login |
| `EXPO_PUBLIC_INSTAGRAM_APP_ID` | Instagram Basic Display / Graph |
| `EXPO_PUBLIC_TIKTOK_CLIENT_KEY` | TikTok Login Kit |

Redirect URI (register in each provider):

```
kudya://oauth
```

Expo prints the exact URI in dev: `npx expo start` → check logs for `makeRedirectUri`.

## 2. Backend environment (`www_kudya_shop`)

On the server `.env`:

```
GOOGLE_OAUTH_CLIENT_IDS=ios-id.apps.googleusercontent.com,android-id.apps.googleusercontent.com
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=
TIKTOK_CLIENT_KEY=
```

Run migration once:

```bash
python manage.py migrate contas
```

## 3. Provider consoles (summary)

- **Google**: Cloud Console → OAuth 2.0 → iOS + Android clients; add redirect `kudya://oauth` for web client if needed.
- **Facebook**: developers.facebook.com → Facebook Login; add OAuth redirect `kudya://oauth`; same app id for mobile.
- **Instagram**: Meta app with Instagram product; redirect `kudya://oauth`.
- **TikTok**: developers.tiktok.com → Login Kit; redirect `kudya://oauth`.

## 4. EAS builds

Add the same `EXPO_PUBLIC_*` variables as **EAS secrets** for production builds.

## 5. Production API

`/api/auth/social/` must be deployed on your API host. Until the super-app backend is live on production, point `EXPO_PUBLIC_BASE_API` to a staging server that has the route.

## 6. Django auth contract

All mobile login paths use the same JWT API:

| Endpoint | Purpose |
|----------|---------|
| `POST /api/auth/login/` | Email/username + password |
| `POST /api/auth/social/` | OAuth token exchange |
| `POST /api/auth/refresh/` | Refresh access token |
| `GET /api/auth/me/` | Profile (`Authorization: Bearer <access>`) |

Response fields: `access`, `refresh`, `token` (alias of access), `api_token` (legacy DRF key), `user_id`, `is_customer`, `is_driver`.

Legacy endpoints that send `access_token` in the JSON body accept **either** the JWT access string or the legacy `api_token`.
