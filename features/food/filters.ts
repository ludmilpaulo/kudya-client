import type { StoreFilters } from '../commerce/api';

export type RestaurantSort = 'recommended' | 'rating' | 'delivery_time' | 'distance';

export type RestaurantFilterState = {
  cuisine: string | null;
  priceLevels: number[];
  maxDeliveryMin: number | null;
  minRating: number | null;
  openNow: boolean;
  hasPromotion: boolean;
  pickup: boolean;
};

export type Coordinates = { latitude: number; longitude: number };

export const EMPTY_FILTERS: RestaurantFilterState = {
  cuisine: null,
  priceLevels: [],
  maxDeliveryMin: null,
  minRating: null,
  openNow: false,
  hasPromotion: false,
  pickup: false,
};

export const SORT_OPTIONS: readonly RestaurantSort[] = ['recommended', 'rating', 'delivery_time', 'distance'];
export const PRICE_LEVEL_OPTIONS: readonly number[] = [1, 2, 3];
export const DELIVERY_TIME_OPTIONS: readonly number[] = [20, 30, 45, 60];
export const RATING_OPTIONS: readonly number[] = [3.5, 4, 4.5];

/** Distance sorting needs coordinates; hide it until we have them. */
export function sortOptions(hasLocation: boolean): RestaurantSort[] {
  return SORT_OPTIONS.filter((option) => option !== 'distance' || hasLocation);
}

export function sortFromParam(value?: string | null): RestaurantSort {
  if (value === 'rating' || value === '-rating') return 'rating';
  if (value === 'delivery_time' || value === 'distance') return value;
  return 'recommended';
}

export function activeFilterCount(filters: RestaurantFilterState): number {
  return [
    !!filters.cuisine,
    filters.priceLevels.length > 0,
    filters.maxDeliveryMin !== null,
    filters.minRating !== null,
    filters.openNow,
    filters.hasPromotion,
    filters.pickup,
  ].filter(Boolean).length;
}

export function togglePriceLevel(levels: number[], level: number): number[] {
  return levels.includes(level) ? levels.filter((value) => value !== level) : [...levels, level].sort((a, b) => a - b);
}

const ORDERING: Record<Exclude<RestaurantSort, 'recommended'>, NonNullable<StoreFilters['ordering']>> = {
  rating: '-rating',
  delivery_time: 'delivery_time',
  distance: 'distance',
};

export function toStoreFilters(
  filters: RestaurantFilterState,
  sort: RestaurantSort,
  query: string,
  location?: Coordinates | null,
): StoreFilters {
  const result: StoreFilters = {};
  const search = query.trim();
  if (search) result.search = search;
  if (filters.cuisine) result.cuisine = filters.cuisine;
  if (filters.priceLevels.length) result.price_level = filters.priceLevels;
  if (filters.maxDeliveryMin !== null) result.max_delivery_min = filters.maxDeliveryMin;
  if (filters.minRating !== null) result.min_rating = filters.minRating;
  if (filters.openNow) result.open_now = true;
  if (filters.hasPromotion) result.has_promotion = true;
  if (filters.pickup) result.pickup = true;
  if (location) {
    result.lat = location.latitude;
    result.lng = location.longitude;
  }
  if (sort !== 'recommended' && (sort !== 'distance' || location)) result.ordering = ORDERING[sort];
  return result;
}
