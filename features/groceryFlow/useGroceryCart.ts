import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { addItem, removeItem, selectCartItems, setItemQuantity } from '../../redux/slices/basketSlice';
import type { GroceryProduct } from '../groceries/types';
import { groceryProductImage } from '../groceries/types';
import { isFractionalUnit, qtyStep, sellingUnit, type GroceryVariant } from './product';

export function useGroceryCart() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const groceryItems = useMemo(() => items.filter((item) => item.vertical === 'groceries'), [items]);

  const quantityOf = useCallback(
    (productId: number, size = '') =>
      items.find((item) => item.id === productId && (item.size || '') === size)?.quantity ?? 0,
    [items],
  );

  const add = useCallback(
    (product: GroceryProduct, options: { variant?: GroceryVariant | null; quantity?: number } = {}) => {
      const unit = sellingUnit(product);
      dispatch(
        addItem({
          id: product.id,
          name: product.name,
          price: options.variant?.price ?? product.price,
          image: groceryProductImage(product),
          size: options.variant?.label ?? '',
          quantity: options.quantity ?? qtyStep(unit),
          store: product.store,
          store_name: product.store_name,
          vertical: 'groceries',
          selling_unit: unit,
          allows_fractional: isFractionalUnit(unit),
        }),
      );
    },
    [dispatch],
  );

  const decrement = useCallback(
    (productId: number, size = '') => dispatch(removeItem({ id: productId, size })),
    [dispatch],
  );

  const setQuantity = useCallback(
    (productId: number, size: string, quantity: number) => dispatch(setItemQuantity({ id: productId, size, quantity })),
    [dispatch],
  );

  return { items, groceryItems, count: groceryItems.length, quantityOf, add, decrement, setQuantity };
}
