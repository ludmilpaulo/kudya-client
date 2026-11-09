import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Chip, EmptyState, ErrorState, LoadingState, ProductRow, SearchBar } from '../../../components/kudya';
import { useTranslation } from '../../../hooks/useTranslation';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { useAppNavigation } from '../../../navigation/hooks';
import { addItem, removeItem } from '../../../redux/slices/basketSlice';
import { useAppDispatch } from '../../../redux/store';
import { formatMoney } from '../../../utils/money';
import { errorMessage, toast } from '../../../utils/notify';
import { fetchStoreProducts } from '../../commerce/api';
import { linesForProduct, useFoodCart } from '../cart';
import {
  needsCustomisation,
  plainText,
  productCategoryName,
  productCurrency,
  productDiscountBadge,
  productImage,
  productPrice,
  productStrikePrice,
  storeIsOpen,
  type FoodProduct,
  type FoodStore,
} from '../format';
import { useRemote } from '../useRemote';

const POPULAR = '__popular__';
const POPULAR_FALLBACK_SIZE = 6;

function popularProducts(products: FoodProduct[]): FoodProduct[] {
  const highlighted = products.filter((product) => product.on_sale || product.is_featured);
  return highlighted.length ? highlighted : products.slice(0, POPULAR_FALLBACK_SIZE);
}

export default function RestaurantMenu({ store }: { store: FoodStore }) {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const dispatch = useAppDispatch();
  const cart = useFoodCart();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>(POPULAR);
  const query = useDebouncedValue(search.trim(), 300);
  const open = storeIsOpen(store);

  const { data, loading, error, reload } = useRemote<FoodProduct[]>(
    () => fetchStoreProducts('food', store.id, query || undefined),
    [store.id, query],
  );
  const products = useMemo(() => data ?? [], [data]);

  const categories = useMemo(() => {
    const names: string[] = [];
    for (const product of products) {
      const name = productCategoryName(product);
      if (name && !names.includes(name)) names.push(name);
    }
    return names;
  }, [products]);

  const visible = useMemo(() => {
    if (query) return products;
    if (category === POPULAR) return popularProducts(products);
    return products.filter((product) => productCategoryName(product) === category);
  }, [products, category, query]);

  const customise = (product: FoodProduct) =>
    navigation.navigate('ItemCustomise', { productId: product.id, storeId: store.id });

  const addPlain = (product: FoodProduct) => {
    dispatch(
      addItem({
        id: product.id,
        name: product.name,
        price: productPrice(product),
        image: productImage(product) ?? undefined,
        size: '',
        store: store.id,
        store_name: store.name,
        vertical: 'food',
      }),
    );
  };

  const decrement = (product: FoodProduct) => {
    const lines = linesForProduct(cart.items, product.id);
    if (lines.length === 1) {
      dispatch(removeItem({ id: product.id, size: lines[0].size, line_key: lines[0].line_key }));
      return;
    }
    toast('info', t('fdManageInCart', 'Several versions in your cart'), t('fdManageInCartBody', 'Adjust them from the cart.'));
    navigation.navigate('Cart', { vertical: 'food' });
  };

  const renderBody = () => {
    if (loading && !data) return <LoadingState label={t('fdLoadingMenu', 'Loading menu…')} />;
    if (error) {
      return (
        <ErrorState
          title={t('fdMenuError', 'Could not load the menu')}
          body={errorMessage(error, t('fdTryAgainLater', 'Please try again in a moment.'))}
          retryLabel={t('fdRetry', 'Try again')}
          onRetry={reload}
        />
      );
    }
    if (!visible.length) {
      return (
        <EmptyState
          icon="book-open"
          title={query ? t('fdNoDishesMatch', 'No dishes match your search') : t('fdNoMenu', 'No menu items yet')}
          body={query ? t('fdTryAnotherSearch', 'Try another search term.') : undefined}
        />
      );
    }
    return (
      <View style={styles.list}>
        {visible.map((product) => {
          const custom = needsCustomisation(product);
          const quantity = linesForProduct(cart.items, product.id).reduce((sum, line) => sum + line.quantity, 0);
          const strike = productStrikePrice(product);
          const currency = productCurrency(product, store);
          const unavailable = product.is_purchasable === false;
          return (
            <ProductRow
              key={product.id}
              testID={`food-product-${product.id}`}
              name={product.name}
              description={plainText(product.short_description || product.description)}
              price={formatMoney(productPrice(product), currency)}
              originalPrice={strike ? formatMoney(strike, currency) : null}
              image={productImage(product)}
              badge={productDiscountBadge(product)}
              quantity={quantity}
              disabled={!open || unavailable}
              disabledLabel={!open ? t('fdClosed', 'Closed') : t('fdUnavailable', 'Unavailable')}
              onPress={() => customise(product)}
              onAdd={() => (custom ? customise(product) : addPlain(product))}
              onIncrement={() => (custom ? customise(product) : addPlain(product))}
              onDecrement={() => decrement(product)}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.wrap}>
      <SearchBar value={search} onChangeText={setSearch} placeholder={t('fdSearchMenu', 'Search the menu')} />
      {!query && products.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          <Chip
            testID="food-menu-popular"
            icon="trending-up"
            label={t('fdPopular', 'Popular')}
            selected={category === POPULAR}
            onPress={() => setCategory(POPULAR)}
          />
          {categories.map((name) => (
            <Chip key={name} label={name} selected={category === name} onPress={() => setCategory(name)} />
          ))}
        </ScrollView>
      ) : null}
      {renderBody()}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  tabs: { gap: 8, paddingRight: 8 },
  list: { gap: 10 },
});
