import { useMemo } from 'react';
import { useAppSelector } from '../../redux/store';
import { selectCartItems } from '../../redux/slices/basketSlice';
import type { CartItem } from '../../services/types';

export type FoodCartSummary = { items: CartItem[]; count: number; total: number };

export function useFoodCart(): FoodCartSummary {
  const items = useAppSelector(selectCartItems);
  return useMemo(() => {
    const food = items.filter((item) => item.vertical === 'food');
    return {
      items: food,
      count: food.reduce((sum, item) => sum + item.quantity, 0),
      total: food.reduce((sum, item) => sum + item.price * item.quantity, 0),
    };
  }, [items]);
}

export function linesForProduct(items: CartItem[], productId: number): CartItem[] {
  return items.filter((item) => item.id === productId);
}
