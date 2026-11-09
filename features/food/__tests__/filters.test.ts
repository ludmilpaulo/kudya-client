import { EMPTY_FILTERS, activeFilterCount, sortFromParam, sortOptions, toStoreFilters } from '../filters';

describe('restaurant list filters', () => {
  it('maps every filter to the documented query fields', () => {
    const filters = toStoreFilters(
      { ...EMPTY_FILTERS, cuisine: 'pizza', priceLevels: [1, 2], maxDeliveryMin: 30, minRating: 4, openNow: true, hasPromotion: true, pickup: true },
      'rating',
      ' burger ',
    );
    expect(filters).toEqual({
      search: 'burger',
      cuisine: 'pizza',
      price_level: [1, 2],
      max_delivery_min: 30,
      min_rating: 4,
      open_now: true,
      has_promotion: true,
      pickup: true,
      ordering: '-rating',
    });
  });

  it('only orders by distance when coordinates are known', () => {
    expect(toStoreFilters(EMPTY_FILTERS, 'distance', '')).toEqual({});
    expect(toStoreFilters(EMPTY_FILTERS, 'distance', '', { latitude: -25.75, longitude: 28.19 })).toEqual({
      lat: -25.75,
      lng: 28.19,
      ordering: 'distance',
    });
    expect(sortOptions(false)).not.toContain('distance');
    expect(sortOptions(true)).toContain('distance');
  });

  it('counts active filters and parses sort params', () => {
    expect(activeFilterCount(EMPTY_FILTERS)).toBe(0);
    expect(activeFilterCount({ ...EMPTY_FILTERS, openNow: true, pickup: true, priceLevels: [2] })).toBe(3);
    expect(sortFromParam('rating')).toBe('rating');
    expect(sortFromParam('distance')).toBe('distance');
    expect(sortFromParam(undefined)).toBe('recommended');
  });
});
