import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppNavigation, useAppRoute } from '../../navigation/hooks';
import { VerticalThemeProvider, useVerticalTheme } from '../../contexts/VerticalThemeContext';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, PrimaryButton, ScreenHeader, StatusTimeline } from '../../components/kudya';
import { cancelOrder, type OrderDetail } from '../../features/commerce/api';
import { useRequireUser } from '../../features/account/useRequireUser';
import { useOrderLive } from '../../features/orders/useOrderLive';
import { useReorder } from '../../features/orders/useReorder';
import { useStepDescriptions, useStepLabels } from '../../features/orders/useStepDescriptions';
import { absoluteUrl, humanize, orderNumber, orderVertical, timelineSteps } from '../../features/orders/format';
import { isMaskedPhone } from '../../features/orders/steps';
import { callPhone, openExternal } from '../../features/orders/links';
import { goToSupport } from '../../features/orders/navigation';
import OrderGate from '../../features/orders/components/OrderGate';
import OrderSummaryCard from '../../features/orders/components/OrderSummaryCard';
import DeliveryPinCard from '../../features/orders/components/DeliveryPinCard';
import StoreMiniCard from '../../features/orders/components/StoreMiniCard';
import CourierCard from '../../features/orders/components/CourierCard';
import OrderStatusPill from '../../features/orders/components/OrderStatusPill';
import PaymentStatusRow from '../../features/orders/components/PaymentStatusRow';
import CancelOrderSheet from '../../features/orders/components/CancelOrderSheet';
import { errorMessage, toast } from '../../utils/notify';

function EtaChip({ minutes }: { minutes: number }) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  return (
    <View style={[styles.eta, { backgroundColor: theme.colors.primarySoft }]} accessibilityLabel={t('orEtaA11y', 'Arriving in {minutes} minutes', { minutes })}>
      <Text style={[styles.etaLabel, { color: theme.colors.primaryDark }]}>{t('orEta', 'ETA')}</Text>
      <Text style={[styles.etaValue, { color: theme.colors.primaryDark }]}>{t('orEtaMinutes', '{minutes} min', { minutes })}</Text>
    </View>
  );
}

function heroTitle(order: OrderDetail, t: (key: string, fallback: string) => string): string {
  const pickup = order.fulfilment_type === 'pickup';
  switch (order.status) {
    case 'cancelled':
      return t('orCancelledTitle', 'This order was cancelled');
    case 'placed':
      return t('orPlacedTitle', 'Waiting for the restaurant to accept');
    case 'picking':
    case 'packed':
      return t('orPickingTitle', 'Picking & packing your items');
    case 'ready':
      return pickup ? t('orReadyPickupTitle', 'Ready to collect') : t('orReadyTitle', 'Waiting for a courier');
    case 'courier_assigned':
      return t('orCourierAssignedTitle', 'A courier is on the way to the restaurant');
    case 'on_the_way':
      return t('orOnTheWayTitle', 'Your order is on the way');
    default:
      return t('orPreparingTitle', 'Preparing your order');
  }
}

function StatusHero({ order }: { order: OrderDetail }) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const picking = order.status === 'picking' || order.status === 'packed';
  const cancelled = order.status === 'cancelled';
  const icon = cancelled
    ? 'x-circle'
    : order.status === 'on_the_way' || order.status === 'courier_assigned'
      ? 'truck'
      : picking
        ? 'shopping-cart'
        : theme.key === 'groceries'
          ? 'package'
          : 'coffee';
  return (
    <Card style={styles.hero}>
      <View style={[styles.heroIcon, { backgroundColor: cancelled ? theme.colors.background : theme.colors.primarySoft }]}>
        <Feather name={icon} size={26} color={cancelled ? theme.colors.error : theme.colors.primary} />
      </View>
      <View style={styles.flex}>
        <OrderStatusPill status={order.status} label={order.status_label} />
        <Text style={[styles.heroTitle, { color: theme.colors.text }]}>{heroTitle(order, t)}</Text>
        {cancelled && order.cancellation_reason ? (
          <Text style={[styles.heroBody, { color: theme.colors.textMuted }]}>{order.cancellation_reason}</Text>
        ) : order.eta_minutes != null ? (
          <Text style={[styles.heroBody, { color: theme.colors.textMuted }]}>
            {order.fulfilment_type === 'pickup'
              ? t('orEstimatedReady', 'Ready in about {minutes} min', { minutes: order.eta_minutes })
              : t('orEstimatedDelivery', 'Estimated delivery in {minutes} min', { minutes: order.eta_minutes })}
          </Text>
        ) : null}
      </View>
    </Card>
  );
}

