import React from 'react';
import { ProductRow } from '../../../components/kudya';
import { useAppNavigation } from '../../../navigation/hooks';
import { useTranslation } from '../../../hooks/useTranslation';
import { formatMoney } from '../../../utils/money';
import { groceryProductImage, type GroceryProduct } from '../../groceries/types';
import { hasDiscount, isOutOfStock, qtyStep, sellingUnit, unitCaption } from '../product';
import { useGroceryCart } from '../useGroceryCart';

/** Search / list row: ProductRow wired to the basket with selling-unit aware steps. */
export default function ProductListItem({ product, currency }: { product: GroceryProduct; currency?: string }) {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const cart = useGroceryCart();
  const unit = sellingUnit(product);
  const discounted = hasDiscount(product);
  const caption = [product.brand, unitCaption(product)].filter(Boolean).join(' · ');
  return (
    <ProductRow
      name={product.name}
      description={caption}
      price={formatMoney(product.price, currency)}
      originalPrice={discounted ? formatMoney(product.original_price, currency) : null}
      image={groceryProductImage(product) || null}
      badge={discounted && product.discount_percentage > 0 ? `-${Math.round(product.discount_percentage)}%` : null}
      quantity={cart.quantityOf(product.id)}
      unitLabel={unit === 'item' ? undefined : unit}
      disabled={isOutOfStock(product)}
      disabledLabel={t('grOutOfStock', 'Out of stock')}
      onPress={() => navigation.navigate('GroceryProductDetails', { productId: product.id })}
      onAdd={() => cart.add(product)}
      onIncrement={() => cart.add(product, { quantity: qtyStep(unit) })}
      onDecrement={() => cart.decrement(product.id)}
    />
  );
}
