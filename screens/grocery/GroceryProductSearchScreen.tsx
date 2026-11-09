import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Chip,
  EmptyState,
  ErrorState,
  InlineError,
  LoadingState,
  ScreenHeader,
  SearchBar,
} from '../../components/kudya';
import { useVerticalTheme, withVerticalTheme } from '../../contexts/VerticalThemeContext';
import { useAppNavigation, useAppRoute } from '../../navigation/hooks';
import { useTranslation } from '../../hooks/useTranslation';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useGetGroceryProductsQuery } from '../../redux/api/groceriesApi';
import type { GroceryProduct } from '../../features/groceries/types';
import { errorMessage } from '../../utils/notify';
import CartButton from '../../features/groceryFlow/components/CartButton';
import FilterSheet, { DEFAULT_FILTERS, type GroceryFilters } from '../../features/groceryFlow/components/FilterSheet';
import ProductListItem from '../../features/groceryFlow/components/ProductListItem';
import { isOutOfStock } from '../../features/groceryFlow/product';

const PAGE_SIZE = 24;

function applyClientFilters(rows: GroceryProduct[], filters: GroceryFilters): GroceryProduct[] {
  const visible = filters.inStock ? rows.filter((row) => !isOutOfStock(row)) : rows;
  if (filters.sort === 'relevance') return visible;
  const direction = filters.sort === 'price_asc' ? 1 : -1;
  return [...visible].sort((a, b) => (a.price - b.price) * direction);
}

function GroceryProductSearchContent() {
  const theme = useVerticalTheme();
  const navigation = useAppNavigation();
  const { params } = useAppRoute<'GroceryProductSearch'>();
  const { t } = useTranslation();
  const [text, setText] = useState(params?.query ?? '');
  const search = useDebouncedValue(text.trim(), 350);
  const [filters, setFilters] = useState<GroceryFilters>(DEFAULT_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);

  const key = `${search}|${params?.categorySlug ?? ''}|${params?.storeId ?? ''}|${filters.onSale}`;
  const [paging, setPaging] = useState({ key, page: 1 });
  const page = paging.key === key ? paging.page : 1;
  const [loaded, setLoaded] = useState<{ key: string; rows: GroceryProduct[] }>({ key, rows: [] });

  const query = useGetGroceryProductsQuery({
    search: search || undefined,
    category_slug: params?.categorySlug,
    store: params?.storeId,
    on_sale: filters.onSale || undefined,
    page,
    page_size: PAGE_SIZE,
  });
  const current = query.currentData;

  useEffect(() => {
    if (!current) return;
    setLoaded((prev) => {
      if (page === 1 || prev.key !== key) return { key, rows: current.results };
      const seen = new Set(prev.rows.map((row) => row.id));
      return { key, rows: [...prev.rows, ...current.results.filter((row) => !seen.has(row.id))] };
    });
  }, [current, key, page]);

  const rows = loaded.key === key ? loaded.rows : [];
  const visible = useMemo(() => applyClientFilters(rows, filters), [rows, filters]);
  const total = filters.inStock ? visible.length : current?.count ?? query.data?.count ?? rows.length;
  const hasMore = !!current?.next;
  const firstLoad = rows.length === 0 && (query.isFetching || query.isLoading);
  const filterCount = Number(filters.onSale) + Number(filters.inStock) + Number(filters.sort !== 'relevance');

  const loadMore = () => {
    if (hasMore && !query.isFetching) setPaging({ key, page: page + 1 });
  };

  const summary = search
    ? t('grResultsFor', '{count} results for "{query}"', { count: total, query: search })
    : t('grProductCount', '{count} products', { count: total });

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader
        title={params?.title || t('grSearch', 'Search')}
        subtitle={params?.storeId ? t('grInThisStore', 'In this store') : undefined}
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
        right={<CartButton />}
      />
      <View style={styles.controls}>
        <SearchBar
          value={text}
          onChangeText={setText}
          placeholder={t('grSearchPlaceholder', 'Search for groceries, brands…')}
          onFilterPress={() => setSheetOpen(true)}
          autoFocus={!params?.categorySlug && !params?.storeId && !params?.title}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip
            label={filterCount ? t('grFiltersCount', 'Filters ({count})', { count: filterCount }) : t('grFilters', 'Filters')}
            icon="sliders"
            selected={filterCount > 0}
            onPress={() => setSheetOpen(true)}
          />
          <Chip
            label={t('grOnSale', 'On sale')}
            icon="tag"
            selected={filters.onSale}
            onPress={() => setFilters((prev) => ({ ...prev, onSale: !prev.onSale }))}
          />
          <Chip
            label={t('grInStockOnly', 'In stock only')}
            icon="check-circle"
            selected={filters.inStock}
            onPress={() => setFilters((prev) => ({ ...prev, inStock: !prev.inStock }))}
          />
          <Chip
            label={filters.sort === 'price_desc' ? t('grPriceHighLow', 'Price ↓') : t('grPriceLowHigh', 'Price ↑')}
            icon="dollar-sign"
            selected={filters.sort !== 'relevance'}
            onPress={() =>
              setFilters((prev) => ({
                ...prev,
                sort: prev.sort === 'relevance' ? 'price_asc' : prev.sort === 'price_asc' ? 'price_desc' : 'relevance',
              }))
            }
          />
        </ScrollView>
      </View>

      {firstLoad ? (
        <LoadingState label={t('grSearching', 'Finding products…')} />
      ) : query.isError && rows.length === 0 ? (
        <ErrorState
          title={t('grSearchError', "We couldn't load products")}
          body={errorMessage(query.error, t('grHomeErrorBody', 'Check your connection and try again.'))}
          retryLabel={t('grRetry', 'Try again')}
          onRetry={() => void query.refetch()}
        />
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={<Text style={[styles.summary, { color: theme.colors.textMuted }]}>{summary}</Text>}
          ListEmptyComponent={
            <EmptyState
              icon="search"
              title={t('grNoResults', 'No products found')}
              body={t('grNoResultsBody', 'Try another search or clear your filters.')}
              actionLabel={filterCount ? t('grClearFilters', 'Clear filters') : undefined}
              onAction={filterCount ? () => setFilters(DEFAULT_FILTERS) : undefined}
            />
          }
          ListFooterComponent={
            query.isFetching && rows.length > 0 ? (
              <ActivityIndicator color={theme.colors.primary} style={styles.footer} />
            ) : query.isError && rows.length > 0 ? (
              <View style={styles.footer}>
                <InlineError message={t('grLoadMoreError', 'Could not load more products.')} />
                <Chip label={t('grRetry', 'Try again')} icon="refresh-cw" onPress={() => void query.refetch()} />
              </View>
            ) : null
          }
          renderItem={({ item }) => <ProductListItem product={item} />}
        />
      )}

      <FilterSheet
        visible={sheetOpen}
        value={filters}
        onClose={() => setSheetOpen(false)}
        onApply={(next) => {
          setFilters(next);
          setSheetOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  controls: { paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  chips: { gap: 8, paddingRight: 16 },
  list: { padding: 16, gap: 10, paddingBottom: 32, flexGrow: 1 },
  summary: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  footer: { marginVertical: 16, gap: 8, alignItems: 'flex-start' },
});

export default withVerticalTheme(GroceryProductSearchContent, () => 'groceries');
