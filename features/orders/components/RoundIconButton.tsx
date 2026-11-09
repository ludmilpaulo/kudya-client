import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';

type Props = {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  solid?: boolean;
  size?: number;
};

export default function RoundIconButton({ icon, label, onPress, disabled, solid = false, size = 44 }: Props) {
  const theme = useVerticalTheme();
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      hitSlop={6}
      style={({ pressed }) => [
        styles.button,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: solid ? theme.colors.primary : theme.colors.primarySoft },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Feather name={icon} size={size * 0.42} color={solid ? theme.colors.onPrimary : theme.colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.8 },
});
