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

API.interceptors.request.use((config) => {
  const url = (config.baseURL ?? "") + (config.url ?? "");
  console.log("[API] Requesting:", url);
  config.headers['Accept-Language'] = getDeviceLanguage();
  return config;
});

export default API;
