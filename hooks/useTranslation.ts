// hooks/useTranslation.ts
import * as Localization from 'expo-localization';
import translations, { SupportedLocale, TranslationKey, supportedLocales } from '../configs/translations';
import { useMemo } from 'react';

export function useTranslation() {
  const locales = Localization.getLocales();
  const languageCode: SupportedLocale =
    Array.isArray(locales) &&
    locales.length > 0 &&
    typeof locales[0].languageCode === 'string' &&
    supportedLocales.includes(locales[0].languageCode as SupportedLocale)
      ? (locales[0].languageCode as SupportedLocale)
      : 'en';

  function t(key: TranslationKey): string {
    return translations[languageCode][key] || translations['en'][key] || key;
  }
  // You could also return languageCode if you need to render language-specific stuff
  return { t, languageCode };
}
