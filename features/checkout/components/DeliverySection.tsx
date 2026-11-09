import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { Card, SectionHeader } from '../../../components/kudya';

export type LocationStatus = 'idle' | 'locating' | 'ready' | 'unavailable';

type Props = {
  useCurrentLocation: boolean;
  onToggleCurrentLocation: (value: boolean) => void;
  locationStatus: LocationStatus;
  address: string;
  onAddressChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  savedAddressLabel?: string | null;
  onChooseSaved?: () => void;
};

export default function DeliverySection({
  useCurrentLocation,
  onToggleCurrentLocation,
  locationStatus,
  address,
  onAddressChange,
  notes,
  onNotesChange,
  savedAddressLabel,
  onChooseSaved,
}: Props) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const statusText =
    locationStatus === 'locating'
      ? t('ckLocating', 'Finding your location…')
      : locationStatus === 'ready'
        ? t('ckLocationReady', 'Location found')
        : locationStatus === 'unavailable'
          ? t('ckLocationUnavailable', 'Location unavailable — enter an address below.')
          : '';
  return (
    <View>
      <SectionHeader
        title={t('ckDeliveryAddress', 'Delivery address')}
        actionLabel={onChooseSaved ? savedAddressLabel || t('ckChooseSaved', 'Saved addresses') : undefined}
        onAction={onChooseSaved}
      />
      <Card style={styles.card}>
        <Pressable
          style={styles.toggle}
          onPress={() => onToggleCurrentLocation(!useCurrentLocation)}
          accessibilityRole="switch"
          accessibilityState={{ checked: useCurrentLocation }}
        >
          <View style={[styles.pin, { backgroundColor: theme.colors.primarySoft }]}>
            <Feather name="navigation" size={16} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.toggleTitle, { color: theme.colors.text }]}>
              {t('ckUseCurrentLocation', 'Use my current location')}
            </Text>
            {useCurrentLocation && statusText ? (
              <Text style={[styles.status, { color: locationStatus === 'unavailable' ? theme.colors.error : theme.colors.textMuted }]}>
                {statusText}
              </Text>
            ) : null}
          </View>
          {locationStatus === 'locating' && useCurrentLocation ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <View style={[styles.check, { borderColor: theme.colors.primary, backgroundColor: useCurrentLocation ? theme.colors.primary : 'transparent' }]}>
              {useCurrentLocation ? <Feather name="check" size={13} color={theme.colors.onPrimary} /> : null}
            </View>
          )}
        </Pressable>
        <View style={[styles.field, { borderColor: theme.colors.border }]}>
          <Feather name="map-pin" size={16} color={theme.colors.textMuted} />
          <TextInput
            value={address}
            onChangeText={onAddressChange}
            placeholder={t('ckEnterAddress', 'Street, number, suburb')}
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, { color: theme.colors.text }]}
          />
        </View>
        <View style={[styles.field, styles.notes, { borderColor: theme.colors.border }]}>
          <Feather name="message-square" size={16} color={theme.colors.textMuted} style={{ marginTop: 2 }} />
          <TextInput
            value={notes}
            onChangeText={onNotesChange}
            placeholder={t('ckDeliveryInstructionsPlaceholder', 'Gate code, landmark, call on arrival…')}
            placeholderTextColor={theme.colors.textMuted}
            multiline
            style={[styles.input, styles.notesInput, { color: theme.colors.text }]}
            accessibilityLabel={t('ckDeliveryInstructions', 'Delivery instructions (optional)')}
          />
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pin: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  toggleTitle: { fontSize: 15, fontWeight: '700' },
  status: { fontSize: 12, marginTop: 2 },
  check: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, minHeight: 46 },
  input: { flex: 1, fontSize: 15, paddingVertical: 10 },
  notes: { alignItems: 'flex-start', paddingTop: 2 },
  notesInput: { minHeight: 56, textAlignVertical: 'top' },
});
