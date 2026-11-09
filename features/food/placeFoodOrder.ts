import type { CartItem } from '../../services/types';
import type { FulfilmentType } from '../commerce/api';
import type { CartQuote } from '../marketplace/api/checkoutApi';
import type { DeliveryDetails, PaymentDetailsInput, PlaceOrderResult } from '../checkout/placeOrder';
import { groupItemsByStore } from '../checkout/placeOrder';
import { initializePayment, uploadPaymentProof } from '../../services/paymentService';
import { mimeTypeForName } from '../../utils/formDataFile';
import { errorMessage } from '../../utils/notify';
import { quoteLines } from './cartLine';
import { completeFoodCheckout } from './checkout';

type PlaceFoodOrdersInput = {
  items: CartItem[];
  fulfilmentType: FulfilmentType;
  delivery: DeliveryDetails;
  payment: PaymentDetailsInput;
  couponCode?: string;
  /** The quote decides which store a coupon applies to; it is only sent to that store's checkout. */
  quote: CartQuote | null;
  idempotencyKey: string;
  token: string;
  describeError: (error: unknown) => string;
};

/**
 * One POST /api/v1/food/checkout/ per restaurant in the cart (the server scopes the Idempotency-Key per store),
 * then the existing payment initialise flow for non-cash methods. Payment success is never assumed here:
 * the order is paid only once the order detail reports `is_paid`.
 */
export async function placeFoodOrders({
  items,
  fulfilmentType,
  delivery,
  payment,
  couponCode,
  quote,
  idempotencyKey,
  token,
  describeError,
}: PlaceFoodOrdersInput): Promise<PlaceOrderResult> {
  const result: PlaceOrderResult = { orders: [], placedStoreIds: [], failures: [], paymentNotices: [], authorizationUrl: null };
  const coupon = couponCode?.trim();
  const couponStoreId = coupon ? quote?.stores.find((store) => !!store.coupon_code)?.store_id ?? null : null;
  const pickup = fulfilmentType === 'pickup';
  const location = !pickup && delivery.useCurrentLocation && delivery.location
    ? `${delivery.location.latitude.toFixed(6)},${delivery.location.longitude.toFixed(6)}`
    : '';

  for (const [storeId, storeItems] of groupItemsByStore(items)) {
    try {
      const order = await completeFoodCheckout(
        {
          store_id: storeId,
          fulfilment_type: fulfilmentType,
          address: pickup ? '' : delivery.address.trim(),
          location,
          use_current_location: location !== '',
          payment_method: payment.method,
          delivery_notes: delivery.notes.trim(),
          ...(coupon && couponStoreId === storeId ? { coupon_code: coupon } : {}),
          order_details: quoteLines(storeItems),
        },
        idempotencyKey,
      );
      result.orders.push(order);
      result.placedStoreIds.push(storeId);
    } catch (error) {
      result.failures.push({ store_id: storeId, error: describeError(error) });
    }
  }

  if (payment.method && payment.method !== 'cash') {
    for (const order of result.orders) {
      try {
        const init = await initializePayment(token, {
          amount: Number(order.total),
          currency: order.currency,
          method: payment.method,
          phone: payment.phone || undefined,
          service_type: 'food',
          object_id: order.order_id,
        });
        if (payment.proof && init.requires_action === 'upload_proof' && init.payment_id) {
          await uploadPaymentProof(token, init.payment_id, {
            uri: payment.proof.uri,
            name: payment.proof.name,
            type: mimeTypeForName(payment.proof.name),
          });
        }
        if (init.customer_message) result.paymentNotices.push(init.customer_message);
        if (init.authorization_url && !result.authorizationUrl) result.authorizationUrl = init.authorization_url;
      } catch (error) {
        result.paymentNotices.push(errorMessage(error, 'Payment could not be started. Pay from your orders.'));
      }
    }
  }
  return result;
}
