import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useVerticalTheme } from '../../contexts/VerticalThemeContext';
import QtyStepper from './QtyStepper';

type Props = {
  name: string;
  description?: string;
  price: string;
  originalPrice?: string | null;
  image?: string | null;
  badge?: string | null;
  quantity?: number;
  unitLabel?: string;
  disabled?: boolean;
  disabledLabel?: string;
  onPress?: () => void;
  onAdd?: () => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  testID?: string;
};

export default function ProductRow({
  name,
  description,
  price,
  originalPrice,
  image,
  badge,
  quantity = 0,
  unitLabel,
  disabled,
  disabledLabel,
  onPress,
  onAdd,
  onIncrement,
  onDecrement,
  testID,
}: Props) {
  const theme = useVerticalTheme();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
    >
      <View style={styles.imageWrap}>
        {image ? (
          <Image source={{ uri: image }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.placeholder, { backgroundColor: theme.colors.primarySoft }]}>
            <Feather name="image" size={20} color={theme.colors.primary} />
          </View>
        )}
        {badge ? (
          <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={2}>
          {name}
        </Text>
        {description ? (
          <Text style={[styles.description, { color: theme.colors.textMuted }]} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
        <View style={styles.footer}>
          <View>
            <Text style={[styles.price, { color: theme.colors.text }]}>{price}</Text>
            {originalPrice ? (
              <Text style={[styles.original, { color: theme.colors.textMuted }]}>{originalPrice}</Text>
            ) : null}
          </View>
          {disabled ? (
            <Text style={[styles.disabled, { color: theme.colors.textMuted }]}>{disabledLabel}</Text>
          ) : quantity > 0 && onIncrement && onDecrement ? (
            <QtyStepper compact value={quantity} unitLabel={unitLabel} onIncrement={onIncrement} onDecrement={onDecrement} />
          ) : onAdd ? (
            <Pressable
              onPress={onAdd}
              accessibilityRole="button"
              accessibilityLabel={`Add ${name}`}
              style={[styles.add, { backgroundColor: theme.colors.primary }]}
            >
              <Feather name="plus" size={18} color={theme.colors.onPrimary} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, padding: 10, borderRadius: 16, borderWidth: 1 },
  imageWrap: { width: 88, height: 88, borderRadius: 12, overflow: 'hidden' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, justifyContent: 'space-between' },
  name: { fontSize: 15, fontWeight: '800' },
  description: { fontSize: 12, marginTop: 2 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  price: { fontSize: 15, fontWeight: '800' },
  original: { fontSize: 11, textDecorationLine: 'line-through' },
  add: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  disabled: { fontSize: 12, fontWeight: '700' },
  badge: { position: 'absolute', left: 6, top: 6, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
});
