import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useVerticalTheme } from '../../contexts/VerticalThemeContext';

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const theme = useVerticalTheme();
  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button">
          <Text style={[styles.action, { color: theme.colors.primary }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const theme = useVerticalTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.lg },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function OptionRow({
  title,
  subtitle,
  selected,
  onPress,
  left,
  right,
}: {
  title: string;
  subtitle?: string;
  selected?: boolean;
  onPress?: () => void;
  left?: React.ReactNode;
  right?: React.ReactNode;
}) {
  const theme = useVerticalTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: !!selected }}
      style={[
        styles.option,
        {
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
        },
      ]}
    >
      {left}
      <View style={{ flex: 1 }}>
        <Text style={[styles.optionTitle, { color: theme.colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.optionSubtitle, { color: theme.colors.textMuted }]}>{subtitle}</Text> : null}
      </View>
      {right ?? (
        <View style={[styles.radio, { borderColor: selected ? theme.colors.primary : theme.colors.border }]}>
          {selected ? <View style={[styles.radioDot, { backgroundColor: theme.colors.primary }]} /> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  title: { fontSize: 17, fontWeight: '800' },
  action: { fontSize: 13, fontWeight: '700' },
  card: { borderWidth: 1, padding: 14 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1.5 },
  optionTitle: { fontSize: 15, fontWeight: '700' },
  optionSubtitle: { fontSize: 12, marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
});
