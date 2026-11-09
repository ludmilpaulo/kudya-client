export type CommerceLocale = 'en' | 'pt' | 'fr' | 'es';

/** English is the source of truth; other locales may omit keys and fall back to English. */
export type CommerceDictionary = {
  en: Record<string, string>;
  pt?: Record<string, string>;
  fr?: Record<string, string>;
  es?: Record<string, string>;
};
