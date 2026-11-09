import { useMemo } from "react";
import { useCartQuote } from "../features/checkout/useCartQuote";

type QuoteableCartItem = {
  id: number;
  price: number;
  quantity: number;
  selling_unit?: string;
};

/** Cart subtotal from the server quote, falling back to local prices while it loads. */
export function useGroceryCartQuote(items: QuoteableCartItem[]) {
  const { quote } = useCartQuote(items);
  return useMemo(() => {
    const localSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return {
      subtotal: quote ? Number(quote.subtotal) : localSubtotal,
      usedServerQuote: quote !== null,
    };
  }, [items, quote]);
}
