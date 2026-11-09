import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';
import type { GroceryCategory } from '../../groceries/types';
import { featherIcon } from '../product';

export function CategoryGlyph({ category, size }: { category: GroceryCategory; size: number }) {
  const theme = useVerticalTheme();
  if (category.image) {
    return <Image source={{ uri: category.image }} style={{ width: size, height: size }} contentFit="cover" />;
  }
  const icon = category.icon.trim();
  const isEmoji = icon.length > 0 && icon.length <= 4 && !/^[a-z-]+$/i.test(icon);
  return isEmoji ? (
    <Text style={{ fontSize: size * 0.42 }}>{icon}</Text>
  ) : (
    <Feather name={featherIcon(icon, 'shopping-bag')} size={size * 0.36} color={theme.colors.primary} />
  );
}

export default function CategoryTile({ category, onPress }: { category: GroceryCategory; onPress: () => void }) {
  const theme = useVerticalTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={category.name} style={styles.tile}>
      <View style={[styles.circle, { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.border }]}>
        <CategoryGlyph category={category} size={64} />
      </View>
      <Text style={[styles.label, { color: theme.colors.text }]} numberOfLines={2}>
        {category.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: { width: 76, alignItems: 'center', gap: 6 },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
});
