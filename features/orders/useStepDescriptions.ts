import { useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import type { FulfilmentType } from '../commerce/api';

/** Friendly one-liners under each tracking step (food + grocery wording). */
export function useStepDescriptions(fulfilment?: FulfilmentType | null) {
  const { t } = useTranslation();
  const pickup = fulfilment === 'pickup';
  return useCallback(
    (key: string): string | undefined => {
      switch (key) {
        case 'placed':
          return t('orStepPlacedBody', 'We have received your order');
        case 'confirmed':
          return t('orStepConfirmedBody', 'The store accepted your order');
        case 'preparing':
          return t('orStepPreparingBody', 'The store is preparing your order');
        case 'picking':
          return t('orStepPickingBody', 'Our shopper is picking your items');
        case 'packed':
          return t('orStepPackedBody', 'Your items are packed and ready');
        case 'ready':
          return pickup
            ? t('orStepReadyPickupBody', 'Your order is ready — collect it at the counter with your PIN')
            : t('orStepReadyBody', 'Waiting for the courier to collect it');
        case 'courier_assigned':
          return t('orStepCourierAssignedBody', 'A courier is heading to the restaurant');
        case 'on_the_way':
          return t('orStepOnTheWayBody', 'Your courier is on the way');
        case 'delivered':
          return pickup ? t('orStepCollectedBody', 'You collected your order. Enjoy!') : t('orStepDeliveredBody', 'Enjoy your order!');
        case 'cancelled':
          return t('orStepCancelledBody', 'This order was cancelled');
        default:
          return undefined;
      }
    },
    [t, pickup],
  );
}

/** Translated step titles keyed by the API step `key`; undefined keeps the API label. */
export function useStepLabels(fulfilment?: FulfilmentType | null) {
  const { t } = useTranslation();
  const pickup = fulfilment === 'pickup';
  return useCallback(
    (key: string): string | undefined => {
      switch (key) {
        case 'placed':
          return t('orStepPlaced', 'Order placed');
        case 'confirmed':
          return t('orStepConfirmed', 'Order confirmed');
        case 'preparing':
          return t('orStepPreparing', 'Preparing your food');
        case 'picking':
          return t('orStepPicking', 'Picking your items');
        case 'packed':
          return t('orStepPacked', 'Packed');
        case 'ready':
          return t('orStepReady', 'Ready for pickup');
        case 'courier_assigned':
          return t('orStepCourierAssigned', 'Courier assigned');
        case 'on_the_way':
          return t('orStepOnTheWay', 'On the way');
        case 'delivered':
          return pickup ? t('orStepCollected', 'Collected') : t('orStepDelivered', 'Delivered');
        case 'cancelled':
          return t('orStepCancelled', 'Cancelled');
        default:
          return undefined;
      }
    },
    [t, pickup],
  );
}
