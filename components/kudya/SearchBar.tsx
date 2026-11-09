import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useVerticalTheme } from '../../contexts/VerticalThemeContext';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  onFilterPress?: () => void;
  onSubmit?: () => void;
  autoFocus?: boolean;
};

export default function SearchBar({ value, onChangeText, placeholder, onFilterPress, onSubmit, autoFocus }: Props) {
  const theme = useVerticalTheme();
  return (
    <View style={styles.row}>
      <View style={[styles.field, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Feather name="search" size={18} color={theme.colors.textMuted} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          autoFocus={autoFocus}
          style={[styles.input, { color: theme.colors.text }]}
        />
        {value ? (
          <Pressable onPress={() => onChangeText('')} hitSlop={8} accessibilityLabel="Clear search">
            <Feather name="x" size={16} color={theme.colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {onFilterPress ? (
        <Pressable
          onPress={onFilterPress}
          accessibilityRole="button"
          accessibilityLabel="Filters"
          style={[styles.filter, { backgroundColor: theme.colors.primary }]}
        >
          <Feather name="sliders" size={18} color={theme.colors.onPrimary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 0 },
  filter: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
