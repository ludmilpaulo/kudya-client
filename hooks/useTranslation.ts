// hooks/useTranslation.ts
import * as Localization from 'expo-localization';
import translations, { SupportedLocale, supportedLocales } from '../configs/translations';
import { useApiTranslations } from './useApiTranslations';

export function useTranslation() {
  const locales = Localization.getLocales();
  const languageCode: SupportedLocale =
    Array.isArray(locales) &&
    locales.length > 0 &&
    typeof locales[0].languageCode === 'string' &&
    supportedLocales.includes(locales[0].languageCode as SupportedLocale)
      ? (locales[0].languageCode as SupportedLocale)
      : 'en';

  const apiTranslations = useApiTranslations(languageCode);

  function t(key: string, fallback?: string): string {
    if (apiTranslations[key]) return apiTranslations[key];
    const table = translations[languageCode] as Record<string, string>;
    const en = translations['en'] as Record<string, string>;
    return table[key] ?? en[key] ?? fallback ?? key;
  }
  return { t, languageCode, apiTranslations };
}
