import { useEffect, useState } from 'react';
import { useAppSelector } from '../../redux/store';
import { selectCheckoutDraft } from '../../redux/slices/checkoutDraftSlice';
import { fetchAddresses } from '../commerce/api';

/** Checkout draft address first, then the signed-in user's default saved address. */
export function useDeliverToLabel(): string | null {
  const draft = useAppSelector(selectCheckoutDraft).address;
  const token = useAppSelector((state) => state.auth.token);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    if (!token || draft) return;
    let active = true;
    fetchAddresses()
      .then((addresses) => {
        const preferred = addresses.find((address) => address.is_default) ?? addresses[0];
        if (active) setSaved(preferred ? preferred.address || preferred.label : null);
      })
      .catch(() => {
        if (active) setSaved(null);
      });
    return () => {
      active = false;
    };
  }, [token, draft]);

  return draft?.address || draft?.label || saved;
}
