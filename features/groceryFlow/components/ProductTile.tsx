import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { QtyStepper } from '../../../components/kudya';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';
import { useAppNavigation } from '../../../navigation/hooks';
import { useTranslation } from '../../../hooks/useTranslation';
import { formatMoney } from '../../../utils/money';
import { groceryProductImage, type GroceryProduct } from '../../groceries/types';
import { hasDiscount, isOutOfStock, qtyStep, sellingUnit, unitCaption } from '../product';
import { useGroceryCart } from '../useGroceryCart';

type Props = { product: GroceryProduct; width?: number | `${number}%`; currency?: string };

/** Grid card used on the grocery home, deals rail and store shop tab. */
export default function ProductTile({ product, width, currency }: Props) {
  const theme = useVerticalTheme();
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const cart = useGroceryCart();
  const quantity = cart.quantityOf(product.id);
  const unit = sellingUnit(product);
  const image = groceryProductImage(product);
  const soldOut = isOutOfStock(product);
  const caption = unitCaption(product);

  return (
    <Pressable
      onPress={() => navigation.navigate('GroceryProductDetails', { productId: product.id })}
      accessibilityRole="button"
      accessibilityLabel={product.name}
      style={({ pressed }) => [
        styles.card,
        { width, backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.imageWrap, { backgroundColor: theme.colors.background }]}>
        {image ? (
          <Image source={{ uri: image }} style={StyleSheet.absoluteFill} contentFit="contain" />
        ) : (
          <Feather name="shopping-bag" size={28} color={theme.colors.primary} />
        )}
        {hasDiscount(product) && product.discount_percentage > 0 ? (
          <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.badgeText}>-{Math.round(product.discount_percentage)}%</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={2}>
        {product.name}
      </Text>
      {caption ? (
        <Text style={[styles.unit, { color: theme.colors.textMuted }]} numberOfLines={1}>
          {caption}
        </Text>
      ) : null}
      <View style={styles.footer}>
        <View style={styles.prices}>
          <Text style={[styles.price, { color: theme.colors.text }]}>{formatMoney(product.price, currency)}</Text>
          {hasDiscount(product) ? (
            <Text style={[styles.original, { color: theme.colors.textMuted }]}>
              {formatMoney(product.original_price, currency)}
            </Text>
          ) : null}
        </View>
        {soldOut ? null : quantity > 0 ? null : (
          <Pressable
            onPress={() => cart.add(product)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={t('grAddNamed', 'Add {name}', { name: product.name })}
            style={[styles.add, { backgroundColor: theme.colors.primary }]}
          >
            <Feather name="plus" size={18} color={theme.colors.onPrimary} />
          </Pressable>
        )}
      </View>
      {soldOut ? (
        <Text style={[styles.soldOut, { color: theme.colors.error }]}>{t('grOutOfStock', 'Out of stock')}</Text>
      ) : quantity > 0 ? (
        <View style={styles.stepper}>
          <QtyStepper
            compact
            value={quantity}
            unitLabel={unit === 'item' ? undefined : unit}
            onIncrement={() => cart.add(product, { quantity: qtyStep(unit) })}
            onDecrement={() => cart.decrement(product.id)}
          />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 10, gap: 4 },
  pressed: { opacity: 0.92 },
  imageWrap: {
    height: 110,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  badge: { position: 'absolute', left: 6, top: 6, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  name: { fontSize: 14, fontWeight: '700', minHeight: 36 },
  unit: { fontSize: 12 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  prices: { flexShrink: 1 },
  price: { fontSize: 15, fontWeight: '800' },
  original: { fontSize: 11, textDecorationLine: 'line-through' },
  add: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  stepper: { alignItems: 'flex-start', marginTop: 6 },
  soldOut: { fontSize: 12, fontWeight: '700', marginTop: 4 },
});
