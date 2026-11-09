import {
  MAX_SPECIAL_INSTRUCTIONS,
  cartLineKey,
  cartSignature,
  lineKeyFor,
  newIdempotencyKey,
  normalizeInstructions,
  quoteLines,
} from '../cartLine';

describe('food cart line key', () => {
  it('is independent of add-on order and duplicates', () => {
    expect(cartLineKey(7, [12, 3, 12])).toBe(cartLineKey(7, [3, 12]));
    expect(cartLineKey(7, [3, 12])).toBe('p7-a3.12');
  });

  it('separates the same product with different options or instructions', () => {
    const plain = cartLineKey(7);
    const cheese = cartLineKey(7, [3]);
    const noOnions = cartLineKey(7, [], 'No onions');
    expect(new Set([plain, cheese, noOnions, cartLineKey(8)]).size).toBe(4);
    expect(plain).toBe('p7');
  });

  it('treats whitespace-only differences in instructions as the same line', () => {
    expect(cartLineKey(7, [], '  no   onions ')).toBe(cartLineKey(7, [], 'no onions'));
    expect(cartLineKey(7, [], '   ')).toBe(cartLineKey(7));
  });

  it('stays short enough for the server (keys are truncated at 120 chars)', () => {
    const key = cartLineKey(123456, [1, 2, 3, 4, 5, 6, 7, 8], 'x'.repeat(500));
    expect(key.length).toBeLessThan(120);
  });

  it('prefers a stored line_key and otherwise derives one from the line', () => {
    expect(lineKeyFor({ id: 7, quantity: 1, line_key: 'custom' })).toBe('custom');
    expect(lineKeyFor({ id: 7, quantity: 1, addons: [{ id: 9 }], special_instructions: 'Spicy' })).toBe(
      cartLineKey(7, [9], 'Spicy'),
    );
  });

  it('caps instructions at the backend limit', () => {
    expect(normalizeInstructions('a'.repeat(MAX_SPECIAL_INSTRUCTIONS + 50))).toHaveLength(MAX_SPECIAL_INSTRUCTIONS);
  });
});

describe('food quote lines', () => {
  it('sends only ids, quantities, add-on ids and instructions — never prices', () => {
    const [line] = quoteLines([{ id: 7, quantity: 2, addons: [{ id: 12 }, { id: 3 }], special_instructions: ' Spicy ' }]);
    expect(line).toEqual({
      key: cartLineKey(7, [3, 12], 'Spicy'),
      product_id: 7,
      quantity: 2,
      addons: [3, 12],
      special_instructions: 'Spicy',
    });
    expect(Object.keys(line)).not.toContain('price');
  });

  it('merges rows with the same configuration and keeps different ones apart', () => {
    const lines = quoteLines([
      { id: 7, quantity: 1 },
      { id: 7, quantity: 2 },
      { id: 7, quantity: 1, addons: [{ id: 3 }] },
    ]);
    expect(lines).toEqual([
      { key: 'p7', product_id: 7, quantity: 3 },
      { key: 'p7-a3', product_id: 7, quantity: 1, addons: [3] },
    ]);
  });

  it('changes the cart signature when quantities or options change', () => {
    const base = cartSignature(quoteLines([{ id: 7, quantity: 1 }]));
    expect(cartSignature(quoteLines([{ id: 7, quantity: 1 }]))).toBe(base);
    expect(cartSignature(quoteLines([{ id: 7, quantity: 2 }]))).not.toBe(base);
    expect(cartSignature(quoteLines([{ id: 7, quantity: 1, addons: [{ id: 3 }] }]))).not.toBe(base);
  });
});

describe('idempotency key', () => {
  it('is a v4 UUID and unique per call', () => {
    const first = newIdempotencyKey();
    const second = newIdempotencyKey();
    expect(first).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(first).not.toBe(second);
  });
});
