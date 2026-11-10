import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as AppleAuthentication from 'expo-apple-authentication';
import { baseAPI } from './types';
import { normalizeAuthResponse, AuthSessionPayload } from './authTypes';

export type SocialAuthResult = AuthSessionPayload;

WebBrowser.maybeCompleteAuthSession();

export type SocialProvider = 'google' | 'facebook' | 'instagram' | 'tiktok' | 'apple';

/** OAuth redirect — localhost on web (Cursor browser), kudya:// on native. */
export const OAUTH_REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: 'kudya',
  path: 'oauth',
  preferLocalhost: Platform.OS === 'web',
});

const GOOGLE_IOS = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';
const GOOGLE_ANDROID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '';
const GOOGLE_WEB = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
const FACEBOOK_APP_ID = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID ?? '';
const INSTAGRAM_APP_ID = process.env.EXPO_PUBLIC_INSTAGRAM_APP_ID ?? '';
const TIKTOK_CLIENT_KEY = process.env.EXPO_PUBLIC_TIKTOK_CLIENT_KEY ?? '';

type SocialPublicConfig = {
  google_web_client_id?: string;
  facebook_app_id?: string;
  tiktok_client_key?: string;
  instagram_app_id?: string;
  instagram_redirect_uri?: string;
  tiktok_redirect_uri?: string;
};

let runtimeConfig: SocialPublicConfig = {};
let configPromise: Promise<SocialPublicConfig> | null = null;

export async function loadSocialPublicConfig(): Promise<SocialPublicConfig> {
  if (configPromise) return configPromise;
  configPromise = (async () => {
    try {
      const response = await fetch(`${baseAPI}/api/auth/social/config/`, {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) return runtimeConfig;
      const data = (await response.json()) as SocialPublicConfig;
      runtimeConfig = data;
      return data;
    } catch {
      return runtimeConfig;
    }
  })();
  return configPromise;
}

export type SocialTokenPayload = {
  access_token?: string;
  id_token?: string;
  code?: string;
  redirect_uri?: string;
  code_verifier?: string;
  first_name?: string;
  last_name?: string;
};

export async function exchangeSocialToken(
  provider: SocialProvider,
  tokens: SocialTokenPayload,
): Promise<SocialAuthResult> {
  const response = await fetch(`${baseAPI}/api/auth/social/`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider,
      access_token: tokens.access_token ?? '',
      id_token: tokens.id_token ?? '',
      code: tokens.code ?? '',
      redirect_uri: tokens.redirect_uri ?? '',
      code_verifier: tokens.code_verifier ?? '',
      first_name: tokens.first_name ?? '',
      last_name: tokens.last_name ?? '',
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || data.message || 'Social login failed.');
  }
  return normalizeAuthResponse(data);
}

function googleClientIdForPlatform(): string {
  if (Platform.OS === 'ios') return GOOGLE_IOS;
  if (Platform.OS === 'android') return GOOGLE_ANDROID;
  return GOOGLE_WEB || runtimeConfig.google_web_client_id || '';
}

// expo-auth-session throws during render when the platform client id is missing; the Google
// button stays disabled via isSocialLoginConfigured, so a placeholder only keeps the screen alive.
const GOOGLE_UNCONFIGURED_CLIENT_ID = 'google-client-id-not-configured';

// Native Google/Facebook clients only accept their provider-default redirects
// (`<applicationId>:/oauthredirect`, `fb<APP_ID>://authorize`); kudya://oauth is rejected.
const providerRedirect = Platform.OS === 'web' ? { redirectUri: OAUTH_REDIRECT_URI } : {};

/** Google sign-in (use from component with useGoogleAuth hook). */
export function useGoogleAuth() {
  return Google.useAuthRequest({
    iosClientId: GOOGLE_IOS,
    androidClientId: GOOGLE_ANDROID,
    webClientId: GOOGLE_WEB || runtimeConfig.google_web_client_id || GOOGLE_UNCONFIGURED_CLIENT_ID,
    ...providerRedirect,
  });
}

