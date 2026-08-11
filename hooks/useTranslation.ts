import translations, { TranslationKey } from '../configs/translations';
import { t as localT } from '../configs/i18n';
import { useLanguage } from '../contexts/LanguageContext';
import { useApiTranslations } from './useApiTranslations';
import { propertyApplicationTranslations } from "../configs/propertyApplicationTranslations";

export type TranslationParams = Record<string, string | number>;

function interpolate(text: string, params?: TranslationParams): string {
  if (!params) return text;
  return Object.entries(params).reduce(
    (acc, [name, value]) =>
      acc
        .replace(new RegExp(`\\{${name}\\}`, 'g'), String(value))
        .replace(new RegExp(`\\{\\{${name}\\}\\}`, 'g'), String(value)),
    text,
  );
}

export function useTranslation() {
  const { languageCode, setLanguage, isReady } = useLanguage();
  const apiTranslations = useApiTranslations(languageCode);

  function t(key: string, fallback?: string, params?: TranslationParams): string {
    const table = {
      ...translations[languageCode],
      ...propertyApplicationTranslations[languageCode],
    } as Record<string, string>;
    const en = {
      ...translations.en,
      ...propertyApplicationTranslations.en,
    } as Record<string, string>;
    const localValue = table[key] ?? (() => {
      const staticVal = localT(key as TranslationKey, languageCode);
      return staticVal !== key ? staticVal : undefined;
    })();
    const enValue = en[key];
    const apiValue = apiTranslations[key];

    let value: string | undefined;
    if (apiValue) {
      if (
        languageCode !== 'en' &&
        localValue &&
        enValue &&
        apiValue === enValue &&
        localValue !== enValue
      ) {
        value = localValue;
      } else {
        value = apiValue;
      }
    } else {
      value = localValue ?? enValue;
    }

    const resolved = value ?? fallback ?? key;
    return interpolate(resolved, params);
  }

  return { t, languageCode, setLanguage, isReady, apiTranslations };
}
