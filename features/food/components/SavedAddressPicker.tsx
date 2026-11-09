import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { InlineError } from '../../../components/kudya';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';
import type { SavedAddress } from '../../commerce/api';

type Props = {
  addresses: SavedAddress[];
  loading: boolean;
  error: boolean;
  selectedId: number | null;
  onSelect: (address: SavedAddress) => void;
  onRetry: () => void;
  onManage: () => void;
};

/** Horizontal chips for GET /api/v1/customers/addresses/ so a saved address is one tap away. */
export default function SavedAddressPicker({ addresses, loading, error, selectedId, onSelect, onRetry, onManage }: Props) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  if (loading && !addresses.length) {
    return (
      <View style={styles.status}>
        <ActivityIndicator color={theme.colors.primary} />
        <Text style={[styles.statusText, { color: theme.colors.textMuted }]}>{t('fdLoadingAddresses', 'Loading saved addresses…')}</Text>
      </View>
    );
  }
  if (error && !addresses.length) {
    return (
      <Pressable onPress={onRetry} accessibilityRole="button">
        <InlineError message={t('fdAddressesError', 'Could not load saved addresses. Tap to retry.')} />
      </Pressable>
    );
  }
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {addresses.map((address) => {
        const selected = address.id === selectedId;
        return (
          <Pressable
            key={address.id}
            testID={`food-saved-address-${address.id}`}
            onPress={() => onSelect(address)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[
              styles.chip,
              {
                borderColor: selected ? theme.colors.primary : theme.colors.border,
                backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
              },
            ]}
          >
            <View style={styles.chipTop}>
              <Feather name={address.is_default ? 'home' : 'map-pin'} size={13} color={theme.colors.primary} />
              <Text style={[styles.label, { color: theme.colors.text }]} numberOfLines={1}>
                {address.label || t('fdSavedAddress', 'Saved address')}
              </Text>
            </View>
            <Text style={[styles.address, { color: theme.colors.textMuted }]} numberOfLines={2}>
              {address.address}
            </Text>
          </Pressable>
        );
      })}
      <Pressable
        onPress={onManage}
        accessibilityRole="button"
        style={[styles.chip, styles.manage, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
      >
        <Feather name={addresses.length ? 'edit-2' : 'plus'} size={16} color={theme.colors.primary} />
        <Text style={[styles.label, { color: theme.colors.primary }]}>
          {addresses.length ? t('fdManageAddresses', 'Manage') : t('fdAddAddress', 'Add address')}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  status: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  statusText: { fontSize: 13 },
  row: { gap: 10, paddingVertical: 2, paddingRight: 8 },
  chip: { width: 170, borderWidth: 1.5, borderRadius: 14, padding: 10, gap: 4 },
  chipTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontSize: 13, fontWeight: '800', flexShrink: 1 },
  address: { fontSize: 12 },
  manage: { width: 110, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
});
