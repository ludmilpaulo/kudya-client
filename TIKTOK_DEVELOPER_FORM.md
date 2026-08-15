# TikTok Developer Portal — Kudya app form values

App URL: https://developers.tiktok.com/app/7646571159442327559/pending

## Basic information

| Field | Value |
|-------|-------|
| App name | Kudya |
| Category | Food & Drink |
| Description | See **App description (paste into portal)** below |
| Terms of Service URL | https://sd-kudya.vercel.app/TermsOfService |
| Privacy Policy URL | https://sd-kudya.vercel.app/PrivacyPolicy |
| Platforms | Web, Android, iOS (uncheck Desktop if not needed) |

## App description (paste into portal)

Kudya is a food delivery and e-commerce app for Southern Africa. TikTok Login Kit is used only so users can log in or sign up with their TikTok account on the Login and Sign Up screens—no separate password required. We request the user.info.basic scope to verify identity and create or link a Kudya account (display name and avatar for the user profile). TikTok is not used to post content, read videos, or access follower statistics.

## Platform configuration

| Field | Value |
|-------|-------|
| Web/Desktop URL | https://sd-kudya.vercel.app |
| Android package | com.ludmil.kudyaclient |
| Google Play URL | https://play.google.com/store/apps/details?id=com.ludmil.kudyaclient |
| App signature (MD5, no colons) | 27805C702E856C2299E6BA4366071576 |
| SHA-256 fingerprint | D4:C1:AD:4A:76:BF:2C:60:E2:73:23:AE:38:08:53:27:0D:2E:58:83:74:75:49:70:08:31:25:28:CF:EC:66:B4 |
| iOS bundle ID | com.ludmil.kudyaclient |
| App Store URL | (add once live) |

## Products

- **Login Kit** (required)

## Login Kit redirect URIs

Because **Web** is enabled, TikTok requires a **saved** web redirect URI (typing alone is not enough — click **Add a URI**).

| Platform | Redirect URI |
|----------|----------------|
| Web | `https://sd-kudya.vercel.app/oauth` |
| Customer Android / iOS | `kudya://oauth` |
| Parceiro Android / iOS | `kudyaparceiro://oauth` |

**Web/Desktop URL** must match the redirect domain:

- Use `https://sd-kudya.vercel.app` — **do not use `kudya.online`** (DNS currently fails)

### Error: "App must have web redirect uri or trusted domain"

Fix (pick one):

1. **Add web redirect** — Login Kit → **Web** tab → enter `https://sd-kudya.vercel.app/oauth` → **Add a URI** → **Save**
2. **Verify domain** — top bar **URL properties** → add/verify `sd-kudya.vercel.app` (DNS or file verification)
3. **Mobile-only** — if you only use the app (not a website), uncheck **Web** and **Desktop** under Platforms; then only `kudya://oauth` on Android/iOS tabs is required (matches `socialAuth.ts`)

## Scopes

Request only what the app uses:

- **user.info.basic** — required for TikTok login

Do **not** request `user.info.stats` unless you add a feature that uses follower/video counts. The current app code only requests `user.info.basic`.

## App review — Review Description (paste into portal)

**Purpose of TikTok integration**

Kudya uses TikTok Login Kit exclusively for user authentication: log in and sign up. On the Login and Sign Up screens, users can tap "Continue with TikTok" as an alternative to email/password, Google, or Facebook. TikTok is not used for any other feature (no posting, no video access, no analytics).

**What the app does**

Kudya is a food delivery and online shopping platform for Southern Africa (iOS, Android, and web at https://sd-kudya.vercel.app). After signing up or logging in—including via TikTok—users browse restaurants and stores, place orders, and track deliveries.

**Login and sign-up flow with TikTok**

1. New or returning user opens the Kudya Login or Sign Up screen.
2. User taps **Continue with TikTok**.
3. TikTok authorization screen opens; user approves access.
4. Redirect: `kudya://oauth` (mobile) or `https://sd-kudya.vercel.app/oauth` (web).
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

- Terms of Service: https://sd-kudya.vercel.app/TermsOfService
- Privacy Policy: https://sd-kudya.vercel.app/PrivacyPolicy
- Website: https://sd-kudya.vercel.app

## Fix for previous / current rejection blockers

1. **Invalid / unreachable website** — `kudya.online` DNS does not resolve. Use `https://sd-kudya.vercel.app` everywhere in the TikTok portal.
2. **Terms / Privacy** — must be `…/TermsOfService` and `…/PrivacyPolicy` on that site (both return 200).
3. **Review description** — paste the full section above.
4. **Demo video** — upload MP4 of Continue with TikTok → authorize → Kudya home.
5. **Scopes** — only `user.info.basic`.

## Exact rejection (2026 — Review comments)

> The demo video should show the complete end-to-end flow of the integrations with TikTok (Please demonstrate with sandbox or provide a mockup demo). All selected products and scopes must be clearly demonstrated in the video. If you don't need certain products or scopes, make sure to remove them before review. You are required to use sandbox to demonstrate the integration. Demo video does not provide enough clarity and context as to show the website functions.

## Still required manually in TikTok portal

1. App is in **Draft** — finish URL property verification for `sd-kudya.vercel.app` (DNS TXT or signature file under **URL properties**). Until verified, Terms/Privacy show “This URL is not verified.”
2. Confirm platforms: **Android + iOS** (leave Web/Desktop unchecked unless you will demo the website in the video). Add bundle ID `com.ludmil.kudyaclient`, App Store URL/region as required.
3. Login Kit → Android + iOS redirect URI: `kudya://oauth` (and `kudyaparceiro://oauth` for the partner app).
4. Switch to **Sandbox**, record demo: open Kudya → Continue with TikTok → authorize → return to Home. Upload MP4.
5. Paste review description from this file → **Save** → **Submit for review**.
6. Details: `docs/AUTH_REJECTION_FIX_NOTES.md` + `docs/AUTHENTICATION_RELEASE_REPORT.md`.