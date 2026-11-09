import type { CartItem } from '../../services/types';
import type { DraftSlot, SubstitutionPreference } from '../../redux/slices/checkoutDraftSlice';
import {
  completeMultipleCheckout,
  type CheckoutLocation,
  type CheckoutResponse,
  type PlacedOrderSummary,
} from '../marketplace/api/checkoutApi';
import { initializePayment, uploadPaymentProof } from '../../services/paymentService';
import { mimeTypeForName } from '../../utils/formDataFile';
import { errorMessage } from '../../utils/notify';

export type DeliveryDetails = {
  address: string;
  location: CheckoutLocation | null;
  useCurrentLocation: boolean;
  notes: string;
};

export type PaymentDetailsInput = {
  method: string;
  phone?: string;
  proof?: { uri: string; name: string } | null;
};

export type PlaceOrderResult = {
  orders: PlacedOrderSummary[];
  placedStoreIds: number[];
  failures: Array<{ store_id: number; error: string }>;
  paymentNotices: string[];
  authorizationUrl: string | null;
};

export function groupItemsByStore(items: CartItem[]): Map<number, CartItem[]> {
  const groups = new Map<number, CartItem[]>();
  for (const item of items) {
    const list = groups.get(item.store) ?? [];
    list.push(item);
    groups.set(item.store, list);
  }
  return groups;
}

export type GroceryPreferences = {
  slots: Record<string, DraftSlot | null>;
  substitutionDefault: SubstitutionPreference;
  itemSubstitutions: Record<string, { preference: SubstitutionPreference; substituteProductId?: number | null }>;
};

export async function placeOrder({
  items,
  delivery,
  payment,
  couponCode,
  token,
  grocery,
}: {
  items: CartItem[];
  delivery: DeliveryDetails;
  payment: PaymentDetailsInput;
  couponCode?: string;
  token: string;
  grocery?: GroceryPreferences;
}): Promise<PlaceOrderResult> {
  const groups = groupItemsByStore(items);
  const orders = Array.from(groups, ([storeId, storeItems]) => {
    const isGrocery = storeItems.some((item) => item.vertical === 'groceries');
    const slot = grocery?.slots[String(storeId)] ?? null;
    return {
      store_id: storeId,
      address: delivery.address.trim(),
      location: delivery.location,
      use_current_location: delivery.useCurrentLocation && delivery.location !== null,
      payment_method: payment.method,
      delivery_notes: delivery.notes.trim(),
      ...(isGrocery && slot ? { delivery_slot: { date: slot.date, start: slot.start, end: slot.end } } : {}),
      ...(isGrocery && grocery ? { substitution_preference: grocery.substitutionDefault } : {}),
      order_details: storeItems.map((item) => {
        const substitution = isGrocery ? grocery?.itemSubstitutions[String(item.id)] : undefined;
        return {
          product_id: item.id,
          quantity: item.quantity,
          ...(item.size ? { size: item.size } : {}),
          ...(item.selling_unit ? { selling_unit: item.selling_unit } : {}),
          ...(item.addons?.length ? { addons: item.addons.map((addon) => addon.id) } : {}),
          ...(substitution
            ? {
                substitution_preference: substitution.preference,
                substitute_product_id: substitution.substituteProductId ?? null,
              }
            : {}),
        };
      }),
    };
  });

  const response: CheckoutResponse = await completeMultipleCheckout({
    access_token: token,
    ...(couponCode?.trim() ? { coupon_code: couponCode.trim() } : {}),
    orders,
  });

  const placed = response.orders ?? [];
  const result: PlaceOrderResult = {
    orders: placed,
    placedStoreIds: placed.map((order) => order.store_id),
    failures: (response.errors ?? []).map((entry) => ({ store_id: entry.store_id, error: entry.error })),
    paymentNotices: [],
    authorizationUrl: null,
  };

  if (payment.method && payment.method !== 'cash') {
    for (const order of placed) {
      try {
        const init = await initializePayment(token, {
          amount: Number(order.total),
          currency: order.currency,
          method: payment.method,
          phone: payment.phone || undefined,
          service_type: 'order',
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
