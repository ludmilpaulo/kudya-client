import type { FulfilmentType, OrderStep } from '../commerce/api';

export type StepKey =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'picking'
  | 'packed'
  | 'ready'
  | 'courier_assigned'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled';

/** Customer-facing food steps (docs/api/FOOD.md); pickup orders skip the courier legs. */
export const FOOD_DELIVERY_STEPS: readonly StepKey[] = [
  'placed',
  'confirmed',
  'preparing',
  'ready',
  'courier_assigned',
  'on_the_way',
  'delivered',
];
export const FOOD_PICKUP_STEPS: readonly StepKey[] = ['placed', 'confirmed', 'preparing', 'ready', 'delivered'];

export const ACTIVE_STEP_KEYS: readonly StepKey[] = [
  'placed',
  'confirmed',
  'preparing',
  'picking',
  'packed',
  'ready',
  'courier_assigned',
  'on_the_way',
];

export function isActiveStep(status: string | null | undefined): boolean {
  return !!status && (ACTIVE_STEP_KEYS as readonly string[]).includes(status);
}

export function foodStepKeys(fulfilment: FulfilmentType | null | undefined): readonly StepKey[] {
  return fulfilment === 'pickup' ? FOOD_PICKUP_STEPS : FOOD_DELIVERY_STEPS;
}

/** Index of `status` within `keys`; courier legs collapse onto `ready` for pickup orders (backend `_step_position`). */
export function stepPosition(status: string, keys: readonly string[]): number {
  let key = status;
  if (!keys.includes(key) && (key === 'courier_assigned' || key === 'on_the_way')) key = 'ready';
  const index = keys.indexOf(key);
  return index >= 0 ? index : 0;
}

/** Same state rules as the backend, used when an older payload has no `steps`. */
export function fallbackFoodSteps(status: string, fulfilment: FulfilmentType | null | undefined): OrderStep[] {
  const keys = foodStepKeys(fulfilment);
  const position = stepPosition(status, keys);
  return keys.map((key, index) => {
    let state: OrderStep['state'];
    if (status === 'cancelled') state = index === 0 ? 'done' : 'pending';
    else if (status === 'delivered' || index < position) state = 'done';
    else if (index === position) state = 'active';
    else state = 'pending';
    return { key, label: key, state, at: null };
  });
}

/** Cancelled orders end with an explicit `cancelled` step so the timeline does not look stalled. */
export function withCancelledStep(steps: OrderStep[], status: string, at: string | null = null): OrderStep[] {
  if (status !== 'cancelled' || steps.some((step) => step.key === 'cancelled')) return steps;
  return [...steps, { key: 'cancelled', label: 'cancelled', state: 'active', at }];
}

/** Courier phones arrive masked (e.g. "+27 *** *** 123"); never offer to dial them. */
export function isMaskedPhone(phone: string | null | undefined): boolean {
  if (!phone) return true;
  return /[*•]|x{2,}/i.test(phone);
}

export type PaymentState = 'paid' | 'cash' | 'refunded' | 'failed' | 'pending';

/** "Paid" only when the server says `is_paid`; everything else is pending, cash, failed or refunded. */
export function paymentState(order: { is_paid?: boolean; payment_method: string; payment_status?: string | null }): PaymentState {
  if (order.is_paid) return 'paid';
  const status = (order.payment_status ?? '').toLowerCase();
  if (status.includes('refund')) return 'refunded';
  if (status === 'failed' || status === 'cancelled' || status === 'expired') return 'failed';
  if (order.payment_method === 'cash' || status === 'cash_on_delivery') return 'cash';
  return 'pending';
}
