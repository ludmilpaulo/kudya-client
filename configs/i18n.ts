// i18n.ts
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

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

i18n.locale = Localization.locale;
i18n.enableFallback = true;

export default i18n;
