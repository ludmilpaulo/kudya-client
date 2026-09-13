export const GROCERY_COLORS = {
  primary: '#0B8F45',
  primaryDark: '#056B34',
  primarySoft: '#EAF7EE',
  white: '#FFFFFF',
  text: '#111827',
  muted: '#6B7280',
  border: '#E5E7EB',
  background: '#F8FAF9',
} as const;

export interface GroceryCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
  image: string | null;
  show_in_nav: boolean;
}

export interface GroceryProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price: number;
  unit: string;
  brand: string;
  stock: number;
  on_sale: boolean;
  is_featured: boolean;
  is_favourite: boolean;
  discount_percentage: number;
  images: string[];
  category: GroceryCategory | null;
  store: number;
  store_name: string;
  selling_unit: string;
  stock_quantity: number;
  stock_unit: string;
  price_display: string;
  is_purchasable: boolean;
  inventory_status: string;
}

export type GroceryBannerKind = 'hero' | 'promo' | 'benefit';

export interface GroceryBanner {
  id: number;
  kind: GroceryBannerKind;
  title: string;
  subtitle: string;
  body: string;
  cta_label: string;
  cta_href: string;
  image: string | null;
  badge: string;
  icon: string;
  sort_order: number;
}

export interface GroceryHome {
  hero: GroceryBanner[];
  benefits: GroceryBanner[];
  promotions: GroceryBanner[];
  categories: GroceryCategory[];
  nav_categories: GroceryCategory[];
  popular_products: GroceryProduct[];
  deals: GroceryProduct[];
  deals_end_at: string | null;
  deals_title: string;
}

export interface GroceryProductPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: GroceryProduct[];
}

export interface GroceryProductQuery {
  search?: string;
  category?: number;
  category_slug?: string;
  featured?: boolean;
  on_sale?: boolean;
  page?: number;
  page_size?: number;
  store?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export function asBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === 'true' || value === '1';
}

export function unwrapList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (isRecord(data) && Array.isArray(data.results)) return data.results;
  return [];
}

export function mapGroceryCategory(raw: unknown): GroceryCategory | null {
  if (!isRecord(raw)) return null;
  const id = asNumber(raw.id);
  const name = asString(raw.name);
  if (!id || !name) return null;
  return {
    id,
    name,
    slug: asString(raw.slug),
    icon: asString(raw.icon),
    image: typeof raw.image === 'string' && raw.image ? raw.image : null,
    show_in_nav: asBoolean(raw.show_in_nav),
  };
}

export function mapGroceryProduct(raw: unknown): GroceryProduct | null {
  if (!isRecord(raw)) return null;
  const id = asNumber(raw.id);
  const name = asString(raw.name);
  if (!id || !name) return null;
  const images = Array.isArray(raw.images)
    ? raw.images.filter((item): item is string => typeof item === 'string' && item.length > 0)
    : [];
  const sellingUnit = asString(raw.selling_unit, asString(raw.unit, 'item'));
  return {
    id,
    name,
    description: asString(raw.description),
    price: asNumber(raw.price),
    original_price: asNumber(raw.original_price, asNumber(raw.price)),
    unit: asString(raw.unit),
    brand: asString(raw.brand),
    stock: asNumber(raw.stock),
    on_sale: asBoolean(raw.on_sale),
    is_featured: asBoolean(raw.is_featured),
    is_favourite: asBoolean(raw.is_favourite),
    discount_percentage: asNumber(raw.discount_percentage),
    images,
    category: mapGroceryCategory(raw.category),
    store: asNumber(raw.store),
    store_name: asString(raw.store_name),
    selling_unit: sellingUnit,
    stock_quantity: asNumber(raw.stock_quantity, asNumber(raw.stock)),
    stock_unit: asString(raw.stock_unit, sellingUnit),
    price_display: asString(raw.price_display),
    is_purchasable: raw.is_purchasable === undefined ? asNumber(raw.stock) > 0 : asBoolean(raw.is_purchasable),
    inventory_status: asString(raw.inventory_status),
  };
}

function mapBannerKind(value: unknown): GroceryBannerKind {
  if (value === 'promo' || value === 'benefit' || value === 'hero') return value;
  return 'hero';
}

export function mapGroceryBanner(raw: unknown): GroceryBanner | null {
  if (!isRecord(raw)) return null;
  const id = asNumber(raw.id);
  const title = asString(raw.title);
  if (!id || !title) return null;
  return {
    id,
    kind: mapBannerKind(raw.kind),
    title,
    subtitle: asString(raw.subtitle),
    body: asString(raw.body),
    cta_label: asString(raw.cta_label),
    cta_href: asString(raw.cta_href),
    image: typeof raw.image === 'string' && raw.image ? raw.image : null,
    badge: asString(raw.badge),
    icon: asString(raw.icon),
    sort_order: asNumber(raw.sort_order),
  };
}

export function mapGroceryHome(raw: unknown): GroceryHome {
  const data = isRecord(raw) ? raw : {};
  return {
    hero: unwrapList(data.hero).map(mapGroceryBanner).filter((item): item is GroceryBanner => item !== null),
    benefits: unwrapList(data.benefits).map(mapGroceryBanner).filter((item): item is GroceryBanner => item !== null),
    promotions: unwrapList(data.promotions).map(mapGroceryBanner).filter((item): item is GroceryBanner => item !== null),
    categories: unwrapList(data.categories).map(mapGroceryCategory).filter((item): item is GroceryCategory => item !== null),
    nav_categories: unwrapList(data.nav_categories).map(mapGroceryCategory).filter((item): item is GroceryCategory => item !== null),
    popular_products: unwrapList(data.popular_products).map(mapGroceryProduct).filter((item): item is GroceryProduct => item !== null),
    deals: unwrapList(data.deals).map(mapGroceryProduct).filter((item): item is GroceryProduct => item !== null),
    deals_end_at: typeof data.deals_end_at === 'string' ? data.deals_end_at : null,
    deals_title: asString(data.deals_title, 'Deals of the Week'),
  };
}

export function mapGroceryProductPage(raw: unknown): GroceryProductPage {
  const data = isRecord(raw) ? raw : {};
  const rows = unwrapList(raw);
  return {
    count: asNumber(data.count, rows.length),
    next: typeof data.next === 'string' ? data.next : null,
    previous: typeof data.previous === 'string' ? data.previous : null,
    results: rows.map(mapGroceryProduct).filter((item): item is GroceryProduct => item !== null),
  };
}

export function groceryProductImage(product: GroceryProduct): string {
  return product.images[0] ?? '';
}

export function parseGroceryCategoryHref(href: string): string | null {
  const match = href.match(/\/groceries\/category\/([^/?#]+)/);
  return match?.[1] ?? null;
}
