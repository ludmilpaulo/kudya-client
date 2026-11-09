import type { CatalogProduct, StoreSummary } from '../commerce/api';
import { baseAPI } from '../../services/types';
import { formatMoney } from '../../utils/money';

export type FoodStore = StoreSummary;
export type FoodProduct = CatalogProduct;

export const DEFAULT_CURRENCY = 'ZAR';

export function storeCurrency(store?: FoodStore | null): string {
  return store?.currency || DEFAULT_CURRENCY;
}

export function productCurrency(product: FoodProduct, store?: FoodStore | null): string {
  return product.currency || storeCurrency(store);
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

/** Partner-entered descriptions may contain HTML; show them as plain text. */
export function plainText(raw: string | null | undefined): string {
  if (!raw) return '';
  return raw
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
      const lower = entity.toLowerCase();
      if (lower.startsWith('#x')) return String.fromCharCode(parseInt(lower.slice(2), 16) || 32);
      if (lower.startsWith('#')) return String.fromCharCode(parseInt(lower.slice(1), 10) || 32);
      return ENTITIES[lower] ?? match;
    })
    .replace(/[ \t\f\v]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function storeSupportsPickup(store?: FoodStore | null): boolean {
  return store?.supports_pickup === true;
}

export function storeDistanceLabel(store: Pick<FoodStore, 'distance_km'>): string | null {
  const km = store.distance_km;
  if (typeof km !== 'number' || !Number.isFinite(km)) return null;
  return km < 1 ? `${Math.max(50, Math.round((km * 1000) / 50) * 50)} m` : `${km.toFixed(1)} km`;
}

export function toNumber(value: string | number | null | undefined): number {
  const parsed = typeof value === 'string' ? Number(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : 0;
}

export function absoluteUrl(raw?: string | null): string | null {
  if (!raw) return null;
  if (/^(https?:|data:|blob:|file:)/.test(raw)) return raw;
  return `${baseAPI.replace(/\/$/, '')}${raw.startsWith('/') ? '' : '/'}${raw}`;
}

function firstImage(value: unknown): string | null {
  if (typeof value === 'string') return value || null;
  if (Array.isArray(value)) {
    for (const entry of value) {
      const url = firstImage(entry);
      if (url) return url;
    }
    return null;
  }
  if (value && typeof value === 'object') {
    const record = value as { image?: unknown; url?: unknown };
    return firstImage(record.image) ?? firstImage(record.url);
  }
  return null;
}

/** `images`, `image_url` and `image` arrive as URL strings, URL arrays or `{ image }` objects depending on the serializer. */
export function productImage(product: Pick<CatalogProduct, 'images' | 'image' | 'image_url'>): string | null {
  return absoluteUrl(firstImage(product.images) ?? firstImage(product.image_url) ?? firstImage(product.image));
}

export function storeImage(store: Pick<StoreSummary, 'logo' | 'banner'>): string | null {
  const banner = typeof store.banner === 'string' ? store.banner : null;
  return absoluteUrl(banner || store.logo);
}

export function storeLogo(store: Pick<StoreSummary, 'logo'>): string | null {
  return absoluteUrl(store.logo);
}

export function storeEta(store: Pick<StoreSummary, 'delivery_time_min' | 'delivery_time_max'>): string | null {
  const { delivery_time_min: min, delivery_time_max: max } = store;
  if (min && max && min !== max) return `${min}–${max} min`;
  const single = max || min;
  return single ? `${single} min` : null;
}

export function currencySymbol(currency: string): string {
  return formatMoney(0, currency).split(' ')[0] || currency;
}

export function priceLevelLabel(level: number | null | undefined, currency: string): string | null {
  if (!level || level < 1) return null;
  return currencySymbol(currency).repeat(Math.min(level, 3));
}

export function storeIsOpen(store: FoodStore): boolean {
  return store.is_open !== false && store.accepting_orders !== false;
}

export function storeSubtitle(store: FoodStore): string {
  const parts = [store.cuisine?.name, priceLevelLabel(store.price_level, storeCurrency(store))];
  return parts.filter(Boolean).join(' · ');
}

export function productCategoryName(product: CatalogProduct): string | null {
  const { category } = product;
  if (!category) return null;
  return typeof category === 'string' ? category : category.name || null;
}

export function productPrice(product: CatalogProduct): number {
  return toNumber(product.price);
}

/** Only show a strike-through when the API reports a sale and a higher reference price. */
export function productStrikePrice(product: CatalogProduct): number | null {
  if (!product.on_sale) return null;
  const original = toNumber(product.original_price);
  return original > productPrice(product) ? original : null;
}

export function productDiscountBadge(product: CatalogProduct): string | null {
  if (!product.on_sale) return null;
  const pct = Math.round(product.discount_percentage ?? 0);
  return pct > 0 ? `-${pct}%` : null;
}

export type ProductSizeOption = { key: string; label: string; price: number | null };

export function productSizes(product: CatalogProduct): ProductSizeOption[] {
  return (product.sizes ?? [])
    .map((size, index): ProductSizeOption | null => {
      if (typeof size === 'string') return size ? { key: `${index}-${size}`, label: size, price: null } : null;
      const label = size.name || size.size || '';
      if (!label) return null;
      const price = size.price == null ? 0 : toNumber(size.price);
      return { key: String(size.id ?? `${index}-${label}`), label, price: price > 0 ? price : null };
    })
    .filter((size): size is ProductSizeOption => size !== null);
}

export function needsCustomisation(product: CatalogProduct): boolean {
  return (product.addon_groups?.length ?? 0) > 0 || productSizes(product).length > 0;
}

export function productStoreId(product: CatalogProduct): number | null {
  return product.store_id ?? product.store ?? null;
}
