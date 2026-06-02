import translations, { TranslationKey } from '../configs/translations';
import { t as localT } from '../configs/i18n';
import { useLanguage } from '../contexts/LanguageContext';
import { useApiTranslations } from './useApiTranslations';

export function useTranslation() {
  const { languageCode, setLanguage, isReady } = useLanguage();
  const apiTranslations = useApiTranslations(languageCode);

  function t(key: string, fallback?: string): string {
    if (apiTranslations[key]) return apiTranslations[key];
    const table = translations[languageCode] as Record<string, string>;
    const en = translations.en as Record<string, string>;
    const fromLocal = table[key] ?? en[key];
    if (fromLocal) return fromLocal;
    const staticVal = localT(key as TranslationKey, languageCode);
    if (staticVal !== key) return staticVal;
    return fallback ?? key;
  }

  return { t, languageCode, setLanguage, isReady, apiTranslations };
}
