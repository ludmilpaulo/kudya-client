import { isPaymentReturnUrl } from '../../utils/paymentReturn';

describe('isPaymentReturnUrl', () => {
  it('matches the backend return route and the app deep link', () => {
    expect(isPaymentReturnUrl('https://www.kudya.store/api/payments/return/KDY-123/')).toBe(true);
    expect(isPaymentReturnUrl('kudya://payment-status?reference=KDY-123')).toBe(true);
  });

  it('ignores provider pages and the bare return prefix', () => {
    expect(isPaymentReturnUrl('https://pay.thunes.com/po_1')).toBe(false);
    expect(isPaymentReturnUrl('https://www.kudya.store/api/payments/return/')).toBe(false);
  });
});
