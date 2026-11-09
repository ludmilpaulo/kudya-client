import React, { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import {
  Chip,
  EmptyState,
  ErrorState,
  InlineError,
  LoadingState,
  SearchBar,
  SectionHeader,
  StoreCard,
} from '../../components/kudya';
import { useVerticalTheme, withVerticalTheme } from '../../contexts/VerticalThemeContext';
import { useAppNavigation } from '../../navigation/hooks';
import { useTranslation } from '../../hooks/useTranslation';
import { useGetGroceryHomeQuery } from '../../redux/api/groceriesApi';
import { selectCheckoutDraft } from '../../redux/slices/checkoutDraftSlice';
import { fetchStores, type StoreSummary } from '../../features/commerce/api';
import { parseGroceryCategoryHref, type GroceryBanner } from '../../features/groceries/types';
import { formatMoney } from '../../utils/money';
import { errorMessage } from '../../utils/notify';
import CartButton from '../../features/groceryFlow/components/CartButton';
import CategoryTile from '../../features/groceryFlow/components/CategoryTile';
import CountdownPill from '../../features/groceryFlow/components/CountdownPill';
import ProductGrid from '../../features/groceryFlow/components/ProductGrid';
import ProductTile from '../../features/groceryFlow/components/ProductTile';
import PromoBanner from '../../features/groceryFlow/components/PromoBanner';
import { storeEta, storeImage } from '../../features/groceryFlow/product';
import { useRemote } from '../../features/groceryFlow/useRemote';

function HomeHeader({ query, onQuery, onSubmit }: { query: string; onQuery: (v: string) => void; onSubmit: () => void }) {
  const theme = useVerticalTheme();
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const draft = useSelector(selectCheckoutDraft);
  const location = draft.address?.label || draft.address?.address || t('grSetLocation', 'Set delivery location');
  return (
    <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: theme.colors.primary }]}>
      <View style={styles.headerRow}>
        <Pressable
          style={styles.location}
          onPress={() => navigation.navigate('LocationSetup', { vertical: 'groceries', next: 'GroceryHome' })}
          accessibilityRole="button"
          accessibilityLabel={t('grChangeLocation', 'Change delivery location')}
        >
          <Feather name="map-pin" size={18} color={theme.colors.onPrimary} />
          <View style={styles.locationText}>
            <Text style={styles.deliverTo}>{t('grDeliverTo', 'Deliver to')}</Text>
            <View style={styles.locationLine}>
              <Text style={styles.locationValue} numberOfLines={1}>
                {location}
              </Text>
              <Feather name="chevron-down" size={16} color={theme.colors.onPrimary} />
            </View>
          </View>
        </Pressable>
        <CartButton tone="brand" />
      </View>
      <SearchBar
        value={query}
        onChangeText={onQuery}
        onSubmit={onSubmit}
        placeholder={t('grSearchPlaceholder', 'Search for groceries, brands…')}
      />
    </View>
  );
}

