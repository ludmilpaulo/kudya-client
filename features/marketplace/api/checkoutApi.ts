import API from '../../../services/api';
import { baseAPI } from '../../../services/types';
import type { MarketplaceVertical } from '../../../utils/normalizeStores';

export type CheckoutLine = {
  /** Client line id echoed back on quoted lines so totals can be matched to cart rows. */
  key?: string;
  product_id: number;
  quantity: number;
  size?: string;
  selling_unit?: string;
  addons?: number[];
  special_instructions?: string;
  substitution_preference?: 'allow_similar' | 'specific' | 'remove';
  substitute_product_id?: number | null;
};

export type CheckoutLocation = { latitude: number; longitude: number };

export type CheckoutOrderPayload = {
  access_token?: string;
  store_id: number | string;
  address?: string;
  location?: string | CheckoutLocation | null;
  use_current_location?: boolean;
  delivery_fee?: string;
  payment_method: string;
  delivery_notes?: string;
  coupon_code?: string;
  delivery_slot?: { date: string; start: string; end: string } | null;
  substitution_preference?: 'allow_similar' | 'specific' | 'remove';
  order_details: CheckoutLine[];
};

export type MultipleCheckoutPayload = {
  access_token?: string;
  coupon_code?: string;
  orders: Array<Omit<CheckoutOrderPayload, 'access_token'>>;
};

export type QuotedLine = {
  key?: string;
  product_id: number;
  name: string;
  quantity: string;
  selling_unit: string;
  unit_price: string;
  discount: string;
  subtotal: string;
  addons?: Array<{ id: number; name: string; price: string }>;
  special_instructions?: string;
};

export type StoreQuote = {
  store_id: number;
  store_name: string;
  currency?: string;
  lines?: QuotedLine[];
  subtotal?: string;
  promotion_discount?: string;
  delivery_fee?: string;
  discount_amount?: string;
  total?: string;
  coupon_code?: string;
  coupon_error?: string | null;
  fulfilment_type?: 'delivery' | 'pickup';
  minimum_order_amount?: string;
  error?: string;
  code?: string;
};

export type CartQuote = {
  stores: StoreQuote[];
  lines: QuotedLine[];
  unavailable_product_ids: number[];
  currency: string;
  coupon_code: string;
  coupon_error: string | null;
  subtotal: string;
  delivery_fee: string;
  discount_amount: string;
  total: string;
  has_errors: boolean;
};

export type PlacedOrderSummary = {
  order_id: number;
  store_id: number;
  secret_pin: string | null;
  subtotal: string;
  delivery_fee: string;
  discount_amount: string;
  total: string;
  currency: string;
  payment_method: string;
  fulfilment_type?: 'delivery' | 'pickup';
};

export type CheckoutResponse = {
  status: 'success' | 'partial_success' | 'failed' | string;
  error?: string;
  code?: string;
  order_id?: number;
  order_ids?: number[];
  created_orders?: number[];
  order_totals?: Array<{ order_id: number; total: string }>;
  orders?: PlacedOrderSummary[];
  errors?: Array<{ store_id: number; error: string; code?: string }>;
  secret_pin?: string;
  total?: string;
  delivery_fee?: string;
};

/** Checkout waits for stock locking and order creation; allow more than the default API timeout. */
const CHECKOUT_TIMEOUT_MS = 60000;

const v1 = (path: string) => `${baseAPI}/api/v1${path}`;

export async function fetchStoreForCheckout(storeId: number, vertical?: MarketplaceVertical) {
  const path = vertical
    ? `/${vertical}/stores/${storeId}/`
    : `/marketplace/stores/${storeId}/`;
  const { data } = await API.get(v1(path));
  return data;
}

export async function completeCheckout(payload: CheckoutOrderPayload, vertical?: MarketplaceVertical) {
  const path = vertical ? `/${vertical}/checkout/` : '/marketplace/checkout/';
  const { data } = await API.post<CheckoutResponse>(v1(path), payload, { timeout: CHECKOUT_TIMEOUT_MS });
  return data;
}

export async function completeMultipleCheckout(
  payload: MultipleCheckoutPayload,
  vertical?: MarketplaceVertical,
) {
  const path = vertical
    ? `/${vertical}/checkout/multiple/`
    : '/marketplace/checkout/multiple/';
  const { data } = await API.post<CheckoutResponse>(v1(path), payload, { timeout: CHECKOUT_TIMEOUT_MS });
  return data;
}

export async function quoteCart(
  lines: CheckoutLine[],
  options: { couponCode?: string; vertical?: MarketplaceVertical; fulfilmentType?: 'delivery' | 'pickup' } = {},
): Promise<CartQuote> {
  const path = options.vertical ? `/${options.vertical}/checkout/quote/` : '/marketplace/checkout/quote/';
  const { data } = await API.post<CartQuote>(v1(path), {
    lines,
    ...(options.couponCode ? { coupon_code: options.couponCode } : {}),
    ...(options.fulfilmentType ? { fulfilment_type: options.fulfilmentType } : {}),
  });
  return data;
}

export async function validateCouponV1(couponCode: string, subtotal = 0, vertical?: MarketplaceVertical) {
  const path = vertical
    ? `/${vertical}/coupons/validate/`
    : '/marketplace/coupons/validate/';
  const { data } = await API.post(v1(path), {
    coupon_code: couponCode,
    subtotal,
  });
  return data;
}

export async function fetchCheckoutQuote(storeId: number) {
  const { data } = await API.get(v1(`/marketplace/checkout/quote/`), {
    params: { store_id: storeId },
  });
  return data as { delivery_fee: string; currency?: string };
}

export async function fetchProductsByStoreV1(storeId: number, vertical: MarketplaceVertical) {
  const { data } = await API.get(v1(`/${vertical}/products/`), {
    params: { store: storeId },
  });
  return Array.isArray(data) ? data : data.results ?? [];
}
