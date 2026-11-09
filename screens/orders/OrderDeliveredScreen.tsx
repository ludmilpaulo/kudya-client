import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppNavigation, useAppRoute } from '../../navigation/hooks';
import { VerticalThemeProvider, useVerticalTheme } from '../../contexts/VerticalThemeContext';
import { useTranslation } from '../../hooks/useTranslation';
import { PrimaryButton, PriceRow, Card, RatingStars } from '../../components/kudya';
import type { OrderDetail } from '../../features/commerce/api';
import { useRequireUser } from '../../features/account/useRequireUser';
import { useOrderLive } from '../../features/orders/useOrderLive';
import { useReorder } from '../../features/orders/useReorder';
import { formatDateTime, orderNumber, orderVertical } from '../../features/orders/format';
import { goHome } from '../../features/orders/navigation';
import { formatMoney } from '../../utils/money';
import OrderGate from '../../features/orders/components/OrderGate';
import SuccessIllustration from '../../features/orders/components/SuccessIllustration';

function DeliveredBody({ order }: { order: OrderDetail }) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const insets = useSafeAreaInsets();
  const { reorder, busyId } = useReorder();
  const vertical = theme.key;
  const deliveredAt = order.timeline?.find((entry) => entry.status === 'delivered')?.at;

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 }]}
    >
      <SuccessIllustration />
      <Text style={[styles.title, { color: theme.colors.text }]} accessibilityRole="header">
        {t('orDeliveredTitle', 'Delivered!')}
      </Text>
      <Text style={[styles.body, { color: theme.colors.textMuted }]}>
        {t('orDeliveredBody', 'Your order has been delivered successfully.')}
      </Text>

      <Card style={styles.card}>
        <PriceRow label={orderNumber(order)} value={formatMoney(order.total, order.currency)} bold />
        <PriceRow label={t('orStore', 'Store')} value={order.store.name} tone="muted" />
        {deliveredAt ? <PriceRow label={t('orDeliveredAt', 'Delivered')} value={formatDateTime(deliveredAt)} tone="muted" /> : null}
        {order.rating ? (
          <View style={styles.rated}>
            <Text style={[styles.ratedLabel, { color: theme.colors.textMuted }]}>{t('orYourRating', 'Your rating')}</Text>
            <RatingStars value={order.rating.store_rating} size={18} />
          </View>
        ) : null}
      </Card>

      <View style={styles.actions}>
        {order.can_rate && !order.rated ? (
          <PrimaryButton
            testID="rate-order"
            title={t('orRateYourOrder', 'Rate Your Order')}
            icon="star"
            onPress={() => navigation.navigate('RateOrder', { orderId: order.id, vertical })}
          />
        ) : null}
        <PrimaryButton
          title={t('orViewReceipt', 'View Receipt')}
          icon="file-text"
          variant="outline"
          onPress={() => navigation.navigate('OrderReceipt', { orderId: order.id, vertical })}
        />
        {order.can_reorder ? (
          <PrimaryButton
            title={t('orOrderAgain', 'Order Again')}
            icon="repeat"
            variant="outline"
            loading={busyId === order.id}
            onPress={() => void reorder(order.id, order.store.vertical)}
          />
        ) : null}
        <PrimaryButton title={t('orBackToHome', 'Back to home')} variant="ghost" onPress={() => goHome(navigation)} />
      </View>
    </ScrollView>
  );
}

export default function OrderDeliveredScreen() {
  const { params } = useAppRoute<'OrderDelivered'>();
  const navigation = useAppNavigation();
  const { token, signedIn } = useRequireUser();
  const { t } = useTranslation();
  const live = useOrderLive(params.orderId, { token, live: false });

  return (
    <VerticalThemeProvider vertical={orderVertical(live.order, params.vertical)}>
      <OrderGate
        title={t('orDeliveredTitle', 'Delivered!')}
        onBack={() => goHome(navigation)}
        order={live.order}
        loading={live.loading}
        error={live.error}
        onRetry={live.reload}
        signedIn={signedIn}
        onSignIn={() => navigation.navigate('UserLogin')}
      >
        {(order) => <DeliveredBody order={order} />}
      </OrderGate>
    </VerticalThemeProvider>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, gap: 14 },
  title: { fontSize: 28, fontWeight: '900', textAlign: 'center' },
  body: { fontSize: 15, textAlign: 'center', lineHeight: 21 },
  card: { gap: 2 },
  rated: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6 },
  ratedLabel: { fontSize: 14 },
  actions: { gap: 10, marginTop: 6 },
});
