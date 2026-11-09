import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card, EmptyState } from '../../../components/kudya';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { formatMoney } from '../../../utils/money';
import { notify } from '../../../utils/notify';
import { plainText, storeCurrency, toNumber, type FoodStore } from '../format';

type IconName = React.ComponentProps<typeof Feather>['name'];

function shortTime(value: string): string {
  return /^\d{1,2}:\d{2}:\d{2}$/.test(value) ? value.slice(0, -3) : value;
}

function InfoRow({ icon, label, value, onPress }: { icon: IconName; label: string; value: string; onPress?: () => void }) {
  const theme = useVerticalTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={`${label}: ${value}`}
      style={styles.row}
    >
      <View style={[styles.icon, { backgroundColor: theme.colors.primarySoft }]}>
        <Feather name={icon} size={16} color={theme.colors.primary} />
      </View>
      <View style={styles.rowBody}>
        <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>
        <Text style={[styles.value, { color: onPress ? theme.colors.primary : theme.colors.text }]}>{value}</Text>
      </View>
      {onPress ? <Feather name="chevron-right" size={18} color={theme.colors.textMuted} /> : null}
    </Pressable>
  );
}

export default function RestaurantInfo({ store }: { store: FoodStore }) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const minimum = toNumber(store.minimum_order_amount);
  const hours = store.opening_hours ?? [];

  const call = async () => {
    if (!store.phone) return;
    const url = `tel:${store.phone.replace(/\s+/g, '')}`;
    try {
      await Linking.openURL(url);
    } catch {
      notify(t('fdCallFailed', 'Could not start a call'), store.phone);
    }
  };

  const hasDetails = store.address || store.phone || minimum > 0;

  const about = plainText(store.description);

  return (
    <View style={styles.wrap}>
      {about ? (
        <Card>
          <Text style={[styles.about, { color: theme.colors.text }]}>{about}</Text>
        </Card>
      ) : null}
      {hasDetails ? (
        <Card style={styles.card}>
          {store.address ? <InfoRow icon="map-pin" label={t('fdAddress', 'Address')} value={store.address} /> : null}
          {store.phone ? (
            <InfoRow icon="phone" label={t('fdPhone', 'Phone')} value={store.phone} onPress={call} />
          ) : null}
          {minimum > 0 ? (
            <InfoRow
              icon="shopping-bag"
              label={t('fdMinOrder', 'Minimum order')}
              value={formatMoney(minimum, storeCurrency(store))}
            />
          ) : null}
        </Card>
      ) : null}

      <Card style={styles.card}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('fdOpeningHours', 'Opening hours')}</Text>
        {hours.length ? (
          hours.map((entry, index) => (
            <View key={`${entry.day}-${index}`} style={styles.hourRow}>
              <Text style={[styles.day, { color: theme.colors.text }]}>{String(entry.day)}</Text>
              <Text style={[styles.hours, { color: entry.is_closed ? theme.colors.error : theme.colors.textMuted }]}>
                {entry.is_closed ? t('fdClosed', 'Closed') : `${shortTime(entry.from_hour)} – ${shortTime(entry.to_hour)}`}
              </Text>
            </View>
          ))
        ) : (
          <EmptyState icon="clock" title={t('fdNoHours', 'Opening hours not published')} />
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  about: { fontSize: 14, lineHeight: 20 },
  card: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  rowBody: { flex: 1 },
  label: { fontSize: 12, fontWeight: '600' },
  value: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  title: { fontSize: 16, fontWeight: '800' },
  hourRow: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { fontSize: 14, fontWeight: '600' },
  hours: { fontSize: 14, fontWeight: '600' },
});
