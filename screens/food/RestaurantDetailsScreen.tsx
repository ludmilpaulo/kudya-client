import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, ErrorState, InlineError, LoadingState } from '../../components/kudya';
import { VerticalThemeProvider, useVerticalTheme } from '../../contexts/VerticalThemeContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useAppNavigation, useAppRoute } from '../../navigation/hooks';
import { formatMoney } from '../../utils/money';
import { errorMessage } from '../../utils/notify';
import { fetchStore, fetchStoreDeals } from '../../features/commerce/api';
import { useDeliveryFeeLabel } from '../../features/food/components/FoodStoreCard';
import IconButton from '../../features/food/components/IconButton';
import PromoBanner from '../../features/food/components/PromoBanner';
import RestaurantInfo from '../../features/food/components/RestaurantInfo';
import RestaurantMenu from '../../features/food/components/RestaurantMenu';
import RestaurantReviews from '../../features/food/components/RestaurantReviews';
import ViewCartBar from '../../features/food/components/ViewCartBar';
import { useFoodCart } from '../../features/food/cart';
import {
  storeCurrency,
  storeEta,
  storeImage,
  storeIsOpen,
  storeLogo,
  storeSubtitle,
  storeSupportsPickup,
  toNumber,
  type FoodStore,
} from '../../features/food/format';
import { useCartQuote } from '../../features/checkout/useCartQuote';
import { useRemote } from '../../features/food/useRemote';

type Tab = 'menu' | 'reviews' | 'info';
type IconName = React.ComponentProps<typeof Feather>['name'];

const TABS: Array<{ key: Tab; labelKey: string; fallback: string }> = [
  { key: 'menu', labelKey: 'fdTabMenu', fallback: 'Menu' },
  { key: 'reviews', labelKey: 'fdTabReviews', fallback: 'Reviews' },
  { key: 'info', labelKey: 'fdTabInfo', fallback: 'Info' },
];

function MetaPill({ icon, label }: { icon: IconName; label: string }) {
  const theme = useVerticalTheme();
  return (
    <View style={[styles.pill, { backgroundColor: theme.colors.primarySoft }]}>
      <Feather name={icon} size={13} color={theme.colors.primary} />
      <Text style={[styles.pillText, { color: theme.colors.primaryDark }]}>{label}</Text>
    </View>
  );
}

