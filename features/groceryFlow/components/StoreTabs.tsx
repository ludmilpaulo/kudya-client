import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  Card,
  Chip,
  EmptyState,
  ErrorState,
  InlineError,
  LoadingState,
  PriceRow,
  RatingStars,
  SectionHeader,
} from '../../../components/kudya';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';
import { useAppNavigation } from '../../../navigation/hooks';
import { useTranslation } from '../../../hooks/useTranslation';
import { useGetGroceryProductsQuery } from '../../../redux/api/groceriesApi';
import { formatMoney } from '../../../utils/money';
import { errorMessage } from '../../../utils/notify';
import { fetchStoreDeals, fetchStoreReviews, type StoreDeal, type StoreSummary } from '../../commerce/api';
import type { GroceryCategory } from '../../groceries/types';
import { isNotFound } from '../product';
import { useRemote } from '../useRemote';
import ProductGrid from './ProductGrid';
import { CategoryGlyph } from './CategoryTile';

const STORE_PAGE_SIZE = 40;

function useStoreProducts(storeId: number) {
  return useGetGroceryProductsQuery({ store: storeId, page_size: STORE_PAGE_SIZE });
}

function DealsBanner({ deals, onPress }: { deals: StoreDeal[]; onPress: () => void }) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const best = deals.reduce((max, deal) => {
    const value = Number(deal.discount_value);
    return deal.discount_type.toLowerCase().includes('percent') && Number.isFinite(value) ? Math.max(max, value) : max;
  }, 0);
  const lead = deals[0];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('grWeeklyDeals', 'Weekly Deals')}
      style={[styles.deals, { backgroundColor: theme.colors.primary }]}
    >
      <View style={styles.flex}>
        <Text style={styles.dealsTitle}>{t('grWeeklyDeals', 'Weekly Deals')}</Text>
        <Text style={styles.dealsBody} numberOfLines={2}>
          {best > 0 ? t('grSaveUpTo', 'Save up to {value}%', { value: Math.round(best) }) : lead.title}
        </Text>
        <Text style={styles.dealsCount}>{t('grDealCount', '{count} offers this week', { count: deals.length })}</Text>
      </View>
      <Feather name="tag" size={34} color="rgba(255,255,255,0.9)" />
    </Pressable>
  );
}

export function StoreShopTab({ store }: { store: StoreSummary }) {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const products = useStoreProducts(store.id);
  const deals = useRemote(() => fetchStoreDeals('groceries', store.id), [store.id]);
  const dealRows = deals.data ?? [];
  const openSearch = () => navigation.navigate('GroceryProductSearch', { storeId: store.id, title: store.name });
  return (
    <View style={styles.tab}>
      {dealRows.length ? <DealsBanner deals={dealRows} onPress={openSearch} /> : null}
      {deals.error && !isNotFound(deals.error) ? (
        <InlineError message={errorMessage(deals.error, t('grDealsError', 'Could not load deals.'))} />
      ) : null}
      <View style={styles.chipWrap}>
        <Chip label={t('grSearchThisStore', 'Search this store')} icon="search" onPress={openSearch} />
      </View>
      <SectionHeader title={t('grPopularItems', 'Popular Items')} actionLabel={t('grViewAll', 'View all')} onAction={openSearch} />
      {products.isLoading ? (
        <LoadingState />
      ) : products.isError ? (
        <ErrorState title={t('grSearchError', "We couldn't load products")} retryLabel={t('grRetry', 'Try again')} onRetry={() => void products.refetch()} />
      ) : products.data?.results.length ? (
        <ProductGrid products={products.data.results} />
      ) : (
        <EmptyState icon="shopping-bag" title={t('grStoreNoProducts', 'This store has no products yet')} />
      )}
    </View>
  );
}

