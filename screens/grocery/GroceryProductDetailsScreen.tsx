import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Card,
  ErrorState,
  LoadingState,
  OptionRow,
  PriceRow,
  PrimaryButton,
  QtyStepper,
  RatingStars,
  ScreenHeader,
  SectionHeader,
} from '../../components/kudya';
import { useVerticalTheme, withVerticalTheme } from '../../contexts/VerticalThemeContext';
import { useAppNavigation, useAppRoute } from '../../navigation/hooks';
import { useTranslation } from '../../hooks/useTranslation';
import { fetchProduct } from '../../features/commerce/api';
import { mapGroceryProduct, type GroceryProduct } from '../../features/groceries/types';
import { formatMoney } from '../../utils/money';
import { errorMessage, toast } from '../../utils/notify';
import CartButton from '../../features/groceryFlow/components/CartButton';
import ImageGallery from '../../features/groceryFlow/components/ImageGallery';
import {
  extractCurrency,
  extractRating,
  extractVariants,
  hasDiscount,
  isNotFound,
  isOutOfStock,
  plainText,
  qtyStep,
  sellingUnit,
  unitCaption,
  type GroceryVariant,
} from '../../features/groceryFlow/product';
import { useFavouriteToggle } from '../../features/groceryFlow/useFavouriteToggle';
import { useGroceryCart } from '../../features/groceryFlow/useGroceryCart';
import { useRemote } from '../../features/groceryFlow/useRemote';

type Loaded = {
  product: GroceryProduct;
  variants: GroceryVariant[];
  rating: { rating: number | null; count: number };
  currency?: string;
};

async function loadProduct(productId: number): Promise<Loaded> {
  const raw: unknown = await fetchProduct('groceries', productId);
  const product = mapGroceryProduct(raw);
  if (!product) throw new Error('Product unavailable');
  return { product, variants: extractVariants(raw), rating: extractRating(raw), currency: extractCurrency(raw) };
}

function FavouriteButton({ productId, initial }: { productId: number; initial: boolean }) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const { favourite, toggle, busy } = useFavouriteToggle(productId, initial, t('grFavouriteFailed', 'Could not update favourites'));
  return (
    <Pressable
      onPress={() => void toggle()}
      disabled={busy}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityState={{ selected: favourite, busy }}
      accessibilityLabel={favourite ? t('grRemoveFavourite', 'Remove from favourites') : t('grAddFavourite', 'Add to favourites')}
      style={[styles.iconButton, { backgroundColor: theme.colors.primarySoft }]}
    >
      <Feather name="heart" size={18} color={favourite ? theme.colors.error : theme.colors.primary} />
    </Pressable>
  );
}

