import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useVerticalTheme } from '../../contexts/VerticalThemeContext';

type Props = {
  label: string;
  value: string;
  bold?: boolean;
  tone?: 'default' | 'success' | 'muted';
};

export default function PriceRow({ label, value, bold, tone = 'default' }: Props) {
  const theme = useVerticalTheme();
  const color =
    tone === 'success' ? theme.colors.success : tone === 'muted' ? theme.colors.textMuted : theme.colors.text;
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: bold ? theme.colors.text : theme.colors.textMuted }, bold && styles.bold]}>
        {label}
      </Text>
      <Text style={[styles.value, { color }, bold && styles.boldValue]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  label: { fontSize: 14 },
  value: { fontSize: 14, fontWeight: '600' },
  bold: { fontSize: 16, fontWeight: '800' },
  boldValue: { fontSize: 18, fontWeight: '800' },
});
