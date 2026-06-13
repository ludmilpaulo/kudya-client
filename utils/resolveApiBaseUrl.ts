import Constants from 'expo-constants';
import { Platform } from 'react-native';

/** Deploy target once super-app API is live in production. */
export const PRODUCTION_API = 'https://kudya-api.onrender.com';

const DEV_API_PORT = process.env.EXPO_PUBLIC_API_PORT || '8000';

function getManifestLike(): Record<string, unknown> | undefined {
  return (
    Constants.expoConfig ??
    (Constants as { manifest2?: Record<string, unknown> }).manifest2 ??
    (Constants as { manifest?: Record<string, unknown> }).manifest
  ) as Record<string, unknown> | undefined;
}

function hostFromUri(value: string | undefined): string | null {
  if (!value || typeof value !== 'string') return null;
  const host = value.split(':')[0]?.trim();
  if (!host || host === 'localhost' || host === '127.0.0.1') return null;
  return host;
}

function getExpoDevHost(): string | null {
  const manifest = getManifestLike();
  const expoGo = (Constants as { expoGoConfig?: { debuggerHost?: string } }).expoGoConfig;
  const extra = manifest?.extra as { expoClient?: { hostUri?: string } } | undefined;

  const candidates = [
    Constants.expoConfig?.hostUri,
    expoGo?.debuggerHost,
    manifest?.debuggerHost as string | undefined,
    manifest?.hostUri as string | undefined,
    extra?.expoClient?.hostUri,
  ];

  for (const candidate of candidates) {
    const host = hostFromUri(candidate);
    if (host) return host;
  }
  return null;
}

function isLocalhostUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1/.test(url);
}

function isStaleProductionHost(url: string): boolean {
  return /pythonanywhere\.com|www\.kudya\.store/i.test(url);
}

function normalizePort(url: string): string {
  if (isLocalhostUrl(url) && url.includes(':8000')) {
    return url.replace(':8000', `:${DEV_API_PORT}`);
  }
  return url.replace(/\/$/, '');
}

function androidEmulatorHost(): string | null {
  if (Platform.OS === 'android' && !Constants.isDevice) {
    return `http://10.0.2.2:${DEV_API_PORT}`;
  }
  return null;
}

/**
 * Resolves the Kudya API base URL for kudya-client.
 * Physical devices cannot use localhost — Expo debugger host LAN IP is used instead.
 */
export function resolveApiBaseUrl(): string {
  const configured = (
    process.env.EXPO_PUBLIC_BASE_API ||
    process.env.NEXT_PUBLIC_BASE_API ||
    ''
  ).trim();

  if (configured && isStaleProductionHost(configured) && __DEV__) {
    const devHost = getExpoDevHost();
    if (devHost) return `http://${devHost}:${DEV_API_PORT}`;
    const emulator = androidEmulatorHost();
    if (emulator) return emulator;
    if (Platform.OS === 'web') return `http://localhost:${DEV_API_PORT}`;
    return `http://127.0.0.1:${DEV_API_PORT}`;
  }

  if (configured && !isLocalhostUrl(configured)) {
    return normalizePort(configured);
  }

  if (Platform.OS === 'web') {
    return configured
      ? normalizePort(configured)
      : `http://localhost:${DEV_API_PORT}`;
  }

  const devHost = getExpoDevHost();
  if (devHost) {
    return `http://${devHost}:${DEV_API_PORT}`;
  }

  const emulator = androidEmulatorHost();
  if (emulator) {
    return emulator;
  }

  if (configured && isLocalhostUrl(configured)) {
    if (__DEV__) {
      return `http://127.0.0.1:${DEV_API_PORT}`;
    }
  }

  if (process.env.EXPO_PUBLIC_USE_PRODUCTION_API === 'true') {
    return PRODUCTION_API;
  }

  return configured ? normalizePort(configured) : PRODUCTION_API;
}
