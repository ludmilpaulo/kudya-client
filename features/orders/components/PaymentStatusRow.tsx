import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from '../../../components/kudya';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';
import type { OrderDetail } from '../../commerce/api';
import { humanize } from '../format';
import { paymentState, type PaymentState } from '../steps';

type IconName = React.ComponentProps<typeof Feather>['name'];

export default function PaymentStatusRow({ order }: { order: Pick<OrderDetail, 'is_paid' | 'payment_method' | 'payment_status'> }) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const state = paymentState(order);
  const copy: Record<PaymentState, { label: string; icon: IconName; color: string }> = {
    paid: { label: t('orPaymentPaid', 'Paid'), icon: 'check-circle', color: theme.colors.success },
    cash: { label: t('orPaymentCash', 'Pay with cash'), icon: 'dollar-sign', color: theme.colors.textMuted },
    pending: { label: t('orPaymentPending', 'Awaiting payment confirmation'), icon: 'clock', color: theme.colors.warning },
    failed: { label: t('orPaymentFailed', 'Payment failed'), icon: 'alert-circle', color: theme.colors.error },
    refunded: { label: t('orPaymentRefunded', 'Refunded'), icon: 'rotate-ccw', color: theme.colors.textMuted },
  };
  const { label, icon, color } = copy[state];
  return (
    <Card style={styles.card}>
      <View style={[styles.icon, { backgroundColor: theme.colors.primarySoft }]}>
        <Feather name="credit-card" size={16} color={theme.colors.primary} />
      </View>
      <View style={styles.flex}>
        <Text style={[styles.method, { color: theme.colors.text }]}>{humanize(order.payment_method)}</Text>
        <View style={styles.status}>
          <Feather name={icon} size={13} color={color} />
          <Text style={[styles.statusText, { color }]} testID="order-payment-status">
            {label}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  method: { fontSize: 15, fontWeight: '800' },
  status: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  statusText: { fontSize: 13, fontWeight: '700' },
});
