import {
  FOOD_DELIVERY_STEPS,
  FOOD_PICKUP_STEPS,
  fallbackFoodSteps,
  foodStepKeys,
  isActiveStep,
  isMaskedPhone,
  paymentState,
  stepPosition,
  withCancelledStep,
} from '../steps';

const states = (status: string, fulfilment: 'delivery' | 'pickup') =>
  fallbackFoodSteps(status, fulfilment).map((step) => `${step.key}:${step.state}`);

describe('food order steps', () => {
  it('uses the documented step keys for delivery and pickup', () => {
    expect(foodStepKeys('delivery')).toEqual([
      'placed',
      'confirmed',
      'preparing',
      'ready',
      'courier_assigned',
      'on_the_way',
      'delivered',
    ]);
    expect(foodStepKeys('pickup')).toEqual(['placed', 'confirmed', 'preparing', 'ready', 'delivered']);
    expect(foodStepKeys(undefined)).toBe(FOOD_DELIVERY_STEPS);
  });

  it('marks earlier steps done and the current one active', () => {
    expect(states('courier_assigned', 'delivery')).toEqual([
      'placed:done',
      'confirmed:done',
      'preparing:done',
      'ready:done',
      'courier_assigned:active',
      'on_the_way:pending',
      'delivered:pending',
    ]);
  });

  it('collapses courier legs onto "ready" for pickup orders', () => {
    expect(stepPosition('on_the_way', FOOD_PICKUP_STEPS)).toBe(3);
    expect(states('ready', 'pickup')).toEqual(['placed:done', 'confirmed:done', 'preparing:done', 'ready:active', 'delivered:pending']);
  });

  it('completes every step once delivered and only the first when cancelled', () => {
    expect(fallbackFoodSteps('delivered', 'pickup').every((step) => step.state === 'done')).toBe(true);
    expect(states('cancelled', 'delivery').filter((entry) => entry.endsWith(':done'))).toEqual(['placed:done']);
  });

  it('appends a single cancelled step to cancelled orders', () => {
    const steps = withCancelledStep(fallbackFoodSteps('cancelled', 'delivery'), 'cancelled', '2026-11-08T10:00:00Z');
    expect(steps[steps.length - 1]).toEqual({ key: 'cancelled', label: 'cancelled', state: 'active', at: '2026-11-08T10:00:00Z' });
    expect(withCancelledStep(steps, 'cancelled')).toHaveLength(steps.length);
    expect(withCancelledStep(fallbackFoodSteps('preparing', 'delivery'), 'preparing')).toHaveLength(7);
  });

  it('treats courier_assigned as active and delivered/cancelled as final', () => {
    expect(isActiveStep('courier_assigned')).toBe(true);
    expect(isActiveStep('placed')).toBe(true);
    expect(isActiveStep('delivered')).toBe(false);
    expect(isActiveStep('cancelled')).toBe(false);
    expect(isActiveStep(null)).toBe(false);
  });
});

describe('courier phone and payment state', () => {
  it('never treats a masked phone as callable', () => {
    expect(isMaskedPhone('+27 *** *** 123')).toBe(true);
    expect(isMaskedPhone('+2782•••4567')).toBe(true);
    expect(isMaskedPhone(null)).toBe(true);
    expect(isMaskedPhone('+27 82 123 4567')).toBe(false);
  });

  it('only reports paid when the server says is_paid', () => {
    expect(paymentState({ is_paid: true, payment_method: 'card', payment_status: 'succeeded' })).toBe('paid');
    expect(paymentState({ is_paid: false, payment_method: 'card', payment_status: 'succeeded' })).toBe('pending');
    expect(paymentState({ payment_method: 'card', payment_status: 'pending' })).toBe('pending');
    expect(paymentState({ payment_method: 'cash', payment_status: 'cash_on_delivery' })).toBe('cash');
    expect(paymentState({ payment_method: 'card', payment_status: 'failed' })).toBe('failed');
    expect(paymentState({ payment_method: 'card', payment_status: 'partially_refunded' })).toBe('refunded');
  });
});
