import type { Store } from '../services/types';

type RawStore = Record<string, unknown>;

export type MarketplaceVertical = 'food' | 'groceries';

function nestedId(value: unknown): number {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object' && 'id' in value) {
    return Number((value as { id: number }).id) || 0;
  }
  return 0;
}

export function normalizeV1Stores(data: unknown): Store[] {
  const rows = Array.isArray(data)
    ? data
    : (data as { results?: RawStore[] })?.results ?? [];

  return rows.map((raw) => ({
    id: Number(raw.id),
    store_type: nestedId(raw.store_type),
    category: nestedId(raw.category),
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
