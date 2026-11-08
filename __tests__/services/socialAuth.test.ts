const env: Record<string, string> = {};

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn(() => 'kudya://oauth'),
  ResponseType: { Code: 'code', Token: 'token' },
  AuthRequest: jest.fn(),
}));

jest.mock('expo-auth-session/providers/google', () => ({
  useAuthRequest: jest.fn(() => [null, null, jest.fn()]),
}));

jest.mock('expo-auth-session/providers/facebook', () => ({
  useAuthRequest: jest.fn(() => [null, null, jest.fn()]),
}));

jest.mock('expo-apple-authentication', () => ({
  isAvailableAsync: jest.fn(async () => false),
  AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
  signInAsync: jest.fn(),
}));

function loadSocialAuth() {
  jest.resetModules();
  Object.assign(process.env, env);
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('../../services/socialAuth') as typeof import('../../services/socialAuth');
}

describe('isSocialLoginConfigured', () => {
  beforeEach(() => {
    Object.keys(env).forEach((k) => {
      delete env[k];
      delete process.env[k];
    });
    const { Platform } = require('react-native');
    Platform.OS = 'android';
  });

  it('detects facebook when app id is set', () => {
    env.EXPO_PUBLIC_FACEBOOK_APP_ID = '557245288279218';
    const { isSocialLoginConfigured } = loadSocialAuth();
    expect(isSocialLoginConfigured('facebook')).toBe(true);
  });

  it('requires platform-specific google client id', () => {
    env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID = 'ios.apps.googleusercontent.com';
    const { Platform } = require('react-native');
    Platform.OS = 'android';
    const { isSocialLoginConfigured } = loadSocialAuth();
    expect(isSocialLoginConfigured('google')).toBe(false);

    env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID = 'android.apps.googleusercontent.com';
    const mod = loadSocialAuth();
    expect(mod.isSocialLoginConfigured('google')).toBe(true);
  });

  it('passes a defined web client id when Google is not configured', () => {
    const { Platform } = require('react-native');
    Platform.OS = 'web';
    const { useGoogleAuth } = loadSocialAuth();
    const google = require('expo-auth-session/providers/google') as {
      useAuthRequest: jest.Mock;
    };
    useGoogleAuth();
    const config = google.useAuthRequest.mock.calls.at(-1)?.[0] as { webClientId?: string };
    expect(config.webClientId).toBeTruthy();
  });

  it('detects tiktok client key', () => {
    env.EXPO_PUBLIC_TIKTOK_CLIENT_KEY = 'awtest';
    const { isSocialLoginConfigured } = loadSocialAuth();
    expect(isSocialLoginConfigured('tiktok')).toBe(true);
  });
});