export function StoreCategoriesTab({ store }: { store: StoreSummary }) {
  const theme = useVerticalTheme();
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const products = useStoreProducts(store.id);
  const categories = useMemo(() => {
    const map = new Map<string, { category: GroceryCategory; count: number }>();
    for (const product of products.data?.results ?? []) {
      if (!product.category) continue;
      const entry = map.get(product.category.slug);
      if (entry) entry.count += 1;
      else map.set(product.category.slug, { category: product.category, count: 1 });
    }
    return [...map.values()].sort((a, b) => a.category.name.localeCompare(b.category.name));
  }, [products.data]);

  if (products.isLoading) return <LoadingState />;
  if (products.isError) {
    return <ErrorState title={t('grCategoriesError', "We couldn't load categories")} retryLabel={t('grRetry', 'Try again')} onRetry={() => void products.refetch()} />;
  }
  if (!categories.length) return <EmptyState icon="grid" title={t('grNoCategories', 'No categories yet')} />;
  return (
    <View style={styles.tab}>
      {categories.map(({ category, count }) => (
        <Pressable
          key={category.slug}
          accessibilityRole="button"
          accessibilityLabel={category.name}
          onPress={() =>
            navigation.navigate('GroceryProductSearch', { storeId: store.id, categorySlug: category.slug, title: category.name })
          }
          style={[styles.categoryRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <View style={[styles.glyph, { backgroundColor: theme.colors.primarySoft }]}>
            <CategoryGlyph category={category} size={40} />
          </View>
          <Text style={[styles.categoryName, { color: theme.colors.text }]}>{category.name}</Text>
          <Text style={[styles.muted, { color: theme.colors.textMuted }]}>{count}</Text>
          <Feather name="chevron-right" size={18} color={theme.colors.textMuted} />
        </Pressable>
      ))}
    </View>
  );
}

function dayLabel(day: number | string, names: string[]): string {
  if (typeof day === 'number') return names[(day - 1 + 7) % 7] ?? String(day);
  return day;
}

export function StoreInfoTab({ store }: { store: StoreSummary }) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const names = [
    t('grMon', 'Monday'),
    t('grTue', 'Tuesday'),
    t('grWed', 'Wednesday'),
    t('grThu', 'Thursday'),
    t('grFri', 'Friday'),
    t('grSat', 'Saturday'),
    t('grSun', 'Sunday'),
  ];
  const hours = store.opening_hours ?? [];
  return (
    <View style={styles.tab}>
      <Card>
        <SectionHeader title={t('grStoreInfo', 'Store information')} />
        {store.address ? (
          <View style={styles.infoRow}>
            <Feather name="map-pin" size={16} color={theme.colors.primary} />
            <Text style={[styles.infoText, { color: theme.colors.text }]}>{store.address}</Text>
          </View>
        ) : null}
        {store.phone ? (
          <View style={styles.infoRow}>
            <Feather name="phone" size={16} color={theme.colors.primary} />
            <Text style={[styles.infoText, { color: theme.colors.text }]}>{store.phone}</Text>
          </View>
        ) : null}
        {store.minimum_order_amount ? (
          <PriceRow label={t('grMinimumOrder', 'Minimum order')} value={formatMoney(store.minimum_order_amount)} />
        ) : null}
        {store.delivery_fee != null ? (
          <PriceRow label={t('grDeliveryFee', 'Delivery fee')} value={formatMoney(store.delivery_fee)} />
        ) : null}
      </Card>
      <Card>
        <SectionHeader title={t('grOpeningHours', 'Opening hours')} />
        {hours.length ? (
          hours.map((slot, index) => (
            <PriceRow
              key={`${slot.day}-${index}`}
              label={dayLabel(slot.day, names)}
              value={slot.is_closed ? t('grClosed', 'Closed') : `${slot.from_hour} – ${slot.to_hour}`}
              tone={slot.is_closed ? 'muted' : 'default'}
            />
          ))
        ) : (
          <Text style={[styles.muted, { color: theme.colors.textMuted }]}>{t('grNoHours', 'Opening hours not published.')}</Text>
        )}
      </Card>
    </View>
  );
}

export function StoreReviewsTab({ store }: { store: StoreSummary }) {
  const theme = useVerticalTheme();
  const { t, languageCode } = useTranslation();
  const reviews = useRemote(() => fetchStoreReviews('groceries', store.id), [store.id]);
  if (reviews.loading) return <LoadingState />;
  if (reviews.error && !isNotFound(reviews.error)) {
    return <ErrorState title={t('grReviewsError', "We couldn't load reviews")} retryLabel={t('grRetry', 'Try again')} onRetry={reviews.reload} />;
  }
  const rows = reviews.data ?? [];
  return (
    <View style={styles.tab}>
      {store.rating ? (
        <Card style={styles.summary}>
          <Text style={[styles.bigRating, { color: theme.colors.text }]}>{store.rating.toFixed(1)}</Text>
          <RatingStars value={store.rating} size={18} />
          <Text style={[styles.muted, { color: theme.colors.textMuted }]}>
            {t('grRatingCount', '({count} ratings)', { count: store.rating_count })}
          </Text>
        </Card>
      ) : null}
      {rows.length === 0 ? (
        <EmptyState icon="message-square" title={t('grNoReviews', 'No reviews yet')} body={t('grNoReviewsBody', 'Be the first to rate this store after your order.')} />
      ) : (
        rows.map((review) => (
          <Card key={review.id} style={styles.review}>
            <View style={styles.reviewHead}>
              <Text style={[styles.reviewName, { color: theme.colors.text }]}>{review.customer_name}</Text>
              <Text style={[styles.muted, { color: theme.colors.textMuted }]}>
                {new Date(review.created_at).toLocaleDateString(languageCode)}
              </Text>
            </View>
            <RatingStars value={review.rating} size={14} />
            {review.comment ? <Text style={[styles.infoText, { color: theme.colors.text }]}>{review.comment}</Text> : null}
            {review.tags.length ? (
              <View style={styles.tags}>
                {review.tags.map((tag) => (
                  <Text key={tag} style={[styles.tag, { backgroundColor: theme.colors.primarySoft, color: theme.colors.primaryDark }]}>
                    {tag}
                  </Text>
                ))}
              </View>
            ) : null}
          </Card>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tab: { padding: 16, gap: 12 },
  chipWrap: { alignSelf: 'flex-start' },
  deals: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 18 },
  dealsTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  dealsBody: { color: 'rgba(255,255,255,0.92)', fontSize: 14, fontWeight: '700', marginTop: 2 },
  dealsCount: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 14, borderWidth: 1 },
  glyph: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  categoryName: { flex: 1, fontSize: 15, fontWeight: '700' },
  muted: { fontSize: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 6 },
  infoText: { flex: 1, fontSize: 14, lineHeight: 20 },
  summary: { alignItems: 'center', gap: 6 },
  bigRating: { fontSize: 34, fontWeight: '800' },
  review: { gap: 6 },
  reviewHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewName: { fontSize: 14, fontWeight: '800' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
});
