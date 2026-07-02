import translations, { TranslationKey } from '../configs/translations';
import { t as localT } from '../configs/i18n';
import { useLanguage } from '../contexts/LanguageContext';
import { useApiTranslations } from './useApiTranslations';

export type TranslationParams = Record<string, string | number>;

function interpolate(text: string, params?: TranslationParams): string {
  if (!params) return text;
  return Object.entries(params).reduce(
    (acc, [name, value]) => acc.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value)),
    text,
  );
}

export function useTranslation() {
  const { languageCode, setLanguage, isReady } = useLanguage();
  const apiTranslations = useApiTranslations(languageCode);

  function t(key: string, fallback?: string, params?: TranslationParams): string {
    let value: string | undefined;
    if (apiTranslations[key]) {
      value = apiTranslations[key];
    } else {
      const table = translations[languageCode] as Record<string, string>;
      const en = translations.en as Record<string, string>;
      value = table[key] ?? en[key];
      if (!value) {
        const staticVal = localT(key as TranslationKey, languageCode);
        if (staticVal !== key) value = staticVal;
      }
    }
    const resolved = value ?? fallback ?? key;
    return interpolate(resolved, params);
  }

  return { t, languageCode, setLanguage, isReady, apiTranslations };
}
