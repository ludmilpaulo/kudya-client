# TikTok Developer Portal — Kudya app form values

App URL: https://developers.tiktok.com/app/7646571159442327559/pending

## Basic information

| Field | Value |
|-------|-------|
| App name | Kudya |
| Category | Food & Drink |
| Description | Food delivery and e-commerce app for Southern Africa. Users order meals and shop with TikTok login. |
| Terms of Service URL | https://kudya.online/PrivacyPolicy |
| Privacy Policy URL | https://kudya.online/PrivacyPolicy |
| Platforms | Web, Android, iOS (uncheck Desktop if not needed) |

## Platform configuration

| Field | Value |
|-------|-------|
| Web/Desktop URL | https://kudya.online |
| Android package | com.ludmil.kudyaclient |
| Google Play URL | https://play.google.com/store/apps/details?id=com.ludmil.kudyaclient |
| App signature (MD5, no colons) | 27805C702E856C2299E6BA4366071576 |
| SHA-256 fingerprint | D4:C1:AD:4A:76:BF:2C:60:E2:73:23:AE:38:08:53:27:0D:2E:58:83:74:75:49:70:08:31:25:28:CF:EC:66:B4 |
| iOS bundle ID | com.ludmil.kudyaclient |
| App Store URL | (your real App Store link when published) |

## Products

- **Login Kit** (required)

## Login Kit redirect URIs

Because **Web** is enabled, TikTok requires a **saved** web redirect URI (typing alone is not enough — click **Add a URI**).

| Platform | Redirect URI |
|----------|----------------|
| Web | `https://kudya.online/oauth` |
| Android / iOS | `kudya://oauth` |

**Web/Desktop URL** must match the redirect domain (no `www` mismatch):

- Use `https://kudya.online` — not `https://www.kudya.online/`

### Error: "App must have web redirect uri or trusted domain"

Fix (pick one):

1. **Add web redirect** — Login Kit → **Web** tab → enter `https://kudya.online/oauth` → **Add a URI** → **Save**
2. **Verify domain** — top bar **URL properties** → add/verify `kudya.online` (DNS or file verification)
3. **Mobile-only** — if you only use the app (not a website), uncheck **Web** and **Desktop** under Platforms; then only `kudya://oauth` on Android/iOS tabs is required (matches `socialAuth.ts`)

## Scopes

- user.info.basic
- user.info.stats

## App review

Kudya uses TikTok Login Kit so customers sign in with TikTok on iOS, Android, and web. Users tap Continue with TikTok on login, authorize via OAuth (kudya://oauth on mobile, https://kudya.online/oauth on web). The app exchanges the code for a token; Kudya API verifies at POST /api/auth/social/.

## Still required manually

1. **App icon** — upload 1024×1024 PNG (e.g. from `kudya-client/assets/icon.png`)
2. **Demo video** — upload MP4 showing TikTok login flow
3. Scroll to **Platforms** section and fill Web URL + Android/iOS details if empty
4. Click **Save**, then **Submit for review**
