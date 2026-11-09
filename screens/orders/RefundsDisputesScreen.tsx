import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppNavigation } from '../../navigation/hooks';
import { VerticalThemeProvider, useVerticalTheme } from '../../contexts/VerticalThemeContext';
import { useTranslation } from '../../hooks/useTranslation';
import {
  BottomSheet,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  OptionRow,
  PrimaryButton,
  ScreenHeader,
} from '../../components/kudya';
import { fetchOrders, fetchRefunds, type OrderListItem, type RefundRequest } from '../../features/commerce/api';
import { useRequireUser } from '../../features/account/useRequireUser';
import { formatDate, orderNumber } from '../../features/orders/format';
import { refundReasonLabel, refundStatusLabel } from '../../features/orders/refundReasons';
import { formatMoney } from '../../utils/money';
import { errorMessage } from '../../utils/notify';
import { useLatestRef } from '../../features/orders/useLatestRef';
import OrderStatusPill from '../../features/orders/components/OrderStatusPill';

function RefundCard({ refund }: { refund: RefundRequest }) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  return (
    <Card style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.icon, { backgroundColor: theme.colors.primarySoft }]}>
          <Feather name="rotate-ccw" size={18} color={theme.colors.primary} />
        </View>
        <View style={styles.flex}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {orderNumber({ id: refund.order_id, number: refund.order_number })}
          </Text>
          <Text style={[styles.meta, { color: theme.colors.textMuted }]}>{refund.store_name}</Text>
        </View>
        <Text style={[styles.amount, { color: theme.colors.text }]}>{formatMoney(refund.amount, refund.currency)}</Text>
      </View>
      <Text style={[styles.reason, { color: theme.colors.text }]}>{refundReasonLabel(refund.reason, t)}</Text>
      <View style={styles.cardBottom}>
        <OrderStatusPill status={refund.status} label={refundStatusLabel(refund.status, t)} />
        <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
          {t('orRequestedOn', 'Requested {date}', { date: formatDate(refund.created_at) })}
          {refund.updated_at && refund.updated_at !== refund.created_at
            ? ` · ${t('orUpdatedOn', 'Updated {date}', { date: formatDate(refund.updated_at) })}`
            : ''}
        </Text>
      </View>
    </Card>
  );
}

function PickOrderSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const [orders, setOrders] = useState<OrderListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const tRef = useLatestRef(t);

  const load = useCallback(async () => {
    setOrders(null);
    setError(null);
    try {
      const data = await fetchOrders({ status: 'completed' });
      setOrders(data.results.filter((order) => order.status === 'delivered'));
    } catch (err) {
      setError(errorMessage(err, tRef.current('orLoadOrdersFailed', 'We could not load your orders.')));
    }
  }, [tRef]);

  useEffect(() => {
    if (visible) void load();
  }, [load, visible]);

  let content: React.ReactNode;
  if (error) content = <ErrorState title={t('orLoadError', 'Something went wrong')} body={error} retryLabel={t('orRetry', 'Try again')} onRetry={() => void load()} />;
  else if (!orders) content = <LoadingState />;
  else if (!orders.length) content = <EmptyState icon="package" title={t('orNoDeliveredOrders', 'No delivered orders to refund')} />;
  else
    content = (
      <View style={styles.sheetList}>
        {orders.map((order) => (
          <OptionRow
            key={order.id}
            title={`${order.store.name} · ${orderNumber(order)}`}
            subtitle={`${formatDate(order.created_at)} · ${formatMoney(order.total, order.currency)}`}
            onPress={() => {
              onClose();
              navigation.navigate('RefundRequest', { orderId: order.id, vertical: order.store.vertical ?? undefined });
            }}
            right={<Feather name="chevron-right" size={18} color={theme.colors.textMuted} />}
          />
        ))}
      </View>
    );

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t('orChooseOrder', 'Choose an order')}>
      {content}
    </BottomSheet>
  );
}

function RefundsContent() {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const insets = useSafeAreaInsets();
  const { signedIn } = useRequireUser();
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const tRef = useLatestRef(t);

  const load = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (mode === 'initial') setLoading(true);
      else setRefreshing(true);
      setError(null);
      try {
        setRefunds(await fetchRefunds());
      } catch (err) {
        setError(errorMessage(err, tRef.current('orRefundsLoadFailed', 'We could not load your refunds.')));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [tRef],
  );

  useFocusEffect(
    useCallback(() => {
      if (signedIn) void load('initial');
      else setLoading(false);
    }, [load, signedIn]),
  );

  let body: React.ReactNode;
  if (!signedIn) {
    body = <EmptyState icon="lock" title={t('orSignInTitle', 'Sign in to see your orders')} actionLabel={t('orSignIn', 'Sign in')} onAction={() => navigation.navigate('UserLogin')} />;
  } else if (loading) {
    body = <LoadingState />;
  } else if (error && !refunds.length) {
    body = <ErrorState title={t('orLoadError', 'Something went wrong')} body={error} retryLabel={t('orRetry', 'Try again')} onRetry={() => void load('initial')} />;
  } else if (!refunds.length) {
    body = <EmptyState icon="rotate-ccw" title={t('orNoRefunds', 'No refund requests')} body={t('orNoRefundsBody', 'If something was wrong with an order, you can request a refund here.')} />;
  } else {
    body = (
      <FlatList
        data={refunds}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <RefundCard refund={item} />}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load('refresh')} tintColor={theme.colors.primary} />}
      />
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title={t('orRefundsDisputes', 'Refunds & Disputes')} onBack={() => navigation.goBack()} />
      <View style={styles.flex}>{body}</View>
      {signedIn ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12, backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
          <PrimaryButton testID="request-refund" title={t('orRequestRefund', 'Request a refund')} icon="plus" onPress={() => setPicking(true)} />
        </View>
      ) : null}
      <PickOrderSheet visible={picking} onClose={() => setPicking(false)} />
    </View>
  );
}

export default function RefundsDisputesScreen() {
  return (
    <VerticalThemeProvider vertical={undefined}>
      <RefundsContent />
    </VerticalThemeProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: 16, gap: 12 },
  card: { gap: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '800' },
  meta: { fontSize: 12, marginTop: 2 },
  amount: { fontSize: 15, fontWeight: '800' },
  reason: { fontSize: 14, fontWeight: '600' },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  sheetList: { gap: 10 },
});
