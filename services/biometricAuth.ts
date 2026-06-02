import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { refreshAccessToken } from './authService';
import { AuthSessionPayload } from './authTypes';

const BIOMETRIC_SESSION_KEY = 'kudya_biometric_session_v1';

export type StoredBiometricSession = {
  refresh: string;
  user_id: number;
  username: string;
  is_customer: boolean;
  is_driver: boolean;
};

export async function isBiometricHardwareAvailable(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && isEnrolled;
}

export async function getBiometricLabel(): Promise<string> {
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return 'Face ID';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return 'Fingerprint';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return 'Biometrics';
  }
  return 'Biometrics';
}

export async function hasBiometricSession(): Promise<boolean> {
  try {
    const raw = await SecureStore.getItemAsync(BIOMETRIC_SESSION_KEY);
    return !!raw;
  } catch {
    return false;
  }
}

export async function saveBiometricSession(session: StoredBiometricSession): Promise<void> {
  await SecureStore.setItemAsync(BIOMETRIC_SESSION_KEY, JSON.stringify(session));
}

export async function clearBiometricSession(): Promise<void> {
  await SecureStore.deleteItemAsync(BIOMETRIC_SESSION_KEY);
}

export function sessionFromAuthPayload(payload: AuthSessionPayload): StoredBiometricSession | null {
  if (!payload.refresh) return null;
  return {
    refresh: payload.refresh,
    user_id: payload.user_id,
    username: payload.username,
    is_customer: payload.is_customer,
    is_driver: payload.is_driver,
  };
}

export async function loginWithBiometrics(): Promise<AuthSessionPayload> {
  const available = await isBiometricHardwareAvailable();
  if (!available) {
    throw new Error('Biometric authentication is not available on this device.');
  }

  const authResult = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Sign in to Kudya',
    cancelLabel: 'Cancel',
    fallbackLabel: 'Use passcode',
    disableDeviceFallback: false,
  });

  if (!authResult.success) {
    throw new Error('Biometric sign-in cancelled.');
  }

  const raw = await SecureStore.getItemAsync(BIOMETRIC_SESSION_KEY);
  if (!raw) {
    throw new Error('No saved biometric session. Sign in with email or social first.');
  }

  const stored = JSON.parse(raw) as StoredBiometricSession;
  const refreshed = await refreshAccessToken(stored.refresh);

  return {
    access: refreshed.access,
    refresh: refreshed.refresh || stored.refresh,
    token: refreshed.token,
    auth_scheme: 'Bearer',
    user_id: stored.user_id,
    username: stored.username,
    is_customer: stored.is_customer,
    is_driver: stored.is_driver,
    message: 'Login com sucesso',
  };
}

export async function offerBiometricEnrollment(
  session: StoredBiometricSession,
  promptTitle: string,
): Promise<boolean> {
  const available = await isBiometricHardwareAvailable();
  if (!available) return false;

  const alreadySaved = await hasBiometricSession();
  if (alreadySaved) return false;

  const authResult = await LocalAuthentication.authenticateAsync({
    promptMessage: promptTitle,
    cancelLabel: 'Not now',
    fallbackLabel: 'Use passcode',
    disableDeviceFallback: false,
  });

  if (!authResult.success) return false;

  await saveBiometricSession(session);
  return true;
}
