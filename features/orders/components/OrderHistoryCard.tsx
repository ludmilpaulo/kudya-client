import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { VerticalThemeProvider, useVerticalTheme } from '../../../contexts/VerticalThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { PrimaryButton } from '../../../components/kudya';
import { formatMoney } from '../../../utils/money';
import type { OrderListItem } from '../../commerce/api';
import { formatDate, isActiveStatus, orderNumber } from '../format';
import OrderStatusPill from './OrderStatusPill';
import { StoreLogo } from './StoreMiniCard';

type Props = {
  order: OrderListItem;
  reordering: boolean;
  onOpen: () => void;
  onReorder: () => void;
  onRate: () => void;
  onTrack: () => void;
};

function CardContent({ order, reordering, onOpen, onReorder, onRate, onTrack }: Props) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const active = isActiveStatus(order.status);
  const preview = order.items_preview?.join(', ');
  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`${order.store.name} ${orderNumber(order)} ${order.status_label}`}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.lg },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.top}>
        <StoreLogo uri={order.store.logo} size={52} />
        <View style={styles.flex}>
          <Text style={[styles.store, { color: theme.colors.text }]} numberOfLines={1}>
            {order.store.name}
          </Text>
          <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
            {orderNumber(order)} · {formatDate(order.created_at)}
          </Text>
          {preview ? (
            <Text style={[styles.meta, { color: theme.colors.textMuted }]} numberOfLines={1}>
              {preview}
            </Text>
          ) : null}
        </View>
        <View style={styles.right}>
          <Text style={[styles.total, { color: theme.colors.text }]}>{formatMoney(order.total, order.currency)}</Text>
          <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
            {t('orItemCount', '{count} items', { count: order.item_count })}
          </Text>
        </View>
      </View>
      <View style={styles.bottom}>
        <OrderStatusPill status={order.status} label={order.status_label} />
        <View style={styles.buttons}>
          {active ? (
            <PrimaryButton title={t('orTrack', 'Track')} icon="map-pin" style={styles.button} onPress={onTrack} />
          ) : null}
          {!active && order.can_rate && !order.rated ? (
            <PrimaryButton title={t('orRate', 'Rate')} icon="star" variant="outline" style={styles.button} onPress={onRate} />
          ) : null}
          {order.can_reorder ? (
            <PrimaryButton
              title={t('orReorder', 'Reorder')}
              icon="repeat"
              variant={active ? 'outline' : 'solid'}
              style={styles.button}
              loading={reordering}
              onPress={onReorder}
            />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

/** Each card wears its own vertical colours (purple food, green groceries). */
export default function OrderHistoryCard(props: Props) {
  return (
    <VerticalThemeProvider vertical={props.order.store.vertical}>
      <CardContent {...props} />
    </VerticalThemeProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { borderWidth: 1, padding: 14, gap: 12 },
  pressed: { opacity: 0.9 },
  top: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  store: { fontSize: 16, fontWeight: '800' },
  meta: { fontSize: 12, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  total: { fontSize: 15, fontWeight: '800' },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  buttons: { flexDirection: 'row', gap: 8 },
  button: { minHeight: 36, paddingHorizontal: 14 },
});
