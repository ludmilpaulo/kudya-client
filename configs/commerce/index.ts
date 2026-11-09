import checkout from './checkout';
import food from './food';
import grocery from './grocery';
import orders from './orders';
import type { CommerceDictionary, CommerceLocale } from './types';

const dictionaries: CommerceDictionary[] = [checkout, food, grocery, orders];

export function commerceT(locale: string, key: string): string | undefined {
  const lang = (['en', 'pt', 'fr', 'es'].includes(locale) ? locale : 'en') as CommerceLocale;
  for (const dictionary of dictionaries) {
    const localized = dictionary[lang]?.[key];
    if (localized) return localized;
  }
  for (const dictionary of dictionaries) {
    const english = dictionary.en[key];
    if (english) return english;
  }
  return undefined;
}