function TrackingBody({ order, onOrderUpdated }: { order: OrderDetail; onOrderUpdated: (order: OrderDetail) => void }) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const insets = useSafeAreaInsets();
  const pickup = order.fulfilment_type === 'pickup';
  const describe = useStepDescriptions(order.fulfilment_type);
  const label = useStepLabels(order.fulfilment_type);
  const { reorder, busyId } = useReorder();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const vertical = theme.key;
  const canLiveTrack = order.status === 'on_the_way' && !!order.driver && !pickup;
  const driverPhone = order.driver?.phone && !isMaskedPhone(order.driver.phone) ? order.driver.phone : null;
  const receiptUrl = absoluteUrl(order.receipt_url);
  const openChat = () => navigation.navigate('OrderChat', { orderId: order.id, vertical });
  const callDriver = () => callPhone(driverPhone, t('orCallFailed', 'Could not start the call'));

  const confirmCancel = async (reason: string) => {
    setCancelling(true);
    setCancelError(null);
    try {
      const updated = await cancelOrder(order.id, reason);
      onOrderUpdated(updated);
      setCancelOpen(false);
      toast(
        'success',
        t('orCancelledToast', 'Order cancelled'),
        order.is_paid ? t('orCancelledRefundToast', 'We opened a refund request for your payment.') : undefined,
      );
    } catch (error) {
      setCancelError(errorMessage(error, t('orCancelFailed', 'This order can no longer be cancelled.')));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader
        title={orderNumber(order)}
        subtitle={order.store.name}
        onBack={() => navigation.goBack()}
        right={order.eta_minutes != null && order.status !== 'cancelled' ? <EtaChip minutes={order.eta_minutes} /> : undefined}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <StatusHero order={order} />
        <Card>
          <StatusTimeline steps={timelineSteps(order, describe, label)} />
        </Card>
        <StoreMiniCard
          name={order.store.name}
          logo={order.store.logo}
          subtitle={
            pickup
              ? t('orPickupAtRestaurant', 'Pickup at the restaurant')
              : order.address
                ? t('orDeliverTo', 'Deliver to {address}', { address: order.address })
                : undefined
          }
        />
        {order.secret_pin ? <DeliveryPinCard pin={order.secret_pin} pickup={pickup} /> : null}
        {order.driver ? (
          <CourierCard driver={order.driver} onCall={driverPhone ? callDriver : undefined} onChat={order.chat_enabled ? openChat : undefined} />
        ) : null}
        <View style={styles.actions}>
          {canLiveTrack ? (
            <PrimaryButton
              testID="live-tracking"
              title={t('orLiveTracking', 'Live Tracking')}
              icon="map"
              onPress={() => navigation.navigate('LiveTracking', { orderId: order.id, vertical })}
            />
          ) : null}
          <View style={styles.row}>
            {order.chat_enabled ? (
              <PrimaryButton style={styles.flex} title={t('orChat', 'Chat')} icon="message-circle" variant="outline" onPress={openChat} />
            ) : null}
            {driverPhone ? (
              <PrimaryButton style={styles.flex} title={t('orCall', 'Call')} icon="phone" variant="outline" onPress={callDriver} />
            ) : null}
          </View>
        </View>
        <PaymentStatusRow order={order} />
        {order.refund ? (
          <Card style={styles.refund}>
            <Feather name="rotate-ccw" size={16} color={theme.colors.primary} />
            <Text style={[styles.refundText, { color: theme.colors.text }]}>
              {t('orRefundStatus', 'Refund {status}', { status: humanize(order.refund.status).toLowerCase() })}
            </Text>
          </Card>
        ) : null}
        <OrderSummaryCard order={order} showImages />
        {order.can_cancel ? (
          <PrimaryButton
            testID="cancel-order"
            title={t('orCancelOrder', 'Cancel order')}
            icon="x-circle"
            variant="outline"
            onPress={() => {
              setCancelError(null);
              setCancelOpen(true);
            }}
          />
        ) : null}
        {order.status === 'cancelled' && order.can_reorder ? (
          <PrimaryButton
            title={t('orOrderAgain', 'Order Again')}
            icon="repeat"
            loading={busyId === order.id}
            onPress={() => void reorder(order.id, order.store.vertical)}
          />
        ) : null}
        {receiptUrl ? (
          <PrimaryButton
            title={t('orDownloadReceipt', 'Download Receipt')}
            icon="download"
            variant="ghost"
            onPress={() => void openExternal(receiptUrl, t('orOpenFailed', 'Could not open the receipt'))}
          />
        ) : null}
        {order.status === 'cancelled' && order.is_paid && !order.refund ? (
          <PrimaryButton
            title={t('orRequestRefund', 'Request a refund')}
            icon="rotate-ccw"
            variant="outline"
            onPress={() => navigation.navigate('RefundRequest', { orderId: order.id, vertical })}
          />
        ) : null}
        <PrimaryButton title={t('orNeedHelp', 'Need help?')} icon="help-circle" variant="ghost" onPress={() => goToSupport(navigation)} />
      </ScrollView>
      <CancelOrderSheet
        visible={cancelOpen}
        submitting={cancelling}
        error={cancelError}
        paid={!!order.is_paid}
        onClose={() => setCancelOpen(false)}
        onConfirm={(reason) => void confirmCancel(reason)}
      />
    </View>
  );
}

