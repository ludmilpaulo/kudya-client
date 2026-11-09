import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { CartQuote } from '../../marketplace/api/checkoutApi';
import { formatMoney } from '../../../utils/money';
import { useTranslation } from '../../../hooks/useTranslation';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';
import { Card, InlineError, PriceRow, SectionHeader } from '../../../components/kudya';

export default function OrderSummaryCard({ quote, showStores = true }: { quote: CartQuote; showStores?: boolean }) {
  const { t } = useTranslation();
  const theme = useVerticalTheme();
  const currency = quote.currency;
  const discount = Number(quote.discount_amount);
  const multiStore = quote.stores.length > 1;
  return (
    <View>
      <SectionHeader title={t('ckOrderSummary', 'Order summary')} />
      <Card>
        {showStores && multiStore
          ? quote.stores.map((store) => (
              <View key={store.store_id} style={styles.store}>
                <Text style={[styles.storeName, { color: theme.colors.text }]}>{store.store_name}</Text>
                {store.error ? (
                  <InlineError message={store.error} />
                ) : (
                  <>
                    <PriceRow label={t('ckSubtotal', 'Subtotal')} value={formatMoney(store.subtotal, store.currency ?? currency)} />
                    <PriceRow label={t('ckDeliveryFee', 'Delivery fee')} value={formatMoney(store.delivery_fee, store.currency ?? currency)} />
                  </>
                )}
              </View>
            ))
          : null}
        {!multiStore && quote.stores[0]?.error ? <InlineError message={quote.stores[0].error} /> : null}
        <PriceRow label={t('ckSubtotal', 'Subtotal')} value={formatMoney(quote.subtotal, currency)} />
        <PriceRow label={t('ckDeliveryFee', 'Delivery fee')} value={formatMoney(quote.delivery_fee, currency)} />
        {discount > 0 ? (
          <PriceRow label={t('ckDiscount', 'Discount')} value={`- ${formatMoney(discount, currency)}`} tone="success" />
        ) : null}
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <PriceRow label={t('ckTotal', 'Total')} value={formatMoney(quote.total, currency)} bold />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  store: { marginBottom: 10, gap: 2 },
  storeName: { fontWeight: '800', fontSize: 14, marginBottom: 2 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 8 },
});
