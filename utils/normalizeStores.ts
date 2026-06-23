import type { Store } from '../services/types';

type RawStore = Record<string, unknown>;

export type MarketplaceVertical = 'food' | 'groceries';

export function normalizeV1Stores(data: unknown): Store[] {
  const rows = Array.isArray(data)
    ? data
    : (data as { results?: RawStore[] })?.results ?? [];

  return rows.map((raw) => ({
    id: Number(raw.id),
    store_type: typeof raw.store_type === 'number' ? raw.store_type : 0,
    category: typeof raw.category === 'number' ? raw.category : 0,
    name: String(raw.name ?? ''),
    phone: String(raw.phone ?? ''),
    address: String(raw.address ?? ''),
    logo: String(raw.logo ?? ''),
    location: typeof raw.location === 'string' ? raw.location : undefined,
    latitude: typeof raw.latitude === 'number' ? raw.latitude : undefined,
    longitude: typeof raw.longitude === 'number' ? raw.longitude : undefined,
    banner: Boolean(raw.banner ?? raw.barnner),
    is_approved: Boolean(raw.is_approved ?? true),
  }));
}

export function verticalApiPath(vertical: MarketplaceVertical): string {
  return vertical === 'food' ? '/api/v1/food/stores/' : '/api/v1/groceries/stores/';
}
