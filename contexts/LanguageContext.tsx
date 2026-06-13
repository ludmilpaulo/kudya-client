import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  LANGUAGE_STORAGE_KEY,
  SupportedLocale,
  detectDeviceLanguage,
  getLanguage,
  setLanguage as applyLanguage,
  supportedLocales,
} from '../configs/i18n';

async function readPreferredLanguageFromAuth(): Promise<SupportedLocale | null> {
  try {
    const raw = await AsyncStorage.getItem('persist:root');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { auth?: string };
    const auth = parsed.auth ? (JSON.parse(parsed.auth) as { user?: { preferred_language?: string } }) : null;
    const pref = auth?.user?.preferred_language;
    if (pref && supportedLocales.includes(pref as SupportedLocale)) {
      return pref as SupportedLocale;
    }
  } catch {
    // ignore
  }
  return null;
}

type LanguageContextValue = {
  languageCode: SupportedLocale;
  setLanguage: (code: SupportedLocale) => Promise<void>;
  isReady: boolean;
  supportedLocales: readonly SupportedLocale[];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children?: React.ReactNode }) {
  const [languageCode, setLanguageCode] = useState<SupportedLocale>(getLanguage());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        let next: SupportedLocale;
        if (stored && supportedLocales.includes(stored as SupportedLocale)) {
          next = stored as SupportedLocale;
        } else {
          const fromAccount = await readPreferredLanguageFromAuth();
          next = fromAccount ?? detectDeviceLanguage();
        }
        if (!cancelled) {
          applyLanguage(next);
          setLanguageCode(next);
        }
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback(async (code: SupportedLocale) => {
    applyLanguage(code);
    setLanguageCode(code);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, code);
  }, []);

  const value = useMemo(
    () => ({ languageCode, setLanguage, isReady, supportedLocales }),
    [languageCode, setLanguage, isReady],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