function ProductBody({ data }: { data: Loaded }) {
  const theme = useVerticalTheme();
  const navigation = useAppNavigation();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const cart = useGroceryCart();
  const { product, variants, rating, currency } = data;
  const unit = sellingUnit(product);
  const step = qtyStep(unit);
  const [variant, setVariant] = useState<GroceryVariant | null>(variants[0] ?? null);
  const [quantity, setQuantity] = useState(step);
  useEffect(() => setQuantity(step), [step]);

  const unitPrice = variant?.price ?? product.price;
  const soldOut = isOutOfStock(product);
  const maxQty = product.stock_quantity > 0 ? product.stock_quantity : Number.POSITIVE_INFINITY;
  const inCart = cart.quantityOf(product.id, variant?.label ?? '');
  const discounted = hasDiscount(product) && !variant?.price;
  const caption = unitCaption(product);
  const description = useMemo(() => plainText(product.description), [product.description]);

  const addToCart = () => {
    cart.add(product, { variant, quantity });
    toast('success', t('grAddedToCart', 'Added to cart'), product.name);
  };

  const info = useMemo(
    () =>
      [
        { label: t('grBrand', 'Brand'), value: product.brand },
        { label: t('grUnit', 'Unit'), value: product.unit !== unit ? product.unit : '' },
        { label: t('grSoldPer', 'Sold per'), value: unit },
        { label: t('grCategory', 'Category'), value: product.category?.name ?? '' },
        {
          label: t('grAvailability', 'Availability'),
          value: soldOut ? t('grOutOfStock', 'Out of stock') : t('grInStock', 'In stock'),
        },
      ].filter((row) => row.value),
    [product, unit, soldOut, t],
  );

  return (
    <>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ImageGallery images={product.images} label={product.name} />
        <View style={styles.body}>
          {product.brand ? <Text style={[styles.brand, { color: theme.colors.primary }]}>{product.brand}</Text> : null}
          <Text style={[styles.name, { color: theme.colors.text }]}>{product.name}</Text>
          {caption ? <Text style={[styles.muted, { color: theme.colors.textMuted }]}>{caption}</Text> : null}
          {rating.rating ? (
            <View style={styles.ratingRow}>
              <RatingStars value={rating.rating} size={14} />
              <Text style={[styles.muted, { color: theme.colors.textMuted }]}>
                {rating.rating.toFixed(1)} {rating.count ? `(${rating.count})` : ''}
              </Text>
            </View>
          ) : null}
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: theme.colors.text }]}>{formatMoney(unitPrice, currency)}</Text>
            {discounted ? (
              <>
                <Text style={[styles.original, { color: theme.colors.textMuted }]}>
                  {formatMoney(product.original_price, currency)}
                </Text>
                {product.discount_percentage > 0 ? (
                  <Text style={[styles.discount, { backgroundColor: theme.colors.primarySoft, color: theme.colors.primaryDark }]}>
                    -{Math.round(product.discount_percentage)}%
                  </Text>
                ) : null}
              </>
            ) : null}
          </View>
          <Pressable
            onPress={() => navigation.navigate('GroceryStoreDetails', { storeId: product.store })}
            accessibilityRole="link"
            style={styles.storeLink}
          >
            <Feather name="shopping-bag" size={14} color={theme.colors.primary} />
            <Text style={[styles.storeText, { color: theme.colors.primary }]}>{product.store_name}</Text>
          </Pressable>

          {variants.length ? (
            <View style={styles.section}>
              <SectionHeader title={t('grSelectVariant', 'Select variant')} />
              <View style={styles.group}>
                {variants.map((option) => (
                  <OptionRow
                    key={option.key}
                    title={option.label}
                    subtitle={formatMoney(option.price ?? product.price, currency)}
                    selected={variant?.key === option.key}
                    onPress={() => setVariant(option)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          <View style={[styles.section, styles.qtyRow]}>
            <View>
              <Text style={[styles.qtyLabel, { color: theme.colors.text }]}>{t('grQuantity', 'Quantity')}</Text>
              {inCart > 0 ? (
                <Text style={[styles.muted, { color: theme.colors.textMuted }]}>
                  {t('grInCart', '{qty} in cart', { qty: inCart })}
                </Text>
              ) : null}
            </View>
            <QtyStepper
              value={quantity}
              unitLabel={unit === 'item' ? undefined : unit}
              disableIncrement={soldOut || quantity + step > maxQty}
              onIncrement={() => setQuantity((value) => Number((value + step).toFixed(3)))}
              onDecrement={() => setQuantity((value) => Math.max(step, Number((value - step).toFixed(3))))}
            />
          </View>

          {description ? (
            <View style={styles.section}>
              <SectionHeader title={t('grDescription', 'Description')} />
              <Text style={[styles.description, { color: theme.colors.text }]}>{description}</Text>
            </View>
          ) : null}

          {info.length ? (
            <Card style={styles.section}>
              <SectionHeader title={t('grProductInformation', 'Product information')} />
              {info.map((row) => (
                <PriceRow key={row.label} label={row.label} value={row.value} />
              ))}
            </Card>
          ) : null}
        </View>
      </ScrollView>
      <View
        style={[
          styles.bar,
          { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border },
        ]}
      >
        <PrimaryButton
          title={soldOut ? t('grOutOfStock', 'Out of stock') : t('grAddToCart', 'Add to Cart')}
          trailing={soldOut ? undefined : formatMoney(unitPrice * quantity, currency)}
          icon="shopping-cart"
          disabled={soldOut}
          onPress={addToCart}
        />
      </View>
    </>
  );
}

function GroceryProductDetailsContent() {
  const theme = useVerticalTheme();
  const navigation = useAppNavigation();
  const { params } = useAppRoute<'GroceryProductDetails'>();
  const { t } = useTranslation();
  const result = useRemote(() => loadProduct(params.productId), [params.productId]);
  const back = navigation.canGoBack() ? () => navigation.goBack() : undefined;
  const product = result.data?.product;

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader
        title={t('grProductDetails', 'Product Details')}
        onBack={back}
        right={
          <>
            {product ? <FavouriteButton productId={product.id} initial={product.is_favourite} /> : null}
            <CartButton />
          </>
        }
      />
      {result.loading && !result.data ? (
        <LoadingState />
      ) : !result.data ? (
        <ErrorState
          title={isNotFound(result.error) ? t('grProductNotFound', 'Product not found') : t('grProductError', "We couldn't load this product")}
          body={errorMessage(result.error, t('grHomeErrorBody', 'Check your connection and try again.'))}
          retryLabel={t('grRetry', 'Try again')}
          onRetry={isNotFound(result.error) ? undefined : result.reload}
        />
      ) : (
        <ProductBody key={result.data.product.id} data={result.data} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: 24 },
  body: { padding: 16, gap: 4 },
  brand: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  name: { fontSize: 22, fontWeight: '800' },
  muted: { fontSize: 13 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  price: { fontSize: 26, fontWeight: '800' },
  original: { fontSize: 15, textDecorationLine: 'line-through' },
  discount: { fontSize: 12, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
  storeLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, alignSelf: 'flex-start' },
  storeText: { fontSize: 13, fontWeight: '700' },
  section: { marginTop: 18 },
  group: { gap: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qtyLabel: { fontSize: 16, fontWeight: '800' },
  description: { fontSize: 14, lineHeight: 21 },
  iconButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  bar: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
});

export default withVerticalTheme(GroceryProductDetailsContent, () => 'groceries');
