# TikTok Developer Portal — Kudya app form values

App URL: https://developers.tiktok.com/app/7646571159442327559/pending

## Basic information

| Field | Value |
|-------|-------|
| App name | Kudya |
| Category | Food & Drink |
| Description | See **App description (paste into portal)** below |
| Terms of Service URL | https://kudya.online/TermsOfService |
| Privacy Policy URL | https://kudya.online/PrivacyPolicy |
| Platforms | Web, Android, iOS (uncheck Desktop if not needed) |

## App description (paste into portal)

Kudya is a food delivery and e-commerce app for Southern Africa. TikTok Login Kit is used only so users can log in or sign up with their TikTok account on the Login and Sign Up screens—no separate password required. We request the user.info.basic scope to verify identity and create or link a Kudya account (display name and avatar for the user profile). TikTok is not used to post content, read videos, or access follower statistics.

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

Request only what the app uses:

- **user.info.basic** — required for TikTok login

Do **not** request `user.info.stats` unless you add a feature that uses follower/video counts. The current app code only requests `user.info.basic`.

## App review — Review Description (paste into portal)

**Purpose of TikTok integration**

Kudya uses TikTok Login Kit exclusively for user authentication: log in and sign up. On the Login and Sign Up screens, users can tap "Continue with TikTok" as an alternative to email/password, Google, or Facebook. TikTok is not used for any other feature (no posting, no video access, no analytics).

**What the app does**

Kudya is a food delivery and online shopping platform for Southern Africa (iOS, Android, and web at https://kudya.online). After signing up or logging in—including via TikTok—users browse restaurants and stores, place orders, and track deliveries.

**Login and sign-up flow with TikTok**

1. New or returning user opens the Kudya Login or Sign Up screen.
2. User taps **Continue with TikTok**.
3. TikTok authorization screen opens; user approves access.
4. Redirect: `kudya://oauth` (mobile) or `https://kudya.online/oauth` (web).
5. Kudya backend exchanges the code for a token (`POST https://open.tiktokapis.com/v2/oauth/token/`).
6. Backend reads basic profile fields (`GET https://open.tiktokapis.com/v2/user/info/` with fields: open_id, display_name, avatar_url).
7. If the TikTok account is new → Kudya creates a customer account. If it already exists → Kudya logs the user in. API endpoint: `POST /api/auth/social/`.

**Scope requested: user.info.basic**

| Data from TikTok | Used for login/sign-up how |
|------------------|----------------------------|
| open_id | Unique identifier to link TikTok to one Kudya account (login on return visits, prevent duplicate sign-ups) |
| display_name | Pre-fill first/last name on the Kudya user profile after sign-up |
| avatar_url | Show profile picture in the Kudya app after sign-up |

This data is stored only to operate the user account inside Kudya. It is not used for ads, not sold, and not sent back to TikTok.

**What we do NOT do**

- No access to TikTok videos or content
- No user.info.stats (no followers, likes, or video counts)
- No posting to TikTok on the user's behalf
- No TikTok data used outside login/sign-up and in-app profile display

**Legal links**

- Terms of Service: https://kudya.online/TermsOfService
- Privacy Policy: https://kudya.online/PrivacyPolicy

## Fix for previous rejection

1. **Invalid Terms of Service link** — Previously pointed to the Privacy Policy URL. Use `https://kudya.online/TermsOfService` (deploy `food_deliver/app/TermsOfService/page.tsx` first and confirm the page loads in a browser).
2. **Insufficient review description** — Paste the full **Review Description** section above into the App review field.

## Still required manually

1. **Deploy Terms of Service page** — push and deploy `food_deliver` so https://kudya.online/TermsOfService returns 200 (not 404).
2. **App icon** — upload 1024×1024 PNG (e.g. from `kudya-client/assets/icon.png`)
3. **Demo video** — upload MP4 showing TikTok login flow (tap Continue with TikTok → authorize → land in Kudya logged in)
4. Scroll to **Platforms** section and fill Web URL + Android/iOS details if empty
5. Click **Save**, then **Submit for review**
