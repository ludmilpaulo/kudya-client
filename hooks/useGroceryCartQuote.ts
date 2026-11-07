import { useEffect, useMemo, useState } from "react";
import { useQuoteGroceryLinesMutation } from "../redux/api/groceryApi";

type QuoteableCartItem = {
  id: number;
  price: number;
  quantity: number;
  selling_unit?: string;
};

function groceryKey(items: QuoteableCartItem[]): string {
  return items
    .filter((item) => item.selling_unit)
    .map((item) => `${item.id}:${item.quantity}`)
    .join("|");
}

export function useGroceryCartQuote(items: QuoteableCartItem[]) {
  const [quoteGroceryLines] = useQuoteGroceryLinesMutation();
  const [quotedGrocerySubtotal, setQuotedGrocerySubtotal] = useState<number | null>(null);
  const key = groceryKey(items);

  useEffect(() => {
    const groceryItems = items.filter((item) => item.selling_unit);
    if (groceryItems.length === 0) {
      setQuotedGrocerySubtotal(null);
      return;
    }
    let cancelled = false;
    void quoteGroceryLines({
      lines: groceryItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
    })
      .unwrap()
      .then((result) => {
        if (!cancelled) setQuotedGrocerySubtotal(Number(result.subtotal));
      })
      .catch(() => {
        if (!cancelled) setQuotedGrocerySubtotal(null);
      });
    return () => {
      cancelled = true;
    };
  }, [key, items, quoteGroceryLines]);

  return useMemo(() => {
    const groceryItems = items.filter((item) => item.selling_unit);
    const otherSubtotal = items
      .filter((item) => !item.selling_unit)
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
    const groceryFallback = groceryItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    return {
      subtotal: otherSubtotal + (quotedGrocerySubtotal ?? groceryFallback),
      usedServerQuote: quotedGrocerySubtotal !== null,
    };
  }, [items, quotedGrocerySubtotal]);
}
