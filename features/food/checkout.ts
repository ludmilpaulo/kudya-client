import API from '../../services/api';
import { baseAPI } from '../../services/types';
import type { FulfilmentType } from '../commerce/api';
import type { CheckoutLine, PlacedOrderSummary } from '../marketplace/api/checkoutApi';

/** Checkout locks stock and creates the order; allow more than the default API timeout. */
const CHECKOUT_TIMEOUT_MS = 60000;

export type FoodCheckoutRequest = {
  store_id: number;
  fulfilment_type: FulfilmentType;
  address: string;
  /** "lat,lng" or empty. */
  location: string;
  use_current_location: boolean;
  payment_method: string;
  delivery_notes: string;
  coupon_code?: string;
  order_details: CheckoutLine[];
};

export type FoodCheckoutResponse = PlacedOrderSummary & {
  status: string;
  number?: string;
  fulfilment_type?: FulfilmentType;
};

/** POST /api/v1/food/checkout/ — the same Idempotency-Key replays the original order instead of creating a new one. */
export async function completeFoodCheckout(body: FoodCheckoutRequest, idempotencyKey: string): Promise<FoodCheckoutResponse> {
  const { data } = await API.post<FoodCheckoutResponse>(`${baseAPI}/api/v1/food/checkout/`, body, {
    timeout: CHECKOUT_TIMEOUT_MS,
    headers: { 'Idempotency-Key': idempotencyKey },
  });
  return data;
}
