// i18n.ts
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

// Translation dictionaries
const translations = {
  en: {
    selectStore: 'Select a Store Type',
    browse: 'Search or browse categories',
    search: 'Search...',
    loading: 'Loading store types...',
  },
  pt: {
    selectStore: 'Selecione um Tipo de Loja',
    browse: 'Pesquise ou navegue por categorias',
    search: 'Procurar...',
    loading: 'Carregando tipos de lojas...',
  },
};

const i18n = new I18n(translations);
i18n.enableFallback = true;

// ✅ FIX: safely extract system language code
const fallbackLocale = 'en';
const locale = Localization.getLocales?.()[0]?.languageCode || fallbackLocale;

// ✅ Guard against undefined on Hermes
i18n.locale = typeof locale === 'string' ? locale : fallbackLocale;

export default i18n;
