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

  it('detects tiktok client key', () => {
    env.EXPO_PUBLIC_TIKTOK_CLIENT_KEY = 'awtest';
    const { isSocialLoginConfigured } = loadSocialAuth();
    expect(isSocialLoginConfigured('tiktok')).toBe(true);
  });
});
