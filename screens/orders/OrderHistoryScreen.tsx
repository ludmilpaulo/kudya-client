import React, { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppNavigation, useAppRoute } from '../../navigation/hooks';
import { VerticalThemeProvider, useVerticalTheme } from '../../contexts/VerticalThemeContext';
import { useTranslation } from '../../hooks/useTranslation';
import { Chip, EmptyState, ErrorState, LoadingState, PrimaryButton, ScreenHeader } from '../../components/kudya';
import type { OrderListItem } from '../../features/commerce/api';
import { useRequireUser } from '../../features/account/useRequireUser';
import { useOrderList, type OrderTab } from '../../features/orders/useOrderList';
import { useReorder } from '../../features/orders/useReorder';
import { isActiveStatus } from '../../features/orders/format';
import { goBackOr, goHome } from '../../features/orders/navigation';
import OrderHistoryCard from '../../features/orders/components/OrderHistoryCard';

function HistoryContent() {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const insets = useSafeAreaInsets();
  const { params } = useAppRoute<'OrderHistory'>();
  const vertical = params?.vertical;
  const { signedIn } = useRequireUser();
  const [tab, setTab] = useState<OrderTab>('all');
  const list = useOrderList({ tab, vertical, enabled: signedIn });
  const { reorder, busyId } = useReorder();

  const tabs: Array<{ key: OrderTab; label: string }> = [
    { key: 'all', label: t('orTabAll', 'All') },
    { key: 'active', label: t('orTabProcessing', 'Processing') },
    { key: 'completed', label: t('orTabCompleted', 'Completed') },
    { key: 'cancelled', label: t('orTabCancelled', 'Cancelled') },
  ];

  const open = (order: OrderListItem) => {
    const orderVertical = order.store.vertical ?? vertical;
    if (isActiveStatus(order.status)) navigation.navigate('OrderTracking', { orderId: order.id, vertical: orderVertical });
    else navigation.navigate('OrderReceipt', { orderId: order.id, vertical: orderVertical });
  };

  let body: React.ReactNode;
  if (!signedIn) {
    body = (
      <EmptyState
        icon="lock"
        title={t('orSignInTitle', 'Sign in to see your orders')}
        actionLabel={t('orSignIn', 'Sign in')}
        onAction={() => navigation.navigate('UserLogin')}
      />
    );
  } else if (list.loading) {
    body = <LoadingState label={t('orLoadingOrders', 'Loading your orders…')} />;
  } else if (list.error && !list.orders.length) {
    body = <ErrorState title={t('orLoadError', 'Something went wrong')} body={list.error} retryLabel={t('orRetry', 'Try again')} onRetry={list.retry} />;
  } else if (!list.orders.length) {
    body = (
      <EmptyState
        icon="shopping-bag"
        title={t('orNoOrders', 'No orders yet')}
        body={tab === 'all' ? t('orNoOrdersBody', 'Your orders will show up here once you place one.') : t('orNoOrdersTab', 'No orders in this tab.')}
        actionLabel={t('orStartShopping', 'Start shopping')}
        onAction={() => goHome(navigation)}
      />
    );
  } else {
    body = (
      <FlatList
        data={list.orders}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
        refreshControl={<RefreshControl refreshing={list.refreshing} onRefresh={list.refresh} tintColor={theme.colors.primary} />}
        onEndReached={list.loadMore}
        onEndReachedThreshold={0.4}
        renderItem={({ item }) => (
          <OrderHistoryCard
            order={item}
            reordering={busyId === item.id}
            onOpen={() => open(item)}
            onReorder={() => void reorder(item.id, item.store.vertical ?? vertical)}
            onRate={() => navigation.navigate('RateOrder', { orderId: item.id, vertical: item.store.vertical ?? vertical })}
            onTrack={() => navigation.navigate('OrderTracking', { orderId: item.id, vertical: item.store.vertical ?? vertical })}
          />
        )}
        ListFooterComponent={
          list.loadingMore ? (
            <ActivityIndicator color={theme.colors.primary} style={styles.footer} />
          ) : list.hasMore ? (
            <PrimaryButton title={t('orLoadMore', 'Load more')} variant="ghost" onPress={list.loadMore} style={styles.footer} />
          ) : null
        }
      />
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader
        title={t('orMyOrders', 'My Orders')}
        onBack={() => goBackOr(navigation, () => goHome(navigation))}
        right={
          signedIn ? (
            <Chip label={t('orRefunds', 'Refunds')} icon="rotate-ccw" onPress={() => navigation.navigate('RefundsDisputes')} />
          ) : undefined
        }
      />
      <View style={[styles.tabsWrap, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {tabs.map((item) => (
            <Chip key={item.key} label={item.label} selected={tab === item.key} onPress={() => setTab(item.key)} testID={`orders-tab-${item.key}`} />
          ))}
        </ScrollView>
      </View>
      {body}
    </View>
  );
}

export default function OrderHistoryScreen() {
  const { params } = useAppRoute<'OrderHistory'>();
  return (
    <VerticalThemeProvider vertical={params?.vertical}>
      <HistoryContent />
    </VerticalThemeProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tabsWrap: { borderBottomWidth: StyleSheet.hairlineWidth },
  tabs: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  list: { padding: 16, gap: 12 },
  footer: { marginTop: 8 },
});