/** Facebook sign-in. */
export function useFacebookAuth() {
  return Facebook.useAuthRequest({
    clientId: FACEBOOK_APP_ID || runtimeConfig.facebook_app_id || '',
    ...providerRedirect,
    scopes: ['public_profile', 'email'],
    responseType: AuthSession.ResponseType.Token,
  });
}

const INSTAGRAM_AUTHORIZE_ENDPOINT = 'https://www.instagram.com/oauth/authorize';
/** Must match a key in the backend OAUTH_BOUNCE_TARGETS (state prefix picks the app). */
const OAUTH_BOUNCE_TARGET = 'kudya';

function instagramAppId(): string {
  return INSTAGRAM_APP_ID || runtimeConfig.instagram_app_id || '';
}

type BounceAuthOptions = {
  clientId: string;
  redirectUri: string;
  scopes: string[];
  authorizationEndpoint: string;
  extraParams?: Record<string, string>;
};

/**
 * Instagram and TikTok only redirect to HTTPS, so they land on the API bounce which forwards
 * code + state to kudya://oauth; the API then exchanges the code with the app secret.
 */
async function authorizeViaBounce(label: string, options: BounceAuthOptions): Promise<string> {
  const { clientId, redirectUri, scopes, authorizationEndpoint, extraParams } = options;
  const nonce = new AuthSession.AuthRequest({ clientId, redirectUri }).state;
  const authRequest = new AuthSession.AuthRequest({
    clientId,
    redirectUri,
    scopes,
    responseType: AuthSession.ResponseType.Code,
    usePKCE: false,
    state: `${OAUTH_BOUNCE_TARGET}.${nonce}`,
    extraParams,
  });
  const authUrl = await authRequest.makeAuthUrlAsync({ authorizationEndpoint });
  const browserResult = await WebBrowser.openAuthSessionAsync(authUrl, OAUTH_REDIRECT_URI);
  if (browserResult.type !== 'success') {
    throw new Error(`${label} sign-in cancelled.`);
  }
  const result = authRequest.parseReturnUrl(browserResult.url);
  if (result.type !== 'success' || !result.params.code) {
    if ('params' in result && result.params.error === 'access_denied') {
      throw new Error(`${label} sign-in cancelled.`);
    }
    throw new Error(`We could not sign you in with ${label}. Please try again.`);
  }
  return result.params.code;
}

export async function signInWithInstagram(): Promise<SocialAuthResult> {
  const config = await loadSocialPublicConfig();
  const clientId = instagramAppId();
  const redirectUri = config.instagram_redirect_uri || '';
  if (!clientId || !redirectUri) {
    throw new Error('Instagram sign-in is not configured yet.');
  }
  const code = await authorizeViaBounce('Instagram', {
    clientId,
    redirectUri,
    scopes: ['instagram_business_basic'],
    authorizationEndpoint: INSTAGRAM_AUTHORIZE_ENDPOINT,
  });
  return exchangeSocialToken('instagram', { code, redirect_uri: redirectUri });
}

const TIKTOK_AUTHORIZE_ENDPOINT = 'https://www.tiktok.com/v2/auth/authorize/';

/** TikTok web Login Kit: no PKCE (its challenge format is non-standard); the API holds the secret. */
export async function signInWithTikTok(): Promise<SocialAuthResult> {
  const config = await loadSocialPublicConfig();
  const tiktokKey = TIKTOK_CLIENT_KEY || config.tiktok_client_key || '';
  const redirectUri = config.tiktok_redirect_uri || '';
  if (!tiktokKey || !redirectUri) {
    throw new Error('TikTok sign-in is not configured yet.');
  }
  const code = await authorizeViaBounce('TikTok', {
    clientId: tiktokKey,
    redirectUri,
    scopes: ['user.info.basic'],
    authorizationEndpoint: TIKTOK_AUTHORIZE_ENDPOINT,
    extraParams: { client_key: tiktokKey },
  });
  try {
    return await exchangeSocialToken('tiktok', { code, redirect_uri: redirectUri });
  } catch (err: unknown) {
    if (err instanceof Error && /cancel/i.test(err.message)) throw err;
    throw new Error('We could not sign you in with TikTok. Please try again.');
  }
}

