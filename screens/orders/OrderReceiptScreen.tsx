import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppNavigation, useAppRoute } from '../../navigation/hooks';
import { VerticalThemeProvider, useVerticalTheme } from '../../contexts/VerticalThemeContext';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, PrimaryButton, ScreenHeader } from '../../components/kudya';
import type { OrderDetail } from '../../features/commerce/api';
import { useRequireUser } from '../../features/account/useRequireUser';
import { useOrderLive } from '../../features/orders/useOrderLive';
import { useReorder } from '../../features/orders/useReorder';
import { absoluteUrl, formatDateTime, humanize, orderNumber, orderVertical } from '../../features/orders/format';
import { openExternal } from '../../features/orders/links';
import OrderGate from '../../features/orders/components/OrderGate';
import OrderSummaryCard from '../../features/orders/components/OrderSummaryCard';
import OrderStatusPill from '../../features/orders/components/OrderStatusPill';
import { StoreLogo } from '../../features/orders/components/StoreMiniCard';
import PaymentStatusRow from '../../features/orders/components/PaymentStatusRow';
import { formatMoney } from '../../utils/money';

function InfoRow({ icon, label, value }: { icon: React.ComponentProps<typeof Feather>['name']; label: string; value: string }) {
  const theme = useVerticalTheme();
  return (
    <View style={styles.info}>
      <View style={[styles.infoIcon, { backgroundColor: theme.colors.primarySoft }]}>
        <Feather name={icon} size={16} color={theme.colors.primary} />
      </View>
      <View style={styles.flex}>
        <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: theme.colors.text }]}>{value}</Text>
      </View>
    </View>
  );
}

function ReceiptBody({ order }: { order: OrderDetail }) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const insets = useSafeAreaInsets();
  const { reorder, busyId } = useReorder();
  const receiptUrl = absoluteUrl(order.receipt_url);

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title={t('orOrderReceipt', 'Order Receipt')} subtitle={orderNumber(order)} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <Card style={styles.header}>
          <StoreLogo uri={order.store.logo} size={56} />
          <View style={styles.flex}>
            <Text style={[styles.store, { color: theme.colors.text }]}>{order.store.name}</Text>
            <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
              {orderNumber(order)} · {formatDateTime(order.created_at)}
            </Text>
            <View style={styles.pill}>
              <OrderStatusPill status={order.status} label={order.status_label} />
            </View>
          </View>
        </Card>

        <OrderSummaryCard order={order} title={t('orItems', 'Items')} />

        <PaymentStatusRow order={order} />

        <Card style={styles.details}>
          {order.fulfilment_type === 'pickup' ? (
            <InfoRow icon="shopping-bag" label={t('orFulfilment', 'Fulfilment')} value={t('orPickupAtRestaurant', 'Pickup at the restaurant')} />
          ) : null}
          {order.address ? <InfoRow icon="map-pin" label={t('orDeliveryAddress', 'Delivery address')} value={order.address} /> : null}
          {order.status === 'cancelled' && order.cancellation_reason ? (
            <InfoRow icon="x-circle" label={t('orCancellationReason', 'Cancellation reason')} value={order.cancellation_reason} />
          ) : null}
          {order.refund ? (
            <InfoRow
              icon="rotate-ccw"
              label={t('orRefund', 'Refund')}
              value={`${humanize(order.refund.status)} · ${formatMoney(order.refund.amount, order.currency)}`}
            />
          ) : null}
          {order.delivery_slot ? (
            <InfoRow
              icon="clock"
              label={t('orDeliverySlot', 'Delivery slot')}
              value={`${formatDateTime(order.delivery_slot.start)} – ${formatDateTime(order.delivery_slot.end).split(', ').pop() ?? ''}`}
            />
          ) : null}
          {order.delivery_notes ? <InfoRow icon="edit-3" label={t('orDeliveryNotes', 'Delivery notes')} value={order.delivery_notes} /> : null}
        </Card>

        <PrimaryButton
          testID="download-receipt"
          title={t('orDownloadReceipt', 'Download Receipt')}
          icon="download"
          disabled={!receiptUrl}
          onPress={receiptUrl ? () => void openExternal(receiptUrl, t('orOpenFailed', 'Could not open the receipt')) : undefined}
        />
        {!receiptUrl ? (
          <Text style={[styles.meta, { color: theme.colors.textMuted, textAlign: 'center' }]}>
            {t('orReceiptPending', 'A downloadable receipt is not available for this order yet.')}
          </Text>
        ) : null}
        {order.can_rate && !order.rated ? (
          <PrimaryButton
            title={t('orRateYourOrder', 'Rate Your Order')}
            icon="star"
            variant="outline"
            onPress={() => navigation.navigate('RateOrder', { orderId: order.id, vertical: theme.key })}
          />
        ) : null}
        {order.can_reorder ? (
          <PrimaryButton
            title={t('orOrderAgain', 'Order Again')}
            icon="repeat"
            variant="outline"
            loading={busyId === order.id}
            onPress={() => void reorder(order.id, order.store.vertical)}
          />
        ) : null}
        {order.status === 'delivered' && !order.refund ? (
          <PrimaryButton
            title={t('orReportIssue', 'Report an issue')}
            icon="alert-circle"
            variant="ghost"
            onPress={() => navigation.navigate('RefundRequest', { orderId: order.id, vertical: theme.key })}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

export default function OrderReceiptScreen() {
  const { params } = useAppRoute<'OrderReceipt'>();
  const navigation = useAppNavigation();
  const { token, signedIn } = useRequireUser();
  const { t } = useTranslation();
  const live = useOrderLive(params.orderId, { token, live: false });

  return (
    <VerticalThemeProvider vertical={orderVertical(live.order, params.vertical)}>
      <OrderGate
        title={t('orOrderReceipt', 'Order Receipt')}
        onBack={() => navigation.goBack()}
        order={live.order}
        loading={live.loading}
        error={live.error}
        onRetry={live.reload}
        signedIn={signedIn}
        onSignIn={() => navigation.navigate('UserLogin')}
      >
        {(order) => <ReceiptBody order={order} />}
      </OrderGate>
    </VerticalThemeProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  store: { fontSize: 17, fontWeight: '800' },
  meta: { fontSize: 13, marginTop: 2 },
  pill: { marginTop: 6 },
  details: { gap: 14 },
  info: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  infoIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  infoLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  infoValue: { fontSize: 14, fontWeight: '600', marginTop: 2 },
});
