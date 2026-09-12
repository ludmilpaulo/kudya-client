import { normalizeV1Stores, verticalApiPath } from '../../utils/normalizeStores';

describe('grocery store normalization', () => {
  it('reads nested grocery store_type and category ids from the v1 payload', () => {
    const stores = normalizeV1Stores({
      results: [
        {
          id: 2,
          name: 'Supermercado Central',
          phone: '1',
          address: 'Luanda',
          logo: 'http://127.0.0.1:8000/media/grocery.png',
          store_type: { id: 2, name: 'Grocery' },
          category: { id: 9, name: 'Supermercados' },
          is_approved: true,
        },
      ],
    });
    expect(stores).toHaveLength(1);
    expect(stores[0].store_type).toBe(2);
    expect(stores[0].category).toBe(9);
    expect(stores[0].logo).toBe('http://127.0.0.1:8000/media/grocery.png');
  });

  it('points groceries at the v1 grocery catalog', () => {
    expect(verticalApiPath('groceries')).toBe('/api/v1/groceries/stores/');
  });
});
