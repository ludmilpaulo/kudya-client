import API from '../../services/api';
import { baseAPI } from '../../services/types';
import type { MarketplaceVertical } from '../../utils/normalizeStores';

export type CheckoutOrderPayload = {
  access_token: string;
  store_id: number;
  address?: string;
  location?: string;
  use_current_location?: boolean;
  delivery_fee: string;
  payment_method: string;
  delivery_notes?: string;
  coupon_code?: string;
  order_details: Array<{ product_id: number; quantity: number }>;
};

export type MultipleCheckoutPayload = {
  access_token: string;
  orders: Array<Omit<CheckoutOrderPayload, 'access_token'>>;
};

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
  const { data } = await API.post(v1(path), payload);
  return data;
}

export async function completeMultipleCheckout(
  payload: MultipleCheckoutPayload,
  vertical?: MarketplaceVertical,
) {
  const path = vertical
    ? `/${vertical}/checkout/multiple/`
    : '/marketplace/checkout/multiple/';
  const { data } = await API.post(v1(path), payload);
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

export async function fetchProductsByStoreV1(storeId: number, vertical: MarketplaceVertical) {
  const { data } = await API.get(v1(`/${vertical}/products/`), {
    params: { store: storeId },
  });
  return Array.isArray(data) ? data : data.results ?? [];
}
