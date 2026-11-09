import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';
import { useAppNavigation } from '../../../navigation/hooks';
import { useTranslation } from '../../../hooks/useTranslation';
import { useGroceryCart } from '../useGroceryCart';

export default function CartButton({ tone = 'plain' }: { tone?: 'plain' | 'brand' }) {
  const theme = useVerticalTheme();
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const { count } = useGroceryCart();
  const brand = tone === 'brand';
  return (
    <Pressable
      onPress={() => navigation.navigate('Cart', { vertical: 'groceries' })}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={t('grCartWithCount', 'Cart, {count} items', { count })}
      style={[styles.button, { backgroundColor: brand ? 'rgba(255,255,255,0.18)' : theme.colors.primarySoft }]}
    >
      <Feather name="shopping-cart" size={18} color={brand ? theme.colors.onPrimary : theme.colors.primary} />
      {count > 0 ? (
        <View style={[styles.badge, { backgroundColor: brand ? theme.colors.accent : theme.colors.primary }]}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
});
