import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chip, EmptyState, ErrorState, LoadingState, PrimaryButton, ScreenHeader, SearchBar } from '../../components/kudya';
import { VerticalThemeProvider, useVerticalTheme } from '../../contexts/VerticalThemeContext';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useTranslation } from '../../hooks/useTranslation';
import { useAppNavigation, useAppRoute } from '../../navigation/hooks';
import { errorMessage } from '../../utils/notify';
import { fetchCuisines, fetchStores } from '../../features/commerce/api';
import FilterSheet from '../../features/food/components/FilterSheet';
import FoodStoreCard from '../../features/food/components/FoodStoreCard';
import {
  EMPTY_FILTERS,
  activeFilterCount,
  sortFromParam,
  sortOptions,
  toStoreFilters,
  type RestaurantFilterState,
  type RestaurantSort,
} from '../../features/food/filters';
import { DEFAULT_CURRENCY, type FoodStore } from '../../features/food/format';
import { useFoodLocation } from '../../features/food/useFoodLocation';
import { useRemote } from '../../features/food/useRemote';

const SORT_LABELS: Record<RestaurantSort, { key: string; fallback: string }> = {
  recommended: { key: 'fdSortRecommended', fallback: 'Recommended' },
  rating: { key: 'fdSortRating', fallback: 'Rating' },
  delivery_time: { key: 'fdSortDeliveryTime', fallback: 'Delivery time' },
  distance: { key: 'fdSortDistance', fallback: 'Nearest' },
};

function RestaurantListContent() {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const insets = useSafeAreaInsets();
  const { params } = useAppRoute<'RestaurantList'>();

  const [search, setSearch] = useState(params?.query ?? '');
  const [sort, setSort] = useState<RestaurantSort>(sortFromParam(params?.sort));
  const [filters, setFilters] = useState<RestaurantFilterState>({ ...EMPTY_FILTERS, cuisine: params?.cuisine ?? null });
  const [sheetOpen, setSheetOpen] = useState(false);
  const query = useDebouncedValue(search, 300);

  useEffect(() => {
    setSearch(params?.query ?? '');
    setSort(sortFromParam(params?.sort));
    setFilters((prev) => ({ ...prev, cuisine: params?.cuisine ?? null }));
  }, [params?.query, params?.sort, params?.cuisine]);

  const location = useFoodLocation();
  const storeFilters = useMemo(() => toStoreFilters(filters, sort, query, location), [filters, sort, query, location]);
  const filterKey = JSON.stringify(storeFilters);
  const stores = useRemote<FoodStore[]>(() => fetchStores('food', storeFilters), [filterKey]);
  const cuisines = useRemote(() => fetchCuisines(), []);

  const filterCount = activeFilterCount(filters);
  const cuisineName = cuisines.data?.find((cuisine) => cuisine.slug === filters.cuisine)?.name;
  const currency = stores.data?.find((store) => store.currency)?.currency || DEFAULT_CURRENCY;
  const results = stores.data ?? [];

  const openStore = (store: FoodStore) => navigation.navigate('RestaurantDetails', { storeId: store.id });

  const renderEmpty = () => {
    if (stores.loading) return <LoadingState label={t('fdLoadingRestaurants', 'Finding restaurants…')} />;
    if (stores.error) {
      return (
        <ErrorState
          title={t('fdRestaurantsError', 'Could not load restaurants')}
          body={errorMessage(stores.error, t('fdTryAgainLater', 'Please try again in a moment.'))}
          retryLabel={t('fdRetry', 'Try again')}
          onRetry={stores.reload}
        />
      );
    }
    const filtered = filterCount > 0 || !!query.trim();
    return (
      <EmptyState
        icon="search"
        title={filtered ? t('fdNoMatches', 'No restaurants match') : t('fdNoRestaurants', 'No restaurants yet')}
        body={filtered ? t('fdNoMatchesBody', 'Try a different search or clear your filters.') : undefined}
        actionLabel={filtered ? t('fdClearFilters', 'Clear filters') : undefined}
        onAction={
          filtered
            ? () => {
                setFilters(EMPTY_FILTERS);
                setSearch('');
              }
            : undefined
        }
      />
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader
        title={cuisineName ?? t('fdRestaurants', 'Restaurants')}
        subtitle={
          stores.data && !stores.error
            ? t('fdRestaurantCount', '{count} restaurants', { count: results.length })
            : undefined
        }
        onBack={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('FoodHome'))}
      />
      <View style={styles.controls}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder={t('fdSearchPlaceholder', 'Search restaurants or dishes')}
          onFilterPress={() => setSheetOpen(true)}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {filterCount ? (
            <Chip
              testID="food-active-filters"
              icon="sliders"
              selected
              label={t('fdFiltersCount', 'Filters ({count})', { count: filterCount })}
              onPress={() => setSheetOpen(true)}
            />
          ) : null}
          {sortOptions(!!location).map((option) => (
            <Chip
              key={option}
              testID={`food-sort-${option}`}
              label={t(SORT_LABELS[option].key, SORT_LABELS[option].fallback)}
              selected={sort === option}
              onPress={() => setSort(option)}
            />
          ))}
        </ScrollView>
        {filterCount ? (
          <View style={styles.activeRow}>
            <Text style={[styles.activeText, { color: theme.colors.textMuted }]}>
              {t('fdActiveFilters', '{count} filters applied', { count: filterCount })}
            </Text>
            <PrimaryButton
              title={t('fdClear', 'Clear')}
              variant="ghost"
              onPress={() => setFilters(EMPTY_FILTERS)}
              style={styles.clear}
            />
          </View>
        ) : null}
      </View>

      <FlatList
        data={stores.error ? [] : results}
        keyExtractor={(store) => String(store.id)}
        renderItem={({ item }) => <FoodStoreCard store={item} onPress={openStore} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }, !results.length && styles.grow]}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={stores.loading && !!stores.data}
            onRefresh={stores.reload}
            tintColor={theme.colors.primary}
          />
        }
      />

      <FilterSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        value={filters}
        cuisines={cuisines.data ?? []}
        currency={currency}
        onApply={(next) => {
          setFilters(next);
          setSheetOpen(false);
        }}
      />
    </View>
  );
}

export default function RestaurantListScreen() {
  return (
    <VerticalThemeProvider vertical="food">
      <RestaurantListContent />
    </VerticalThemeProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  controls: { paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  chips: { gap: 8, paddingRight: 8 },
  activeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  activeText: { fontSize: 13, fontWeight: '600' },
  clear: { minHeight: 32, paddingHorizontal: 14 },
  list: { padding: 16 },
  grow: { flexGrow: 1 },
  separator: { height: 10 },
});
