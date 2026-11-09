import { apiErrorCode, foodCheckoutErrorCopy } from '../checkoutErrors';

describe('food checkout error codes', () => {
  it.each([
    ['store_closed', 'fdErrStoreClosed'],
    ['unavailable', 'fdErrUnavailable'],
    ['invalid_addons', 'fdErrInvalidAddons'],
    ['invalid_coupon', 'fdErrInvalidCoupon'],
    ['coupon_not_applicable', 'fdErrCouponNotApplicable'],
    ['pickup_unavailable', 'fdErrPickupUnavailable'],
    ['open_order_exists', 'fdErrOpenOrder'],
  ])('maps the documented %s code to a friendly message', (code, key) => {
    const copy = foodCheckoutErrorCopy(code);
    expect(copy?.key).toBe(key);
    expect(copy?.fallback).toBeTruthy();
  });

  it('returns null for unknown or missing codes so the server message is used', () => {
    expect(foodCheckoutErrorCopy('something_new')).toBeNull();
    expect(foodCheckoutErrorCopy(undefined)).toBeNull();
  });

  it('reads the code from an axios error body', () => {
    const conflict = { response: { status: 409, data: { error: 'You already have an open order.', code: 'open_order_exists' } } };
    expect(apiErrorCode(conflict)).toBe('open_order_exists');
    expect(apiErrorCode({ response: { data: { detail: 'x' } } })).toBeUndefined();
    expect(apiErrorCode(new Error('network'))).toBeUndefined();
    expect(apiErrorCode(null)).toBeUndefined();
  });
});
