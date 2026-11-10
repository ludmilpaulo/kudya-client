const env: Record<string, string> = {};

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(),
}));

jest.mock('expo-auth-session', () => {
  class AuthRequest {
    state: string;
    redirectUri: string;
    constructor(config: { state?: string; redirectUri: string }) {
      this.state = config.state ?? 'nonce123';
      this.redirectUri = config.redirectUri;
    }
    async makeAuthUrlAsync(discovery: { authorizationEndpoint: string }) {
      return `${discovery.authorizationEndpoint}?state=${encodeURIComponent(this.state)}`;
    }
    parseReturnUrl(url: string) {
      const params = Object.fromEntries(new URL(url).searchParams);
      const type = params.state === this.state && !params.error ? 'success' : 'error';
      return { type, params };
    }
  }
  return {
    makeRedirectUri: jest.fn(() => 'kudya://oauth'),
    ResponseType: { Code: 'code', Token: 'token' },
    AuthRequest,
  };
});

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
   
  return require('../../services/socialAuth') as typeof import('../../services/socialAuth');
}

function setPlatform(os: string) {
   
  const { Platform } = require('react-native') as { Platform: { OS: string } };
  Platform.OS = os;
}

const BOUNCE = 'https://api.example/api/auth/social/instagram/callback/';

describe('isSocialLoginConfigured', () => {
  beforeEach(() => {
    Object.keys(env).forEach((k) => {
      delete env[k];
      delete process.env[k];
    });
    setPlatform('android');
  });

  it('detects facebook when app id is set', () => {
    env.EXPO_PUBLIC_FACEBOOK_APP_ID = '557245288279218';
    const { isSocialLoginConfigured } = loadSocialAuth();
    expect(isSocialLoginConfigured('facebook')).toBe(true);
  });

  it('requires platform-specific google client id', () => {
    env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID = 'ios.apps.googleusercontent.com';
    setPlatform('android');
    const { isSocialLoginConfigured } = loadSocialAuth();
    expect(isSocialLoginConfigured('google')).toBe(false);

    env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID = 'android.apps.googleusercontent.com';
    const mod = loadSocialAuth();
    expect(mod.isSocialLoginConfigured('google')).toBe(true);
  });

  it('passes a defined web client id when Google is not configured', () => {
    setPlatform('web');
    const { useGoogleAuth } = loadSocialAuth();
    const google = require('expo-auth-session/providers/google') as {
      useAuthRequest: jest.Mock;
    };
    useGoogleAuth();
    const config = google.useAuthRequest.mock.calls.at(-1)?.[0] as { webClientId?: string };
    expect(config.webClientId).toBeTruthy();
  });

  it('keeps the provider-default redirect for Google and Facebook on native', () => {
    setPlatform('android');
    const { useGoogleAuth, useFacebookAuth } = loadSocialAuth();
    const google = require('expo-auth-session/providers/google') as { useAuthRequest: jest.Mock };
    const facebook = require('expo-auth-session/providers/facebook') as {
      useAuthRequest: jest.Mock;
    };
    useGoogleAuth();
    useFacebookAuth();
    expect(google.useAuthRequest.mock.calls.at(-1)?.[0]).not.toHaveProperty('redirectUri');
    expect(facebook.useAuthRequest.mock.calls.at(-1)?.[0]).not.toHaveProperty('redirectUri');
  });

  it('detects tiktok client key', () => {
    env.EXPO_PUBLIC_TIKTOK_CLIENT_KEY = 'awtest';
    const { isSocialLoginConfigured } = loadSocialAuth();
    expect(isSocialLoginConfigured('tiktok')).toBe(true);
  });

  it('hides instagram on web', () => {
    env.EXPO_PUBLIC_INSTAGRAM_APP_ID = 'ig-app';
    const { isSocialLoginConfigured } = loadSocialAuth();
    expect(isSocialLoginConfigured('instagram')).toBe(true);
    setPlatform('web');
    expect(isSocialLoginConfigured('instagram')).toBe(false);
  });
});

describe('signInWithInstagram', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    Object.keys(env).forEach((k) => {
      delete env[k];
      delete process.env[k];
    });
    setPlatform('android');
    fetchMock.mockReset();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  function mockConfigThenLogin() {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ instagram_app_id: 'ig-app', instagram_redirect_uri: BOUNCE }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access: 'jwt', token: 'jwt', user_id: 1, username: 'ada' }),
      });
  }

  it('sends only the code and bounce redirect to the API', async () => {
    mockConfigThenLogin();
    const { signInWithInstagram } = loadSocialAuth();
    const browser = require('expo-web-browser') as { openAuthSessionAsync: jest.Mock };
    browser.openAuthSessionAsync.mockImplementation(async (url: string, returnUrl: string) => {
      expect(url).toContain('https://www.instagram.com/oauth/authorize');
      expect(returnUrl).toBe('kudya://oauth');
      const state = new URL(url).searchParams.get('state') ?? '';
      expect(state.startsWith('kudya.')).toBe(true);
      return { type: 'success', url: `kudya://oauth?code=ig-code&state=${state}` };
    });

    await signInWithInstagram();

    const [, init] = fetchMock.mock.calls[1] as [string, { body: string }];
    const body = JSON.parse(init.body) as Record<string, string>;
    expect(body.provider).toBe('instagram');
    expect(body.code).toBe('ig-code');
    expect(body.redirect_uri).toBe(BOUNCE);
    expect(body.access_token).toBe('');
  });

  it('rejects a mismatched state', async () => {
    mockConfigThenLogin();
    const { signInWithInstagram } = loadSocialAuth();
    const browser = require('expo-web-browser') as { openAuthSessionAsync: jest.Mock };
    browser.openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'kudya://oauth?code=ig-code&state=kudya.forged',
    });
    await expect(signInWithInstagram()).rejects.toThrow(/could not sign you in/i);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('signInWithTikTok', () => {
  const fetchMock = jest.fn();
  const TIKTOK_BOUNCE = 'https://api.example/api/auth/social/tiktok/callback/';

  beforeEach(() => {
    Object.keys(env).forEach((k) => {
      delete env[k];
      delete process.env[k];
    });
    setPlatform('android');
    fetchMock.mockReset();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  it('returns through the HTTPS bounce and sends no PKCE verifier', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tiktok_client_key: 'tt-key', tiktok_redirect_uri: TIKTOK_BOUNCE }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access: 'jwt', token: 'jwt', user_id: 1, username: 'ada' }),
      });
    const { signInWithTikTok } = loadSocialAuth();
    const browser = require('expo-web-browser') as { openAuthSessionAsync: jest.Mock };
    browser.openAuthSessionAsync.mockImplementation(async (url: string, returnUrl: string) => {
      expect(url).toContain('https://www.tiktok.com/v2/auth/authorize/');
      expect(returnUrl).toBe('kudya://oauth');
      const state = new URL(url).searchParams.get('state') ?? '';
      return { type: 'success', url: `kudya://oauth?code=tt-code&state=${state}` };
    });

    await signInWithTikTok();

    const [, init] = fetchMock.mock.calls[1] as [string, { body: string }];
    const body = JSON.parse(init.body) as Record<string, string>;
    expect(body.provider).toBe('tiktok');
    expect(body.code).toBe('tt-code');
    expect(body.redirect_uri).toBe(TIKTOK_BOUNCE);
    expect(body.code_verifier).toBe('');
  });

  it('is not configured without the bounce redirect', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tiktok_client_key: 'tt-key' }),
    });
    const { signInWithTikTok } = loadSocialAuth();
    await expect(signInWithTikTok()).rejects.toThrow(/not configured/i);
  });
});
