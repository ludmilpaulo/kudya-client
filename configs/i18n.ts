import * as Localization from 'expo-localization';
import translations, { supportedLocales } from './translations';
import type { SupportedLocale, TranslationKey } from './translations';

export { supportedLocales };
export type { SupportedLocale, TranslationKey };
export { default as translations } from './translations';

export const LANGUAGE_STORAGE_KEY = '@kudya/language';

const FALLBACK_LOCALE: SupportedLocale = 'en';

let languageCode: SupportedLocale = detectDeviceLanguage();

export function detectDeviceLanguage(): SupportedLocale {
  const locales = Localization.getLocales();
  const code = locales?.[0]?.languageCode;
  if (code && supportedLocales.includes(code as SupportedLocale)) {
    return code as SupportedLocale;
  }
  return FALLBACK_LOCALE;
}

export function getLanguage(): SupportedLocale {
  return languageCode;
}

export function setLanguage(code: SupportedLocale): void {
  if (supportedLocales.includes(code)) {
    languageCode = code;
  }
}

export function t(key: TranslationKey, locale?: SupportedLocale): string {
  const lang = locale ?? languageCode;
  const table = translations[lang] as Record<string, string>;
  const en = translations.en as Record<string, string>;
  return table?.[key] ?? en?.[key] ?? key;
}

export const localeLabels: Record<SupportedLocale, string> = {
  en: 'English',
  pt: 'Português',
  fr: 'Français',
  es: 'Español',
};
