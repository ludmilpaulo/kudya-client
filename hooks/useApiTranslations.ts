import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchApiTranslations } from '../services/platformApi';
import { SupportedLocale } from '../configs/translations';

const CACHE_KEY = 'kudya_api_translations';

export function useApiTranslations(languageCode: SupportedLocale) {
  const [apiTranslations, setApiTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cached = await AsyncStorage.getItem(`${CACHE_KEY}_${languageCode}`);
        if (cached && !cancelled) {
          setApiTranslations(JSON.parse(cached));
        }
        const fresh = await fetchApiTranslations(languageCode);
        if (!cancelled) {
          setApiTranslations(fresh);
          await AsyncStorage.setItem(`${CACHE_KEY}_${languageCode}`, JSON.stringify(fresh));
        }
      } catch {
        // Fallback to local translations only
      }
    })();
    return () => { cancelled = true; };
  }, [languageCode]);

  return apiTranslations;
}
