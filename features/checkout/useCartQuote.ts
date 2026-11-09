import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { quoteCart, type CartQuote, type CheckoutLine } from '../marketplace/api/checkoutApi';
import { quoteLines, type KeyedCartLine } from '../food/cartLine';
import { errorMessage } from '../../utils/notify';
import type { MarketplaceVertical } from '../../utils/normalizeStores';

type QuoteableItem = KeyedCartLine & {
  size?: string;
  selling_unit?: string;
};

export type CartQuoteState = {
  quote: CartQuote | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export type CartQuoteOptions = {
  /** `food` prices through `/api/v1/food/checkout/quote/`; omit for the cross-vertical marketplace quote. */
  vertical?: MarketplaceVertical;
  fulfilmentType?: 'delivery' | 'pickup';
  debounceMs?: number;
};

export function cartLines(items: QuoteableItem[]): CheckoutLine[] {
  return quoteLines(items);
}

/** Server-priced cart: the totals shown here are the totals checkout will charge. */
export function useCartQuote(
  items: QuoteableItem[],
  couponCode = '',
  options: CartQuoteOptions | number = {},
): CartQuoteState {
  const { vertical, fulfilmentType, debounceMs = 300 } = typeof options === 'number' ? { debounceMs: options } : options;
  const [quote, setQuote] = useState<CartQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const requestId = useRef(0);

  const lines = useMemo(() => cartLines(items), [items]);
  const key = useMemo(
    () => JSON.stringify([lines, couponCode.trim(), vertical ?? '', fulfilmentType ?? '']),
    [lines, couponCode, vertical, fulfilmentType],
  );

  useEffect(() => {
    if (lines.length === 0) {
      setQuote(null);
      setError(null);
      setLoading(false);
      return;
    }
    const current = ++requestId.current;
    setLoading(true);
    const timer = setTimeout(() => {
      quoteCart(lines, { couponCode: couponCode.trim() || undefined, vertical, fulfilmentType })
        .then((result) => {
          if (current !== requestId.current) return;
          setQuote(result);
          setError(null);
        })
        .catch((err: unknown) => {
          if (current !== requestId.current) return;
          setError(errorMessage(err, 'Could not price your cart. Check your connection and try again.'));
        })
        .finally(() => {
          if (current === requestId.current) setLoading(false);
        });
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [key, nonce, debounceMs]);

  const refresh = useCallback(() => setNonce((value) => value + 1), []);
  return { quote, loading, error, refresh };
}
