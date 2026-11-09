import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVerticalTheme } from '../../contexts/VerticalThemeContext';

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  variant?: 'plain' | 'brand';
};

export default function ScreenHeader({ title, subtitle, onBack, right, variant = 'plain' }: Props) {
  const theme = useVerticalTheme();
  const insets = useSafeAreaInsets();
  const brand = variant === 'brand';
  const fg = brand ? theme.colors.onPrimary : theme.colors.text;
  return (
    <View
      style={[
        styles.wrap,
        { paddingTop: insets.top + 8, backgroundColor: brand ? theme.colors.primary : theme.colors.surface },
        !brand && { borderBottomColor: theme.colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
      ]}
    >
      <View style={styles.row}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={[styles.back, { backgroundColor: brand ? 'rgba(255,255,255,0.18)' : theme.colors.primarySoft }]}
          >
            <Feather name="chevron-left" size={20} color={brand ? fg : theme.colors.primary} />
          </Pressable>
        ) : null}
        <View style={styles.titles}>
          <Text style={[styles.title, { color: fg }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: brand ? 'rgba(255,255,255,0.85)' : theme.colors.textMuted }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  titles: { flex: 1 },
  title: { fontSize: 18, fontWeight: '800' },
  subtitle: { fontSize: 12, marginTop: 2 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