export default function OrderTrackingScreen() {
  const { params } = useAppRoute<'OrderTracking'>();
  const navigation = useAppNavigation();
  const focused = useIsFocused();
  const { token, signedIn } = useRequireUser();
  const { t } = useTranslation();
  const live = useOrderLive(params.orderId, { token, live: signedIn });
  const vertical = orderVertical(live.order, params.vertical);
  const leaving = useRef(false);

  useEffect(() => {
    if (!focused || leaving.current || live.order?.status !== 'delivered') return;
    leaving.current = true;
    navigation.replace('OrderDelivered', { orderId: params.orderId, vertical });
  }, [focused, live.order?.status, navigation, params.orderId, vertical]);

  return (
    <VerticalThemeProvider vertical={vertical}>
      <OrderGate
        title={t('orTrackOrder', 'Track order')}
        onBack={() => navigation.goBack()}
        order={live.order}
        loading={live.loading}
        error={live.error}
        onRetry={live.reload}
        signedIn={signedIn}
        onSignIn={() => navigation.navigate('UserLogin')}
      >
        {(order) => <TrackingBody order={order} onOrderUpdated={live.setOrder} />}
      </OrderGate>
    </VerticalThemeProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 14 },
  eta: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignItems: 'center' },
  etaLabel: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  etaValue: { fontSize: 14, fontWeight: '900' },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  heroIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontSize: 17, fontWeight: '800', marginTop: 6 },
  heroBody: { fontSize: 13, marginTop: 2 },
  actions: { gap: 10 },
  row: { flexDirection: 'row', gap: 10 },
  refund: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  refundText: { fontSize: 14, fontWeight: '700' },
});
