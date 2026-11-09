import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../navigation/navigation';
import { useAppNavigation } from '../../navigation/hooks';
import { VerticalThemeProvider, useVerticalTheme } from '../../contexts/VerticalThemeContext';
import { useTranslation } from '../../hooks/useTranslation';
import { formatMoney } from '../../utils/money';
import { Card, PrimaryButton, PriceRow } from '../../components/kudya';

type PlacedRoute = RouteProp<RootStackParamList, 'OrderPlaced'>;

function OrderPlacedContent() {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<PlacedRoute>();
  const orderIds = params?.orderIds ?? [];
  const orders = params?.orders ?? [];
  const numbers = orderIds.map((id) => `#KD-${id}`).join(', ');
  const firstId = orderIds[0];

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}
    >
      <View style={[styles.badgeOuter, { backgroundColor: theme.colors.successSoft }]}>
        <View style={[styles.badgeInner, { backgroundColor: theme.colors.success }]}>
          <Feather name="check" size={44} color="#fff" />
        </View>
      </View>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('ckOrderPlaced', 'Order Placed!')}</Text>
      <Text style={[styles.body, { color: theme.colors.textMuted }]}>
        {t('ckOrderPlacedBody', 'Your order {numbers} has been confirmed.', { numbers })}
      </Text>

      {orders.map((order) => (
        <Card key={order.order_id} style={styles.card}>
          <PriceRow label={`#KD-${order.order_id}`} value={formatMoney(order.total, order.currency)} bold />
          <PriceRow label={t('ckPaidWith', 'Payment')} value={order.payment_method.replace(/_/g, ' ')} tone="muted" />
          {order.payment_method !== 'cash' ? (
            <Text style={[styles.pinHint, { color: theme.colors.textMuted }]}>
              {t('ckPaymentConfirmLater', 'We will mark this order as paid once the payment is confirmed.')}
            </Text>
          ) : null}
          {order.secret_pin ? (
            <View style={[styles.pin, { backgroundColor: theme.colors.primarySoft }]}>
              <Text style={[styles.pinLabel, { color: theme.colors.textMuted }]}>
                {order.fulfilment_type === 'pickup' ? t('ckPickupPin', 'Pickup PIN') : t('ckDeliveryPin', 'Delivery PIN')}
              </Text>
              <Text style={[styles.pinValue, { color: theme.colors.primaryDark }]}>{order.secret_pin}</Text>
              <Text style={[styles.pinHint, { color: theme.colors.textMuted }]}>
                {order.fulfilment_type === 'pickup'
                  ? t('ckPickupPinHint', 'Show this PIN at the restaurant counter to collect your order.')
                  : t('ckDeliveryPinHint', 'Share this PIN with the driver only when you receive your order.')}
              </Text>
            </View>
          ) : null}
        </Card>
      ))}

      {(params?.notices ?? []).map((notice) => (
        <Text key={notice} style={[styles.notice, { color: theme.colors.textMuted }]}>
          {notice}
        </Text>
      ))}

      <View style={styles.actions}>
        {firstId ? (
          <PrimaryButton
            testID="track-order"
            title={t('ckTrackOrder', 'Track Order')}
            icon="map-pin"
            onPress={() => navigation.navigate('OrderTracking', { orderId: firstId, vertical: theme.key })}
          />
        ) : null}
        {firstId ? (
          <PrimaryButton
            title={t('ckViewReceipt', 'View Receipt')}
            variant="outline"
            onPress={() => navigation.navigate('OrderReceipt', { orderId: firstId, vertical: theme.key })}
          />
        ) : null}
        <PrimaryButton
          title={t('ckContinueShopping', 'Continue Shopping')}
          variant="ghost"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })}
        />
      </View>
    </ScrollView>
  );
}

export default function OrderPlacedScreen() {
  const { params } = useRoute<PlacedRoute>();
  return (
    <VerticalThemeProvider vertical={params?.vertical}>
      <OrderPlacedContent />
    </VerticalThemeProvider>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, alignItems: 'stretch', gap: 14 },
  badgeOuter: { alignSelf: 'center', width: 128, height: 128, borderRadius: 64, alignItems: 'center', justifyContent: 'center' },
  badgeInner: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '900', textAlign: 'center', marginTop: 8 },
  body: { fontSize: 15, textAlign: 'center', lineHeight: 21 },
  card: { gap: 4 },
  pin: { marginTop: 10, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4 },
  pinLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  pinValue: { fontSize: 32, fontWeight: '900', letterSpacing: 6 },
  pinHint: { fontSize: 12, textAlign: 'center' },
  notice: { fontSize: 13, textAlign: 'center' },
  actions: { gap: 10, marginTop: 10 },
});
