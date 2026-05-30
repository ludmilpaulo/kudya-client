import axios from "axios";
import * as Localization from 'expo-localization';
import { baseAPI } from "./types";

 //export const baseAPI = "http://192.168.100.230:8000";

 //export const baseAPI : string = "http://192.168.1.105:8000";

export const getDeviceLanguage = (): string => {
  const locales = Localization.getLocales();
  if (Array.isArray(locales) && locales.length > 0 && typeof locales[0].languageCode === 'string') {
    return locales[0].languageCode; // "en", "pt", etc.
  }
  return 'en'; // Fallback
};

const API = axios.create({
  baseURL: baseAPI,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

async function readPersistedAuth(): Promise<{ token?: string; refreshToken?: string } | null> {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const persistedState = await AsyncStorage.getItem('persist:root');
    if (!persistedState) return null;
    const parsed = JSON.parse(persistedState);
    return parsed.auth ? JSON.parse(parsed.auth) : null;
  } catch {
    return null;
  }
}

async function writePersistedAuthToken(access: string) {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const persistedState = await AsyncStorage.getItem('persist:root');
    if (!persistedState) return;
    const parsed = JSON.parse(persistedState);
    const auth = parsed.auth ? JSON.parse(parsed.auth) : {};
    auth.token = access;
    if (auth.user) auth.user.token = access;
    parsed.auth = JSON.stringify(auth);
    await AsyncStorage.setItem('persist:root', JSON.stringify(parsed));
  } catch {
    // ignore
  }
}

API.interceptors.request.use(async (config) => {
  const url = (config.baseURL ?? "") + (config.url ?? "");
  console.log("[API] Requesting:", url);
  config.headers['Accept-Language'] = getDeviceLanguage();

  const auth = await readPersistedAuth();
  if (auth?.token) {
    config.headers['Authorization'] = `Bearer ${auth.token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (!original || original._retry || error.response?.status !== 401) {
      return Promise.reject(error);
    }
    const auth = await readPersistedAuth();
    if (!auth?.refreshToken) {
      return Promise.reject(error);
    }
    try {
      const { refreshAccessToken } = await import('./authService');
      const refreshed = await refreshAccessToken(auth.refreshToken);
      await writePersistedAuthToken(refreshed.access);
      original._retry = true;
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${refreshed.access}`;
      return API(original);
    } catch {
      return Promise.reject(error);
    }
  },
);

export default API;
