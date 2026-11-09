import React, { useCallback } from 'react';
import { StoreCard, type StoreCardTag } from '../../../components/kudya';
import { useTranslation } from '../../../hooks/useTranslation';
import { formatMoney } from '../../../utils/money';
import {
  storeCurrency,
  storeDistanceLabel,
  storeEta,
  storeImage,
  storeIsOpen,
  storeSubtitle,
  storeSupportsPickup,
  toNumber,
  type FoodStore,
} from '../format';

/** "Free delivery" / "R 25.00" from the server-computed fee; null when the API did not send one. */
export function useDeliveryFeeLabel() {
  const { t } = useTranslation();
  return useCallback(
    (store: FoodStore): string | null => {
      if (store.delivery_fee === null || store.delivery_fee === undefined || store.delivery_fee === '') return null;
      const fee = toNumber(store.delivery_fee);
      return fee > 0 ? formatMoney(fee, storeCurrency(store)) : t('fdFreeDelivery', 'Free delivery');
    },
    [t],
  );
}

type Props = {
  store: FoodStore;
  layout?: 'row' | 'card';
  onPress: (store: FoodStore) => void;
};

export default function FoodStoreCard({ store, layout = 'row', onPress }: Props) {
  const { t } = useTranslation();
  const deliveryFeeLabel = useDeliveryFeeLabel();
  const open = storeIsOpen(store);
  const tags: StoreCardTag[] = [];
  tags.push(
    open
      ? { label: t('fdOpenNow', 'Open now'), icon: 'check-circle', tone: 'success' }
      : { label: t('fdClosed', 'Closed'), icon: 'moon', tone: 'muted' },
  );
  if (storeSupportsPickup(store)) tags.push({ label: t('fdPickupAvailable', 'Pickup'), icon: 'shopping-bag' });
  const distance = storeDistanceLabel(store);
  if (distance) tags.push({ label: distance, icon: 'map-pin', tone: 'muted' });

  return (
    <StoreCard
      testID={`food-store-${store.id}`}
      layout={layout}
      name={store.name}
      image={storeImage(store)}
      subtitle={storeSubtitle(store)}
      rating={store.rating}
      ratingCount={store.rating_count}
      eta={storeEta(store)}
      deliveryFee={deliveryFeeLabel(store)}
      badge={store.promo_text ? t('fdPromo', 'Promo') : null}
      closed={!open}
      closedLabel={t('fdClosed', 'Closed')}
      tags={tags}
      onPress={() => onPress(store)}
    />
  );
}