export async function signInWithApple(): Promise<SocialAuthResult> {
  if (Platform.OS !== 'ios') {
    throw new Error('Sign in with Apple is available on iOS only.');
  }
  const available = await AppleAuthentication.isAvailableAsync();
  if (!available) {
    throw new Error('Sign in with Apple is not available on this device.');
  }
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    if (!credential.identityToken) {
      throw new Error('We could not sign you in with Apple. Please try again.');
    }
    return exchangeSocialToken('apple', {
      id_token: credential.identityToken,
      first_name: credential.fullName?.givenName ?? '',
      last_name: credential.fullName?.familyName ?? '',
    });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code?: string }).code === 'ERR_REQUEST_CANCELED'
    ) {
      throw new Error('Apple sign-in cancelled.');
    }
    // Never surface raw native/OAuth strings to reviewers or users.
    throw new Error('We could not sign you in with Apple. Please try again.');
  }
}

export async function completeGoogleAuth(
  authentication: { accessToken?: string | null; idToken?: string | null } | null,
): Promise<SocialAuthResult> {
  if (!authentication?.accessToken && !authentication?.idToken) {
    throw new Error('Google sign-in cancelled.');
  }
  return exchangeSocialToken('google', {
    access_token: authentication.accessToken ?? undefined,
    id_token: authentication.idToken ?? undefined,
  });
}

export async function completeFacebookAuth(
  authentication: { accessToken?: string | null } | null,
): Promise<SocialAuthResult> {
  if (!authentication?.accessToken) {
    throw new Error('Facebook sign-in cancelled.');
  }
  return exchangeSocialToken('facebook', { access_token: authentication.accessToken });
}

export function isSocialLoginConfigured(provider: SocialProvider): boolean {
  switch (provider) {
    case 'apple':
      return Platform.OS === 'ios';
    case 'google':
      return !!googleClientIdForPlatform();
    case 'facebook':
      // Native builds need the fb<APP_ID> scheme baked in by app.config.ts at build time.
      return Platform.OS === 'web'
        ? !!(FACEBOOK_APP_ID || runtimeConfig.facebook_app_id)
        : !!FACEBOOK_APP_ID;
    // Both finish through the API bounce into the app scheme, which a web page cannot receive.
    case 'instagram':
      return Platform.OS !== 'web' && !!instagramAppId();
    case 'tiktok':
      return Platform.OS !== 'web' && !!(TIKTOK_CLIENT_KEY || runtimeConfig.tiktok_client_key);
    default:
      return false;
  }
}

export function getSocialLoginSetupHint(provider: SocialProvider): string {
  switch (provider) {
    case 'apple':
      return 'Sign in with Apple requires an iOS device with Apple ID configured.';
    case 'google':
      if (Platform.OS === 'ios' && !GOOGLE_IOS) {
        return 'Set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID in .env';
      }
      if (Platform.OS === 'android' && !GOOGLE_ANDROID) {
        return 'Set EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID in .env';
      }
      return 'Set EXPO_PUBLIC_GOOGLE_*_CLIENT_ID in .env (see SOCIAL_LOGIN_SETUP.md)';
    case 'facebook':
      return 'Set EXPO_PUBLIC_FACEBOOK_APP_ID and add kudya://oauth in Meta app settings';
    case 'tiktok':
      return 'Set EXPO_PUBLIC_TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET on the API';
    case 'instagram':
      return 'Set INSTAGRAM_APP_ID/INSTAGRAM_APP_SECRET on the API and register INSTAGRAM_REDIRECT_URI in Meta (Instagram Login)';
    default:
      return 'OAuth keys missing in app config';
  }
}

if (typeof __DEV__ !== 'undefined' && __DEV__) {
  console.log('[Kudya OAuth] redirect URI:', OAUTH_REDIRECT_URI);
}