function StoreSummaryCard({ store }: { store: FoodStore }) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const deliveryFeeLabel = useDeliveryFeeLabel();
  const logo = storeLogo(store);
  const eta = storeEta(store);
  const fee = deliveryFeeLabel(store);
  const minimum = toNumber(store.minimum_order_amount);
  return (
    <Card style={styles.summary}>
      <View style={styles.summaryTop}>
        <View style={[styles.logo, { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.border }]}>
          {logo ? (
            <Image source={{ uri: logo }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <Text style={[styles.logoInitial, { color: theme.colors.primary }]}>{store.name.slice(0, 1)}</Text>
          )}
        </View>
        <View style={styles.summaryText}>
          <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={2}>
            {store.name}
          </Text>
          {storeSubtitle(store) ? (
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{storeSubtitle(store)}</Text>
          ) : null}
          <View style={styles.ratingRow}>
            <Feather name="star" size={13} color={theme.colors.accent} />
            <Text style={[styles.rating, { color: theme.colors.text }]}>
              {store.rating ? store.rating.toFixed(1) : t('fdNew', 'New')}
            </Text>
            {store.rating_count ? (
              <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
                {t('fdRatingsCount', '{count} ratings', { count: store.rating_count })}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
      <View style={styles.pills}>
        <MetaPill
          icon={storeIsOpen(store) ? 'check-circle' : 'moon'}
          label={storeIsOpen(store) ? t('fdOpenNow', 'Open now') : t('fdClosed', 'Closed')}
        />
        {eta ? <MetaPill icon="clock" label={eta} /> : null}
        {fee ? <MetaPill icon="truck" label={fee} /> : null}
        {storeSupportsPickup(store) ? <MetaPill icon="shopping-bag" label={t('fdPickupAvailable', 'Pickup')} /> : null}
        {minimum > 0 ? (
          <MetaPill
            icon="shopping-bag"
            label={t('fdMinOrderValue', 'Min. {amount}', { amount: formatMoney(minimum, storeCurrency(store)) })}
          />
        ) : null}
      </View>
    </Card>
  );
}

function RestaurantDetailsContent() {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const insets = useSafeAreaInsets();
  const { params } = useAppRoute<'RestaurantDetails'>();
  const storeId = Number(params?.storeId);
  const cart = useFoodCart();
  const cartQuote = useCartQuote(cart.items, '', { vertical: 'food' });
  const [tab, setTab] = useState<Tab>('menu');

  const store = useRemote<FoodStore>(() => fetchStore('food', storeId), [storeId]);
  const deals = useRemote(() => fetchStoreDeals('food', storeId), [storeId]);

  const goBack = () => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('FoodHome'));
  const openCart = () => navigation.navigate('Cart', { vertical: 'food' });

  if (store.loading && !store.data) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: theme.colors.background }]}>
        <LoadingState label={t('fdLoadingRestaurant', 'Loading restaurant…')} />
      </View>
    );
  }
  if (!store.data) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background, paddingTop: insets.top + 8 }]}>
        <View style={styles.floatingBack}>
          <IconButton icon="chevron-left" label={t('fdBack', 'Back')} onPress={goBack} />
        </View>
        <ErrorState
          title={t('fdRestaurantError', 'Could not load this restaurant')}
          body={errorMessage(store.error, t('fdTryAgainLater', 'Please try again in a moment.'))}
          retryLabel={t('fdRetry', 'Try again')}
          onRetry={store.reload}
        />
      </View>
    );
  }

  const data = store.data;
  const hero = storeImage(data);
  const open = storeIsOpen(data);
  const deal = deals.error ? null : deals.data?.[0] ?? null;
  const promoTitle = data.promo_text || deal?.title;
  const promoSubtitle = data.promo_text ? null : deal?.description;
  const showCartBar = cart.count > 0;

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        stickyHeaderIndices={[2]}
        contentContainerStyle={{ paddingBottom: insets.bottom + (showCartBar ? 96 : 24) }}
      >
        <View style={styles.hero}>
          {hero ? (
            <Image source={{ uri: hero }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.primary }]} />
          )}
          <View style={[styles.heroBar, { top: insets.top + 8 }]}>
            <IconButton testID="food-store-back" icon="chevron-left" label={t('fdBack', 'Back')} onPress={goBack} />
            <IconButton
              testID="food-store-cart"
              icon="shopping-bag"
              label={t('fdViewCart', 'View cart')}
              badge={cart.count ? Math.ceil(cart.count) : undefined}
              onPress={openCart}
            />
          </View>
        </View>

        <View style={styles.body}>
          <StoreSummaryCard store={data} />
          {!open ? (
            <InlineError message={t('fdStoreClosed', 'This restaurant is closed right now. You can browse the menu.')} />
          ) : null}
          {promoTitle ? <PromoBanner compact title={promoTitle} subtitle={promoSubtitle} /> : null}
        </View>

        <View style={[styles.tabsWrap, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.tabs, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            {TABS.map((item) => {
              const selected = tab === item.key;
              return (
                <Pressable
                  key={item.key}
                  testID={`food-store-tab-${item.key}`}
                  onPress={() => setTab(item.key)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  style={[styles.tab, selected && { backgroundColor: theme.colors.primary }]}
                >
                  <Text style={[styles.tabText, { color: selected ? theme.colors.onPrimary : theme.colors.textMuted }]}>
                    {t(item.labelKey, item.fallback)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.tabBody}>
          {tab === 'menu' ? <RestaurantMenu store={data} /> : null}
          {tab === 'reviews' ? <RestaurantReviews store={data} /> : null}
          {tab === 'info' ? <RestaurantInfo store={data} /> : null}
        </View>
      </ScrollView>

      {showCartBar ? (
        <ViewCartBar
          count={cart.count}
          total={cartQuote.quote && !cartQuote.quote.has_errors ? cartQuote.quote.subtotal : null}
          currency={cartQuote.quote?.currency ?? storeCurrency(data)}
          onPress={openCart}
        />
      ) : null}
    </View>
  );
}

export default function RestaurantDetailsScreen() {
  return (
    <VerticalThemeProvider vertical="food">
      <RestaurantDetailsContent />
    </VerticalThemeProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { justifyContent: 'center' },
  floatingBack: { paddingHorizontal: 16 },
  hero: { height: 220 },
  heroBar: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  body: { paddingHorizontal: 16, marginTop: -36, gap: 12 },
  summary: { gap: 12 },
  summaryTop: { flexDirection: 'row', gap: 12 },
  logo: { width: 60, height: 60, borderRadius: 16, borderWidth: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  logoInitial: { fontSize: 24, fontWeight: '900' },
  summaryText: { flex: 1, gap: 3 },
  name: { fontSize: 20, fontWeight: '900' },
  subtitle: { fontSize: 13 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  rating: { fontSize: 13, fontWeight: '800' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  pillText: { fontSize: 12, fontWeight: '700' },
  tabsWrap: { paddingHorizontal: 16, paddingVertical: 12 },
  tabs: { flexDirection: 'row', borderRadius: 999, borderWidth: 1, padding: 4 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 999 },
  tabText: { fontSize: 14, fontWeight: '800' },
  tabBody: { paddingHorizontal: 16 },
});
