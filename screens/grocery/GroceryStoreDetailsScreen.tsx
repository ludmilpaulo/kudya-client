import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ErrorState, LoadingState, ScreenHeader } from '../../components/kudya';
import { useVerticalTheme, withVerticalTheme } from '../../contexts/VerticalThemeContext';
import { useAppNavigation, useAppRoute } from '../../navigation/hooks';
import { useTranslation } from '../../hooks/useTranslation';
import { fetchStore } from '../../features/commerce/api';
import { errorMessage } from '../../utils/notify';
import CartButton from '../../features/groceryFlow/components/CartButton';
import SegmentedTabs from '../../features/groceryFlow/components/SegmentedTabs';
import StoreHero from '../../features/groceryFlow/components/StoreHero';
import {
  StoreCategoriesTab,
  StoreInfoTab,
  StoreReviewsTab,
  StoreShopTab,
} from '../../features/groceryFlow/components/StoreTabs';
import { isNotFound } from '../../features/groceryFlow/product';
import { useRemote } from '../../features/groceryFlow/useRemote';

type StoreTab = 'shop' | 'categories' | 'info' | 'reviews';

function GroceryStoreDetailsContent() {
  const theme = useVerticalTheme();
  const navigation = useAppNavigation();
  const { params } = useAppRoute<'GroceryStoreDetails'>();
  const { t } = useTranslation();
  const storeId = params.storeId;
  const store = useRemote(() => fetchStore('groceries', storeId), [storeId]);
  const [tab, setTab] = useState<StoreTab>('shop');
  const back = navigation.canGoBack() ? () => navigation.goBack() : undefined;

  if (store.loading && !store.data) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
        <ScreenHeader title={t('grStore', 'Store')} onBack={back} right={<CartButton />} />
        <LoadingState />
      </View>
    );
  }
  if (!store.data) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
        <ScreenHeader title={t('grStore', 'Store')} onBack={back} right={<CartButton />} />
        <ErrorState
          title={isNotFound(store.error) ? t('grStoreNotFound', 'Store not found') : t('grStoreError', "We couldn't load this store")}
          body={errorMessage(store.error, t('grHomeErrorBody', 'Check your connection and try again.'))}
          retryLabel={t('grRetry', 'Try again')}
          onRetry={isNotFound(store.error) ? undefined : store.reload}
        />
      </View>
    );
  }

  const data = store.data;
  const tabs: { key: StoreTab; label: string }[] = [
    { key: 'shop', label: t('grShop', 'Shop') },
    { key: 'categories', label: t('grCategories', 'Categories') },
    { key: 'info', label: t('grInfo', 'Info') },
    { key: 'reviews', label: t('grReviews', 'Reviews') },
  ];

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title={data.name} onBack={back} right={<CartButton />} />
      <ScrollView
        contentContainerStyle={styles.content}
        stickyHeaderIndices={[1]}
        refreshControl={<RefreshControl refreshing={store.loading} onRefresh={store.reload} tintColor={theme.colors.primary} />}
      >
        <StoreHero store={data} onScheduled={() => navigation.navigate('DeliverySlot', { storeId })} />
        <View style={{ backgroundColor: theme.colors.surface }}>
          <SegmentedTabs tabs={tabs} value={tab} onChange={setTab} />
        </View>
        {tab === 'shop' ? <StoreShopTab store={data} /> : null}
        {tab === 'categories' ? <StoreCategoriesTab store={data} /> : null}
        {tab === 'info' ? <StoreInfoTab store={data} /> : null}
        {tab === 'reviews' ? <StoreReviewsTab store={data} /> : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: 40 },
});

export default withVerticalTheme(GroceryStoreDetailsContent, () => 'groceries');
