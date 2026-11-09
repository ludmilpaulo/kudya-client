import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';

type Tab<K extends string> = { key: K; label: string };

export default function SegmentedTabs<K extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: Tab<K>[];
  value: K;
  onChange: (key: K) => void;
}) {
  const theme = useVerticalTheme();
  return (
    <View style={[styles.row, { borderBottomColor: theme.colors.border }]} accessibilityRole="tablist">
      {tabs.map((tab) => {
        const active = tab.key === value;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.tab, active && { borderBottomColor: theme.colors.primary }]}
          >
            <Text style={[styles.label, { color: active ? theme.colors.primary : theme.colors.textMuted }]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  label: { fontSize: 14, fontWeight: '800' },
});
