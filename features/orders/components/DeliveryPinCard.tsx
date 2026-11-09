import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';

type Props = { pin: string; compact?: boolean; pickup?: boolean };

export default function DeliveryPinCard({ pin, compact = false, pickup = false }: Props) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const label = pickup ? t('orPickupPin', 'Pickup PIN') : t('orDeliveryPin', 'Delivery PIN');
  return (
    <View
      style={[styles.card, { backgroundColor: theme.colors.primarySoft }, compact && styles.compact]}
      accessibilityLabel={`${label} ${pin.split('').join(' ')}`}
    >
      <View style={styles.header}>
        <Feather name="lock" size={14} color={theme.colors.primaryDark} />
        <Text style={[styles.label, { color: theme.colors.primaryDark }]}>{label}</Text>
      </View>
      <Text style={[styles.value, { color: theme.colors.primaryDark }, compact && styles.valueCompact]}>{pin}</Text>
      {!compact ? (
        <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
          {pickup
            ? t('orPickupPinHint', 'Show this PIN at the restaurant counter to collect your order.')
            : t('orDeliveryPinHint', 'Share this PIN with the driver only when you receive your order.')}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 14, alignItems: 'center', gap: 4 },
  compact: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 30, fontWeight: '900', letterSpacing: 8 },
  valueCompact: { fontSize: 22, letterSpacing: 6 },
  hint: { fontSize: 12, textAlign: 'center' },
});
