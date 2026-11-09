import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { Chip } from '../../../components/kudya';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';
import type { StoreSummary } from '../../commerce/api';
import { formatMoney } from '../../../utils/money';
import { storeEta, storeImage } from '../product';

type Props = { store: StoreSummary; onScheduled: () => void };

export default function StoreHero({ store, onScheduled }: Props) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const eta = storeEta(store);
  const fee =
    store.delivery_fee == null
      ? null
      : Number(store.delivery_fee) === 0
        ? t('grFreeDelivery', 'Free delivery')
        : t('grFeeDelivery', '{fee} delivery', { fee: formatMoney(store.delivery_fee) });
  const meta = [t('grGroceries', 'Groceries'), eta, fee].filter(Boolean).join(' · ');
  const banner = storeImage(store);
  const logo = storeImage(store, 'logo');

  return (
    <View>
      <View style={[styles.banner, { backgroundColor: theme.colors.primarySoft }]}>
        {banner ? <Image source={{ uri: banner }} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
        {store.is_open === false ? (
          <View style={styles.closed}>
            <Text style={styles.closedText}>{t('grClosedNow', 'Closed now')}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <View style={[styles.logo, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          {logo ? (
            <Image source={{ uri: logo }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <Text style={[styles.logoLetter, { color: theme.colors.primary }]}>{store.name.slice(0, 1)}</Text>
          )}
        </View>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={2}>
            {store.name}
          </Text>
          <Feather name="check-circle" size={16} color={theme.colors.primary} accessibilityLabel={t('grVerified', 'Verified store')} />
        </View>
        {store.rating ? (
          <View style={styles.metaRow}>
            <Feather name="star" size={14} color={theme.colors.accent} />
            <Text style={[styles.rating, { color: theme.colors.text }]}>{store.rating.toFixed(1)}</Text>
            <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
              {t('grRatingCount', '({count} ratings)', { count: store.rating_count })}
            </Text>
          </View>
        ) : null}
        <Text style={[styles.meta, { color: theme.colors.textMuted }]}>{meta}</Text>
        {store.promo_text ? (
          <Text style={[styles.promo, { color: theme.colors.primaryDark }]} numberOfLines={2}>
            {store.promo_text}
          </Text>
        ) : null}
        <View style={styles.chips}>
          <Chip label={t('grScheduledDelivery', 'Scheduled Delivery')} icon="calendar" selected onPress={onScheduled} />
          <Chip label={t('grInStorePrices', 'In-store Prices')} icon="tag" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { height: 140, overflow: 'hidden' },
  closed: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(17,24,39,0.5)', alignItems: 'center', justifyContent: 'center' },
  closedText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  body: { paddingHorizontal: 16, paddingBottom: 12, gap: 4 },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 18,
    borderWidth: 2,
    marginTop: -36,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  logoLetter: { fontSize: 30, fontWeight: '800' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 22, fontWeight: '800', flexShrink: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { fontSize: 14, fontWeight: '800' },
  meta: { fontSize: 13 },
  promo: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
});
