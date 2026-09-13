import { mapGroceryProduct } from '../../../features/groceries/types';

describe('grocery product mapping', () => {
  it('maps grocery catalog payloads', () => {
    const product = mapGroceryProduct({
      id: 4,
      name: 'Banana',
      price: 18.99,
      unit: '1kg',
      images: ['http://127.0.0.1:8000/media/banana.jpg'],
      category: { id: 1, name: 'Fresh Produce', slug: 'fresh-produce' },
      store: 2,
    });
    expect(product?.name).toBe('Banana');
    expect(product?.unit).toBe('1kg');
    expect(product?.category?.slug).toBe('fresh-produce');
  });
});
