import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';

type Props = {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  last?: boolean;
  testID?: string;
};

export default function SettingsRow({ icon, title, value, onPress, danger, last, testID }: Props) {
  const theme = useVerticalTheme();
  const color = danger ? theme.colors.error : theme.colors.text;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={value ? `${title}, ${value}` : title}
      style={({ pressed }) => [
        styles.row,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border },
        pressed && { backgroundColor: theme.colors.primarySoft },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: danger ? '#FEE2E2' : theme.colors.primarySoft }]}>
        <Feather name={icon} size={17} color={danger ? theme.colors.error : theme.colors.primary} />
      </View>
      <Text style={[styles.title, { color }]} numberOfLines={1}>
        {title}
      </Text>
      {value ? (
        <Text style={[styles.value, { color: theme.colors.textMuted }]} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {!danger ? <Feather name="chevron-right" size={18} color={theme.colors.textMuted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14 },
  icon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 15, fontWeight: '600' },
  value: { fontSize: 13, maxWidth: 140 },
});
