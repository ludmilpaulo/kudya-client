import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';
import { isActiveStatus } from '../format';

type Tone = { bg: string; fg: string };

export function useStatusTone(status: string): Tone {
  const theme = useVerticalTheme();
  if (status === 'delivered' || status === 'completed' || status === 'refunded') {
    return { bg: theme.colors.successSoft, fg: theme.colors.success };
  }
  if (status === 'cancelled' || status === 'rejected') return { bg: '#FEE2E2', fg: theme.colors.error };
  if (status === 'pending') return { bg: '#FEF3C7', fg: '#B45309' };
  if (isActiveStatus(status) || status === 'approved') return { bg: theme.colors.primarySoft, fg: theme.colors.primaryDark };
  return { bg: theme.colors.border, fg: theme.colors.textMuted };
}

export default function OrderStatusPill({ status, label }: { status: string; label: string }) {
  const tone = useStatusTone(status);
  return (
    <View style={[styles.pill, { backgroundColor: tone.bg }]} accessibilityLabel={label}>
      <Text style={[styles.text, { color: tone.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' },
  text: { fontSize: 12, fontWeight: '800' },
});