function StoresRail() {
  const theme = useVerticalTheme();
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const stores = useRemote(() => fetchStores('groceries', { ordering: '-rating' }), []);
  const fee = (store: StoreSummary) =>
    store.delivery_fee == null
      ? null
      : Number(store.delivery_fee) === 0
        ? t('grFreeDelivery', 'Free delivery')
        : formatMoney(store.delivery_fee);
  return (
    <View style={styles.section}>
      <SectionHeader title={t('grStoresNearYou', 'Stores near you')} />
      {stores.loading && !stores.data ? (
        <LoadingState />
      ) : stores.error ? (
        <View style={styles.inlineGap}>
          <InlineError message={errorMessage(stores.error, t('grStoresError', 'Could not load stores.'))} />
          <Chip label={t('grRetry', 'Try again')} icon="refresh-cw" onPress={stores.reload} />
        </View>
      ) : !stores.data?.length ? (
        <Text style={[styles.muted, { color: theme.colors.textMuted }]}>{t('grNoStores', 'No grocery stores deliver here yet.')}</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
          {stores.data.map((store) => (
            <StoreCard
              key={store.id}
              layout="card"
              name={store.name}
              image={storeImage(store)}
              subtitle={store.promo_text || store.address}
              rating={store.rating}
              ratingCount={store.rating_count}
              eta={storeEta(store)}
              deliveryFee={fee(store)}
              closed={store.is_open === false}
              onPress={() => navigation.navigate('GroceryStoreDetails', { storeId: store.id })}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function GroceryHomeContent() {
  const theme = useVerticalTheme();
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const home = useGetGroceryHomeQuery();
  const data = home.data;
  const banners: GroceryBanner[] = data ? [...data.hero, ...data.promotions] : [];
  const bannerWidth = Math.min(width - 32, 520);

  const openBanner = (banner: GroceryBanner) => {
    const slug = parseGroceryCategoryHref(banner.cta_href);
    navigation.navigate('GroceryProductSearch', slug ? { categorySlug: slug, title: banner.title } : { title: banner.title });
  };
  const submitSearch = () => {
    const value = query.trim();
    if (value) navigation.navigate('GroceryProductSearch', { query: value });
  };
  const isEmpty =
    !!data && !banners.length && !data.categories.length && !data.popular_products.length && !data.deals.length;

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <HomeHeader query={query} onQuery={setQuery} onSubmit={submitSearch} />
      {home.isLoading ? (
        <LoadingState label={t('grLoadingHome', 'Loading groceries…')} />
      ) : home.isError ? (
        <ErrorState
          title={t('grHomeError', "We couldn't load groceries")}
          body={t('grHomeErrorBody', 'Check your connection and try again.')}
          retryLabel={t('grRetry', 'Try again')}
          onRetry={() => void home.refetch()}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={home.isFetching} onRefresh={() => void home.refetch()} tintColor={theme.colors.primary} />
          }
        >
          <View style={styles.switcher}>
            <Chip label={t('grGroceries', 'Groceries')} icon="shopping-bag" selected />
            <Chip label={t('grFood', 'Food')} icon="coffee" onPress={() => navigation.navigate('FoodHome')} />
          </View>

          {isEmpty ? (
            <EmptyState
              icon="shopping-bag"
              title={t('grHomeEmpty', 'No groceries available yet')}
              body={t('grHomeEmptyBody', 'Stores near you have not published products yet. Check back soon.')}
            />
          ) : null}

          {banners.length ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rail}
              snapToInterval={bannerWidth + 12}
              decelerationRate="fast"
            >
              {banners.map((banner) => (
                <PromoBanner
                  key={`${banner.kind}-${banner.id}`}
                  width={bannerWidth}
                  title={banner.title}
                  subtitle={banner.subtitle || banner.body}
                  badge={banner.badge}
                  image={banner.image}
                  ctaLabel={banner.cta_label || t('grShopNow', 'Shop now')}
                  onPress={() => openBanner(banner)}
                />
              ))}
            </ScrollView>
          ) : null}

          {data?.categories.length ? (
            <View style={styles.section}>
              <SectionHeader
                title={t('grShopByCategory', 'Shop by Category')}
                actionLabel={t('grViewAll', 'View all')}
                onAction={() => navigation.navigate('GroceryCategories')}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
                {data.categories.map((category) => (
                  <CategoryTile
                    key={category.id}
                    category={category}
                    onPress={() =>
                      navigation.navigate('GroceryProductSearch', { categorySlug: category.slug, title: category.name })
                    }
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}

          <StoresRail />

          {data?.deals.length ? (
            <View style={styles.section}>
              <SectionHeader title={data.deals_title || t('grDealsOfWeek', 'Deals of the week')} />
              <CountdownPill endAt={data.deals_end_at} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.rail, styles.railTop]}>
                {data.deals.map((product) => (
                  <ProductTile key={product.id} product={product} width={160} />
                ))}
              </ScrollView>
            </View>
          ) : null}

          {data?.popular_products.length ? (
            <View style={styles.section}>
              <SectionHeader
                title={t('grPopularProducts', 'Popular products')}
                actionLabel={t('grViewAll', 'View all')}
                onAction={() => navigation.navigate('GroceryProductSearch', { title: t('grPopularProducts', 'Popular products') })}
              />
              <ProductGrid products={data.popular_products} />
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16, gap: 14, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  location: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  locationText: { flex: 1 },
  deliverTo: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },
  locationLine: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationValue: { color: '#fff', fontSize: 15, fontWeight: '800', flexShrink: 1 },
  content: { padding: 16, paddingBottom: 40, gap: 8 },
  switcher: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  section: { marginTop: 18 },
  rail: { gap: 12, paddingRight: 16 },
  railTop: { marginTop: 12 },
  inlineGap: { gap: 10, alignItems: 'flex-start' },
  muted: { fontSize: 13 },
});

export default withVerticalTheme(GroceryHomeContent, () => 'groceries');
