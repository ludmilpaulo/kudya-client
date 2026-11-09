import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Card, PriceRow } from '../../../components/kudya';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { formatMoney } from '../../../utils/money';
import type { OrderDetail, OrderLine } from '../../commerce/api';
import { toNumber } from '../format';

function formatQty(line: OrderLine): string {
  const qty = toNumber(line.quantity);
  const text = Number.isInteger(qty) ? String(qty) : qty.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  const unit = line.selling_unit && line.selling_unit !== 'item' ? ` ${line.selling_unit}` : '';
  return `${text}${unit}`;
}

function LineRow({ line, currency, showImage }: { line: OrderLine; currency: string; showImage: boolean }) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  return (
    <View style={styles.line}>
      {showImage && line.image ? (
        <Image source={{ uri: line.image }} style={styles.thumb} contentFit="cover" accessibilityIgnoresInvertColors />
      ) : null}
      <View style={styles.lineBody}>
        <Text style={[styles.lineName, { color: theme.colors.text }]} numberOfLines={2}>
          {formatQty(line)} × {line.name}
        </Text>
        {line.addons?.map((addon) => (
          <Text key={`${addon.id ?? ''}-${addon.name}`} style={[styles.addon, { color: theme.colors.textMuted }]}>
            + {addon.name}
            {toNumber(addon.price) > 0 ? ` (${formatMoney(addon.price, currency)})` : ''}
          </Text>
        ))}
        {line.special_instructions ? (
          <Text style={[styles.addon, { color: theme.colors.textMuted }]}>
            {t('orLineNote', 'Note: {note}', { note: line.special_instructions })}
          </Text>
        ) : null}
        {line.substitution_status === 'substituted' && line.substituted_product_name ? (
          <Text style={[styles.addon, { color: theme.colors.warning }]}>
            {t('orSubstitutedWith', 'Substituted with {name}', { name: line.substituted_product_name })}
          </Text>
        ) : null}
      </View>
      <Text style={[styles.linePrice, { color: theme.colors.text }]}>{formatMoney(line.subtotal, currency)}</Text>
    </View>
  );
}

export function OrderTotals({ order }: { order: OrderDetail }) {
  const { t } = useTranslation();
  const discount = toNumber(order.discount_amount);
  return (
    <View>
      <PriceRow label={t('orSubtotal', 'Subtotal')} value={formatMoney(order.subtotal, order.currency)} />
      {discount > 0 ? (
        <PriceRow label={t('orDiscount', 'Discount')} value={`- ${formatMoney(discount, order.currency)}`} tone="success" />
      ) : null}
      <PriceRow label={t('orDeliveryFee', 'Delivery fee')} value={formatMoney(order.delivery_fee, order.currency)} />
      <PriceRow label={t('orTotal', 'Total')} value={formatMoney(order.total, order.currency)} bold />
    </View>
  );
}

export default function OrderSummaryCard({
  order,
  title,
  showImages = false,
}: {
  order: OrderDetail;
  title?: string;
  showImages?: boolean;
}) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  return (
    <Card style={styles.card}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{title ?? t('orOrderSummary', 'Order summary')}</Text>
      {order.lines.map((line) => (
        <LineRow key={line.id} line={line} currency={order.currency} showImage={showImages} />
      ))}
      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
      <OrderTotals order={order} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 8 },
  title: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  line: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  thumb: { width: 40, height: 40, borderRadius: 10 },
  lineBody: { flex: 1 },
  lineName: { fontSize: 14, fontWeight: '600' },
  addon: { fontSize: 12, marginTop: 2 },
  linePrice: { fontSize: 14, fontWeight: '700' },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 4 },
});
