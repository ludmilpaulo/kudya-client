import { useCallback, useState } from 'react';
import { reorder, type ReorderLine, type Vertical } from '../commerce/api';
import { addItem } from '../../redux/slices/basketSlice';
import { useAppDispatch } from '../../redux/store';
import { useAppNavigation } from '../../navigation/hooks';
import { useTranslation } from '../../hooks/useTranslation';
import { errorMessage, notify, toast } from '../../utils/notify';
import { addonsTotal, configurationLabel } from '../food/addons';
import { cartLineKey, normalizeInstructions } from '../food/cartLine';

const FRACTIONAL_UNITS = ['kg', 'l'];

function toCartItem(line: ReorderLine, fallbackVertical?: Vertical) {
  const unit = (line.selling_unit || '').toLowerCase();
  const addons = (line.addons ?? []).map((addon) => ({ id: addon.id, name: addon.name, price: Number(addon.price) || 0 }));
  const note = normalizeInstructions(line.special_instructions);
  const customised = addons.length > 0 || note !== '';
  return {
    id: line.product_id,
    name: line.name,
    price: (Number(line.price) || 0) + addonsTotal(addons),
    image: line.image ?? undefined,
    size: configurationLabel(null, addons),
    quantity: line.quantity,
    store: line.store,
    store_name: line.store_name,
    vertical: line.vertical ?? fallbackVertical,
    selling_unit: line.selling_unit || undefined,
    allows_fractional: FRACTIONAL_UNITS.includes(unit) || !Number.isInteger(line.quantity),
    ...(addons.length ? { addons } : {}),
    ...(note ? { special_instructions: note } : {}),
    ...(customised
      ? {
          line_key: cartLineKey(
            line.product_id,
            addons.map((addon) => addon.id),
            note,
          ),
        }
      : {}),
  };
}

/** Re-adds a past order's available lines to the basket and opens the cart. */
export function useReorder() {
  const dispatch = useAppDispatch();
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const [busyId, setBusyId] = useState<number | null>(null);

  const run = useCallback(
    async (orderId: number, vertical?: Vertical | null) => {
      setBusyId(orderId);
      try {
        const result = await reorder(orderId);
        const lines = result.lines ?? [];
        lines.forEach((line) => dispatch(addItem(toCartItem(line, vertical ?? undefined))));
        const unavailable = result.unavailable ?? [];
        if (unavailable.length) {
          notify(
            t('orReorderUnavailableTitle', 'Some items are unavailable'),
            unavailable.map((item) => `• ${item.name}${item.reason ? ` — ${item.reason}` : ''}`).join('\n'),
          );
        }
        if (!lines.length) {
          if (!unavailable.length) toast('info', t('orReorderEmpty', 'Nothing to reorder from this order.'));
          return;
        }
        toast('success', t('orReorderAdded', '{count} items added to your cart', { count: lines.length }));
        const cartVertical = lines[0]?.vertical ?? vertical ?? undefined;
        navigation.navigate('Cart', cartVertical ? { vertical: cartVertical } : undefined);
      } catch (err) {
        toast('error', t('orReorderFailed', 'Could not reorder'), errorMessage(err, t('orTryAgainLater', 'Please try again later.')));
      } finally {
        setBusyId(null);
      }
    },
    [dispatch, navigation, t],
  );

  return { reorder: run, busyId };
}
