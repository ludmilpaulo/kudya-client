/** Translation key + English fallback for each documented food checkout error `code`. */
export type ErrorCopy = { key: string; fallback: string };

const FOOD_CHECKOUT_ERRORS: Record<string, ErrorCopy> = {
  store_closed: { key: 'fdErrStoreClosed', fallback: 'This restaurant is closed right now. Try again when it opens.' },
  store_unavailable: { key: 'fdErrStoreUnavailable', fallback: 'This restaurant is not accepting orders right now.' },
  store_not_found: { key: 'fdErrStoreUnavailable', fallback: 'This restaurant is not accepting orders right now.' },
  unavailable: { key: 'fdErrUnavailable', fallback: 'Some items are no longer available. Review your cart and try again.' },
  product_not_found: { key: 'fdErrUnavailable', fallback: 'Some items are no longer available. Review your cart and try again.' },
  product_store_mismatch: { key: 'fdErrUnavailable', fallback: 'Some items are no longer available. Review your cart and try again.' },
  invalid_addons: { key: 'fdErrInvalidAddons', fallback: 'Some add-on choices changed. Open the item and choose again.' },
  instructions_too_long: { key: 'fdErrInstructionsTooLong', fallback: 'Special instructions can be at most 300 characters.' },
  invalid_coupon: { key: 'fdErrInvalidCoupon', fallback: 'This promo code is invalid or has expired.' },
  coupon_not_applicable: { key: 'fdErrCouponNotApplicable', fallback: 'This promo code does not apply to this restaurant.' },
  coupon_minimum_not_met: { key: 'fdErrCouponMinimum', fallback: 'Your order does not meet the minimum for this promo code.' },
  pickup_unavailable: { key: 'fdErrPickupUnavailable', fallback: 'This restaurant does not offer pickup. Choose delivery instead.' },
  invalid_fulfilment_type: { key: 'fdErrPickupUnavailable', fallback: 'This restaurant does not offer pickup. Choose delivery instead.' },
  open_order_exists: { key: 'fdErrOpenOrder', fallback: 'You already have an open order with this restaurant. Track it from your orders.' },
  address_required: { key: 'fdErrAddressRequired', fallback: 'Enter a delivery address.' },
  location_required: { key: 'fdErrLocationRequired', fallback: 'We could not get your location. Enter a delivery address instead.' },
  payment_method_required: { key: 'fdErrPaymentRequired', fallback: 'Choose a payment method.' },
  invalid_payment_method: { key: 'fdErrPaymentInvalid', fallback: 'This payment method is not available. Choose another one.' },
  empty_cart: { key: 'fdErrEmptyCart', fallback: 'Your cart is empty.' },
  invalid_token: { key: 'fdErrSession', fallback: 'Your session has expired. Please sign in again.' },
  idempotency_conflict: { key: 'fdErrDuplicate', fallback: 'This order was already submitted. Check your orders before trying again.' },
  invalid_idempotency_key: { key: 'fdErrDuplicate', fallback: 'This order was already submitted. Check your orders before trying again.' },
  server_error: { key: 'fdErrServer', fallback: 'We could not place your order. Please try again.' },
};

export function foodCheckoutErrorCopy(code: string | null | undefined): ErrorCopy | null {
  if (!code) return null;
  return FOOD_CHECKOUT_ERRORS[code] ?? null;
}

/** The `{error, code}` body the checkout endpoints return on failure. */
export function apiErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const data = (error as { response?: { data?: unknown } }).response?.data;
  if (!data || typeof data !== 'object') return undefined;
  const code = (data as { code?: unknown }).code;
  return typeof code === 'string' && code ? code : undefined;
}
