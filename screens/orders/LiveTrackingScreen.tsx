import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppNavigation, useAppRoute } from '../../navigation/hooks';
import { VerticalThemeProvider, useVerticalTheme } from '../../contexts/VerticalThemeContext';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, ScreenHeader } from '../../components/kudya';
import type { OrderDetail } from '../../features/commerce/api';
import { useRequireUser } from '../../features/account/useRequireUser';
import { useOrderLive } from '../../features/orders/useOrderLive';
import { orderNumber, orderVertical, parseLatLng } from '../../features/orders/format';
import { callPhone } from '../../features/orders/links';
import OrderGate from '../../features/orders/components/OrderGate';
import OrderMap from '../../features/orders/components/OrderMap';
import CourierCard from '../../features/orders/components/CourierCard';
import DeliveryPinCard from '../../features/orders/components/DeliveryPinCard';
import OrderStatusPill from '../../features/orders/components/OrderStatusPill';

function LiveBody({ order }: { order: OrderDetail }) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const insets = useSafeAreaInsets();
  const destination = parseLatLng(order.location);

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title={orderNumber(order)} subtitle={t('orOutForDelivery', 'Out for delivery')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <OrderMap driver={order.driver_location} destination={destination} etaMinutes={order.eta_minutes} />
        <View style={styles.content}>
          <Card style={styles.statusCard}>
            <View style={[styles.statusIcon, { backgroundColor: theme.colors.primarySoft }]}>
              <Feather name="navigation" size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.flex}>
              <OrderStatusPill status={order.status} label={order.status_label} />
              <Text style={[styles.statusTitle, { color: theme.colors.text }]}>
                {order.eta_minutes != null
                  ? t('orArrivingIn', 'Arriving in {minutes} min', { minutes: order.eta_minutes })
                  : t('orOnTheWayTitle', 'Your order is on the way')}
              </Text>
              {order.address ? (
                <Text style={[styles.statusBody, { color: theme.colors.textMuted }]} numberOfLines={2}>
                  {order.address}
                </Text>
              ) : null}
            </View>
          </Card>
          {order.driver ? (
            <CourierCard
              driver={order.driver}
              onCall={() => callPhone(order.driver?.phone, t('orCallFailed', 'Could not start the call'))}
              onChat={order.chat_enabled ? () => navigation.navigate('OrderChat', { orderId: order.id, vertical: theme.key }) : undefined}
            />
          ) : (
            <Card>
              <Text style={[styles.statusBody, { color: theme.colors.textMuted }]}>
                {t('orAssigningDriver', 'We are assigning a courier to your order.')}
              </Text>
            </Card>
          )}
          {order.secret_pin ? <DeliveryPinCard pin={order.secret_pin} compact /> : null}
        </View>
      </ScrollView>
    </View>
  );
}

export default function LiveTrackingScreen() {
  const { params } = useAppRoute<'LiveTracking'>();
  const navigation = useAppNavigation();
  const { token, signedIn } = useRequireUser();
  const { t } = useTranslation();
  const live = useOrderLive(params.orderId, { token, live: signedIn });

  return (
    <VerticalThemeProvider vertical={orderVertical(live.order, params.vertical)}>
      <OrderGate
        title={t('orLiveTracking', 'Live Tracking')}
        onBack={() => navigation.goBack()}
        order={live.order}
        loading={live.loading}
        error={live.error}
        onRetry={live.reload}
        signedIn={signedIn}
        onSignIn={() => navigation.navigate('UserLogin')}
      >
        {(order) => <LiveBody order={order} />}
      </OrderGate>
    </VerticalThemeProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 14 },
  statusCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  statusIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  statusTitle: { fontSize: 17, fontWeight: '800', marginTop: 6 },
  statusBody: { fontSize: 13, marginTop: 2 },
});
