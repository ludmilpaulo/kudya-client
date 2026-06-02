import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { baseAPI } from './types';
import { normalizeAuthResponse, AuthSessionPayload } from './authTypes';

export type SocialAuthResult = AuthSessionPayload;

WebBrowser.maybeCompleteAuthSession();

export type SocialProvider = 'google' | 'facebook' | 'instagram' | 'tiktok';

/** Native redirect for production / dev client builds. */
export const OAUTH_REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: 'kudya',
  path: 'oauth',
});

const GOOGLE_IOS = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';
const GOOGLE_ANDROID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '';
const GOOGLE_WEB = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
const FACEBOOK_APP_ID = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID ?? '';
const INSTAGRAM_APP_ID = process.env.EXPO_PUBLIC_INSTAGRAM_APP_ID ?? '';
const TIKTOK_CLIENT_KEY = process.env.EXPO_PUBLIC_TIKTOK_CLIENT_KEY ?? '';

export type SocialTokenPayload = {
  access_token?: string;
  id_token?: string;
  code?: string;
  redirect_uri?: string;
  code_verifier?: string;
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
  return GOOGLE_WEB;
}

/** Google sign-in (use from component with useGoogleAuth hook). */
export function useGoogleAuth() {
  return Google.useAuthRequest({
    iosClientId: GOOGLE_IOS,
    androidClientId: GOOGLE_ANDROID,
    webClientId: GOOGLE_WEB,
    redirectUri: OAUTH_REDIRECT_URI,
  });
}

/** Facebook sign-in. */
export function useFacebookAuth() {
  return Facebook.useAuthRequest({
    clientId: FACEBOOK_APP_ID,
    redirectUri: OAUTH_REDIRECT_URI,
    scopes: ['public_profile', 'email'],
    responseType: AuthSession.ResponseType.Token,
  });
}

const instagramDiscovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: 'https://api.instagram.com/oauth/authorize',
  tokenEndpoint: 'https://api.instagram.com/oauth/access_token',
};

export async function signInWithInstagram(): Promise<SocialAuthResult> {
  if (!INSTAGRAM_APP_ID) {
    throw new Error('Instagram app id not configured (EXPO_PUBLIC_INSTAGRAM_APP_ID).');
  }
  const authRequest = new AuthSession.AuthRequest({
    clientId: INSTAGRAM_APP_ID,
    redirectUri: OAUTH_REDIRECT_URI,
    scopes: ['instagram_basic'],
    responseType: AuthSession.ResponseType.Code,
    usePKCE: false,
  });
  const result = await authRequest.promptAsync(instagramDiscovery);
  if (result.type !== 'success' || !result.params.code) {
    throw new Error('Instagram sign-in cancelled.');
  }
  const tokenRes = await AuthSession.exchangeCodeAsync(
    {
      clientId: INSTAGRAM_APP_ID,
      code: result.params.code,
      redirectUri: OAUTH_REDIRECT_URI,
      extraParams: { grant_type: 'authorization_code' },
    },
    instagramDiscovery,
  );
  return exchangeSocialToken('instagram', { access_token: tokenRes.accessToken });
}

const tiktokAuthorizeEndpoint = 'https://www.tiktok.com/v2/auth/authorize/';

export async function signInWithTikTok(): Promise<SocialAuthResult> {
  if (!TIKTOK_CLIENT_KEY) {
    throw new Error('TikTok client key not configured (EXPO_PUBLIC_TIKTOK_CLIENT_KEY).');
  }
  const authRequest = new AuthSession.AuthRequest({
    clientId: TIKTOK_CLIENT_KEY,
    redirectUri: OAUTH_REDIRECT_URI,
    scopes: ['user.info.basic'],
    responseType: AuthSession.ResponseType.Code,
    usePKCE: true,
    extraParams: { client_key: TIKTOK_CLIENT_KEY },
  });
  const result = await authRequest.promptAsync({
    authorizationEndpoint: tiktokAuthorizeEndpoint,
  });
  if (result.type !== 'success' || !result.params.code) {
    throw new Error('TikTok sign-in cancelled.');
  }
  return exchangeSocialToken('tiktok', {
    code: result.params.code,
    redirect_uri: OAUTH_REDIRECT_URI,
    code_verifier: authRequest.codeVerifier ?? '',
  });
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
    case 'google':
      return !!googleClientIdForPlatform();
    case 'facebook':
      return !!FACEBOOK_APP_ID;
    case 'instagram':
      return !!INSTAGRAM_APP_ID;
    case 'tiktok':
      return !!TIKTOK_CLIENT_KEY;
    default:
      return false;
  }
}

export function getSocialLoginSetupHint(provider: SocialProvider): string {
  switch (provider) {
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
    default:
      return 'OAuth keys missing in app config';
  }
}

if (typeof __DEV__ !== 'undefined' && __DEV__) {
  console.log('[Kudya OAuth] redirect URI:', OAUTH_REDIRECT_URI);
}
