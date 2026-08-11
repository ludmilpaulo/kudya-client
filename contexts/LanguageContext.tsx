import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  LANGUAGE_CHOSEN_KEY,
  LANGUAGE_STORAGE_KEY,
  SupportedLocale,
  detectDeviceLanguage,
  getLanguage,
  setLanguage as applyLanguage,
  supportedLocales,
} from '../configs/i18n';
import { store } from '../redux/store';
import { languageApi } from '../redux/api/languageApi';

async function readHasChosenLanguage(): Promise<boolean> {
  const chosenFlag = await AsyncStorage.getItem(LANGUAGE_CHOSEN_KEY);
  if (chosenFlag === 'true') return true;

  const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  return !!stored && supportedLocales.includes(stored as SupportedLocale);
}

type LanguageContextValue = {
  languageCode: SupportedLocale;
  setLanguage: (code: SupportedLocale) => Promise<void>;
  chooseLanguage: (code: SupportedLocale) => Promise<void>;
  hasChosenLanguage: boolean;
  isReady: boolean;
  supportedLocales: readonly SupportedLocale[];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children?: React.ReactNode }) {
  const [languageCode, setLanguageCode] = useState<SupportedLocale>(getLanguage());
  const [hasChosenLanguage, setHasChosenLanguage] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [stored, chosen] = await Promise.all([
          AsyncStorage.getItem(LANGUAGE_STORAGE_KEY),
          readHasChosenLanguage(),
        ]);

        let next: SupportedLocale;
        let resolvedChosen = chosen;
        if (chosen && stored && supportedLocales.includes(stored as SupportedLocale)) {
          next = stored as SupportedLocale;
        } else {
          next = detectDeviceLanguage();
        }

        const token = store.getState().auth.token;
        if (token || resolvedChosen) {
          try {
            const pref = await store
              .dispatch(languageApi.endpoints.getLanguagePreference.initiate())
              .unwrap();
            if (
              pref.preferredLanguage &&
              supportedLocales.includes(pref.preferredLanguage as SupportedLocale)
            ) {
              next = pref.preferredLanguage as SupportedLocale;
              if (token && !resolvedChosen) {
                await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, next);
                await AsyncStorage.setItem(LANGUAGE_CHOSEN_KEY, 'true');
                resolvedChosen = true;
              }
            }
          } catch {
            // Use local/device language when backend is unavailable.
          }
        }

        if (!cancelled) {
          applyLanguage(next);
          setLanguageCode(next);
          setHasChosenLanguage(resolvedChosen);
        }
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistLanguage = useCallback(async (code: SupportedLocale, markChosen: boolean) => {
    applyLanguage(code);
    setLanguageCode(code);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    if (markChosen) {
      await AsyncStorage.setItem(LANGUAGE_CHOSEN_KEY, 'true');
      setHasChosenLanguage(true);
    }
    try {
      await store.dispatch(
        languageApi.endpoints.updateLanguagePreference.initiate({
          preferredLanguage: code,
          systemLanguage: detectDeviceLanguage(),
        }),
      );
    } catch {
      // Preference is still persisted locally.
    }
  }, []);

  const setLanguage = useCallback(
    async (code: SupportedLocale) => {
      await persistLanguage(code, true);
    },
    [persistLanguage],
  );

  const chooseLanguage = useCallback(
    async (code: SupportedLocale) => {
      await persistLanguage(code, true);
    },
    [persistLanguage],
  );

  const value = useMemo(
    () => ({
      languageCode,
      setLanguage,
      chooseLanguage,
      hasChosenLanguage,
      isReady,
      supportedLocales,
    }),
    [languageCode, setLanguage, chooseLanguage, hasChosenLanguage, isReady],
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
