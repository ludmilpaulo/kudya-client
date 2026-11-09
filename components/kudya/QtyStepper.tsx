import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useVerticalTheme } from '../../contexts/VerticalThemeContext';

type Props = {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  unitLabel?: string;
  compact?: boolean;
  disableIncrement?: boolean;
};

function formatQty(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(value * 10 === Math.round(value * 10) ? 1 : 2);
}

export default function QtyStepper({ value, onIncrement, onDecrement, unitLabel, compact, disableIncrement }: Props) {
  const theme = useVerticalTheme();
  const size = compact ? 28 : 34;
  return (
    <View style={[styles.wrap, { backgroundColor: theme.colors.primarySoft }]}>
      <Pressable
        onPress={onDecrement}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        style={[styles.btn, { width: size, height: size, backgroundColor: theme.colors.surface }]}
      >
        <Feather name={value <= 1 ? 'trash-2' : 'minus'} size={compact ? 13 : 15} color={theme.colors.primary} />
      </Pressable>
      <Text style={[styles.value, { color: theme.colors.text, minWidth: compact ? 26 : 34 }]}>
        {formatQty(value)}
        {unitLabel ? <Text style={[styles.unit, { color: theme.colors.textMuted }]}> {unitLabel}</Text> : null}
      </Text>
      <Pressable
        onPress={disableIncrement ? undefined : onIncrement}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        style={[
          styles.btn,
          { width: size, height: size, backgroundColor: theme.colors.primary },
          disableIncrement && { opacity: 0.4 },
        ]}
      >
        <Feather name="plus" size={compact ? 13 : 15} color={theme.colors.onPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 999, padding: 3, gap: 4 },
  btn: { borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  value: { textAlign: 'center', fontWeight: '800', fontSize: 14 },
  unit: { fontSize: 11, fontWeight: '600' },
});
