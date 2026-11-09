import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { formatMoney } from '../../../utils/money';

/** `total` is the server-quoted amount; null while the quote is loading or unavailable. */
type Props = { count: number; total: string | number | null; currency: string; onPress: () => void };

export default function ViewCartBar({ count, total, currency, onPress }: Props) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const itemsLabel = count === 1 ? t('fdOneItem', '1 item') : t('fdItemCount', '{count} items', { count });
  const amount = total === null ? '' : formatMoney(total, currency);
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
      <Pressable
        testID="food-view-cart"
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={[t('fdViewCart', 'View cart'), itemsLabel, amount].filter(Boolean).join(', ')}
        style={({ pressed }) => [styles.bar, { backgroundColor: theme.colors.primary }, pressed && { opacity: 0.9 }]}
      >
        <View style={styles.count}>
          <Feather name="shopping-bag" size={16} color={theme.colors.onPrimary} />
          <Text style={[styles.text, { color: theme.colors.onPrimary }]}>{itemsLabel}</Text>
        </View>
        <Text style={[styles.title, { color: theme.colors.onPrimary }]}>{t('fdViewCart', 'View cart')}</Text>
        <Text style={[styles.text, { color: theme.colors.onPrimary }]}>{amount || '…'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 8 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 54,
    borderRadius: 999,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  count: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 16, fontWeight: '800' },
  text: { fontSize: 14, fontWeight: '700' },
});
