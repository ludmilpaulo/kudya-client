import * as Localization from 'expo-localization';
import translations, { SupportedLocale, TranslationKey, supportedLocales } from './translations';

// Detect language
const locales = Localization.getLocales();
let languageCode: SupportedLocale = 'en';

if (
  Array.isArray(locales) &&
  locales.length > 0 &&
  typeof locales[0].languageCode === 'string' &&
  supportedLocales.includes(locales[0].languageCode as SupportedLocale)
) {
  languageCode = locales[0].languageCode as SupportedLocale;
}

export function t(key: TranslationKey): string {
  return translations[languageCode][key] || translations['en'][key] || key;
}
