import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState, ErrorState, LoadingState, SearchBar, SectionHeader } from '../../components/kudya';
import { VerticalThemeProvider, useVerticalTheme } from '../../contexts/VerticalThemeContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useAppNavigation } from '../../navigation/hooks';
import { errorMessage } from '../../utils/notify';
import { fetchCuisines, fetchStoreDeals, fetchStores, type Cuisine } from '../../features/commerce/api';
import FoodStoreCard from '../../features/food/components/FoodStoreCard';
import IconButton from '../../features/food/components/IconButton';
import PromoBanner from '../../features/food/components/PromoBanner';
import VerticalTabs from '../../features/food/components/VerticalTabs';
import { useFoodCart } from '../../features/food/cart';
import { absoluteUrl, storeImage, type FoodStore } from '../../features/food/format';
import { useDeliverToLabel } from '../../features/food/useDeliverToLabel';
import { useFoodLocation } from '../../features/food/useFoodLocation';
import { useRemote } from '../../features/food/useRemote';

const POPULAR_LIMIT = 10;

function CuisineTile({ cuisine, onPress }: { cuisine: Cuisine; onPress: () => void }) {
  const theme = useVerticalTheme();
  const image = absoluteUrl(cuisine.image);
  return (
    <Pressable
      testID={`food-cuisine-${cuisine.slug}`}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={cuisine.name}
      style={styles.cuisine}
    >
      <View style={[styles.cuisineImage, { backgroundColor: theme.colors.primarySoft }]}>
        {image ? (
          <Image source={{ uri: image }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <Text style={[styles.cuisineInitial, { color: theme.colors.primary }]}>{cuisine.name.slice(0, 1)}</Text>
        )}
      </View>
      <Text style={[styles.cuisineLabel, { color: theme.colors.text }]} numberOfLines={1}>
        {cuisine.name}
      </Text>
    </Pressable>
  );
}

function FoodHomeContent() {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const insets = useSafeAreaInsets();
  const cart = useFoodCart();
  const deliverTo = useDeliverToLabel();
  const [search, setSearch] = useState('');

  const location = useFoodLocation();
  const all = useRemote<FoodStore[]>(
    () => fetchStores('food', location ? { lat: location.latitude, lng: location.longitude } : {}),
    [location?.latitude, location?.longitude],
  );
  const popular = useRemote<FoodStore[]>(() => fetchStores('food', { ordering: '-rating' }), []);
  const cuisines = useRemote(() => fetchCuisines(), []);

  const popularStores = useMemo(() => (popular.data ?? []).slice(0, POPULAR_LIMIT), [popular.data]);
  const promoStore = useMemo(
    () => [...popularStores, ...(all.data ?? [])].find((store) => store.promo_text),
    [popularStores, all.data],
  );
  const dealStore = promoStore ? null : popularStores[0] ?? null;
  const deals = useRemote(
    () => (dealStore ? fetchStoreDeals('food', dealStore.id) : Promise.resolve([])),
    [dealStore?.id],
  );
  const deal = deals.error ? null : deals.data?.[0] ?? null;

  const openStore = (store: FoodStore) => navigation.navigate('RestaurantDetails', { storeId: store.id });
  const submitSearch = () => {
    const query = search.trim();
    navigation.navigate('RestaurantList', query ? { query } : undefined);
  };
  const refresh = () => {
    all.reload();
    popular.reload();
    cuisines.reload();
  };

  const renderPromo = () => {
    if (promoStore) {
      return (
        <PromoBanner
          testID="food-home-promo"
          title={promoStore.promo_text ?? ''}
          subtitle={promoStore.name}
          image={storeImage(promoStore)}
          ctaLabel={t('fdOrderNow', 'Order now')}
          onPress={() => openStore(promoStore)}
        />
      );
    }
    if (deal && dealStore) {
      return (
        <PromoBanner
          testID="food-home-promo"
          title={deal.title}
          subtitle={deal.description || dealStore.name}
          image={absoluteUrl(deal.product?.image) ?? storeImage(dealStore)}
          ctaLabel={t('fdOrderNow', 'Order now')}
          onPress={() => openStore(dealStore)}
        />
      );
    }
    return null;
  };

  const renderStores = () => {
    if (all.loading && !all.data) return <LoadingState label={t('fdLoadingRestaurants', 'Finding restaurants…')} />;
    if (all.error && !all.data) {
      return (
        <ErrorState
          title={t('fdRestaurantsError', 'Could not load restaurants')}
          body={errorMessage(all.error, t('fdTryAgainLater', 'Please try again in a moment.'))}
          retryLabel={t('fdRetry', 'Try again')}
          onRetry={refresh}
        />
      );
    }
    const stores = all.data ?? [];
    if (!stores.length) {
      return (
        <EmptyState
          icon="coffee"
          title={t('fdNoRestaurants', 'No restaurants yet')}
          body={t('fdNoRestaurantsBody', 'Restaurants delivering to you will appear here.')}
        />
      );
    }
    return (
      <>
        {popularStores.length ? (
          <View style={styles.section}>
            <View style={styles.padded}>
              <SectionHeader
                title={t('fdPopularRestaurants', 'Popular restaurants')}
                actionLabel={t('fdSeeAll', 'See all')}
                onAction={() => navigation.navigate('RestaurantList', { sort: 'rating' })}
              />
            </View>
            <FlatList
              horizontal
              data={popularStores}
              keyExtractor={(store) => String(store.id)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontal}
              renderItem={({ item }) => <FoodStoreCard store={item} layout="card" onPress={openStore} />}
            />
          </View>
        ) : null}
        <View style={[styles.section, styles.padded]}>
          <SectionHeader
            title={t('fdAllRestaurants', 'All restaurants')}
            actionLabel={t('fdSeeAll', 'See all')}
            onAction={() => navigation.navigate('RestaurantList')}
          />
          <View style={styles.list}>
            {stores.map((store) => (
              <FoodStoreCard key={store.id} store={store} onPress={openStore} />
            ))}
          </View>
        </View>
      </>
    );
  };

  const promo = renderPromo();

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: theme.colors.primary }]}>
        <View style={styles.headerRow}>
          <Pressable
            testID="food-home-location"
            onPress={() => navigation.navigate('LocationSetup', { vertical: 'food', next: 'FoodHome' })}
            accessibilityRole="button"
            accessibilityLabel={t('fdChangeLocation', 'Change delivery location')}
            style={styles.location}
          >
            <Text style={styles.deliverTo}>{t('fdDeliverTo', 'Deliver to')}</Text>
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={14} color={theme.colors.onPrimary} />
              <Text style={[styles.locationText, { color: theme.colors.onPrimary }]} numberOfLines={1}>
                {deliverTo || t('fdSetLocation', 'Set your delivery location')}
              </Text>
              <Feather name="chevron-down" size={16} color={theme.colors.onPrimary} />
            </View>
          </Pressable>
          <IconButton
            testID="food-home-cart"
            tone="onBrand"
            icon="shopping-bag"
            label={t('fdViewCart', 'View cart')}
            badge={cart.count ? Math.ceil(cart.count) : undefined}
            onPress={() => navigation.navigate('Cart', { vertical: 'food' })}
          />
          <IconButton
            testID="food-home-notifications"
            tone="onBrand"
            icon="bell"
            label={t('fdNotifications', 'Notifications')}
            onPress={() => navigation.navigate('Notifications')}
          />
        </View>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          onSubmit={submitSearch}
          placeholder={t('fdSearchPlaceholder', 'Search restaurants or dishes')}
        />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        refreshControl={
          <RefreshControl refreshing={all.loading && !!all.data} onRefresh={refresh} tintColor={theme.colors.primary} />
        }
      >
        <View style={[styles.padded, styles.section]}>
          <VerticalTabs />
        </View>
        {promo ? <View style={[styles.padded, styles.section]}>{promo}</View> : null}
        {cuisines.data?.length ? (
          <View style={styles.section}>
            <View style={styles.padded}>
              <SectionHeader title={t('fdCuisines', 'Cuisines')} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontal}>
              {cuisines.data.map((cuisine) => (
                <CuisineTile
                  key={cuisine.id}
                  cuisine={cuisine}
                  onPress={() => navigation.navigate('RestaurantList', { cuisine: cuisine.slug })}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}
        {renderStores()}
      </ScrollView>
    </View>
  );
}

export default function FoodHomeScreen() {
  return (
    <VerticalThemeProvider vertical="food">
      <FoodHomeContent />
    </VerticalThemeProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16, gap: 14, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  location: { flex: 1 },
  deliverTo: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  locationText: { flexShrink: 1, fontSize: 15, fontWeight: '800' },
  padded: { paddingHorizontal: 16 },
  section: { marginTop: 18 },
  horizontal: { gap: 12, paddingHorizontal: 16 },
  list: { gap: 10 },
  cuisine: { width: 72, alignItems: 'center', gap: 6 },
  cuisineImage: { width: 64, height: 64, borderRadius: 32, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  cuisineInitial: { fontSize: 22, fontWeight: '800' },
  cuisineLabel: { fontSize: 12, fontWeight: '700' },
});
