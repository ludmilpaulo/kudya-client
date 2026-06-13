import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { LANGUAGE_STORAGE_KEY, supportedLocales, type SupportedLocale } from '../configs/i18n';
import { useLanguage } from '../contexts/LanguageContext';
import { selectUser } from '../redux/slices/authSlice';

/** Applies account preferred language when the user has not chosen one manually. */
export default function LanguageAuthSync() {
  const user = useSelector(selectUser);
  const { setLanguage } = useLanguage();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored || cancelled) return;

      const pref = user?.preferred_language;
      if (pref && supportedLocales.includes(pref as SupportedLocale)) {
        await setLanguage(pref as SupportedLocale);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setLanguage, user?.preferred_language]);

  return null;
}
