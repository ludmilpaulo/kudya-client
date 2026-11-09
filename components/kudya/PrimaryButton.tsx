import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useVerticalTheme } from '../../contexts/VerticalThemeContext';

type Props = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'solid' | 'outline' | 'ghost' | 'danger';
  icon?: React.ComponentProps<typeof Feather>['name'];
  trailing?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export default function PrimaryButton({
  title,
  onPress,
  disabled,
  loading,
  variant = 'solid',
  icon,
  trailing,
  style,
  testID,
}: Props) {
  const theme = useVerticalTheme();
  const inactive = disabled || loading;
  const solid = variant === 'solid' || variant === 'danger';
  const base = variant === 'danger' ? theme.colors.error : theme.colors.primary;
  const fg = solid ? theme.colors.onPrimary : base;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      onPress={inactive ? undefined : onPress}
      style={({ pressed }) => [
        styles.button,
        { borderRadius: theme.radius.full },
        solid && { backgroundColor: base },
        variant === 'outline' && { borderWidth: 1.5, borderColor: base, backgroundColor: theme.colors.surface },
        variant === 'ghost' && { backgroundColor: theme.colors.primarySoft },
        inactive && styles.disabled,
        pressed && !inactive && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.content}>
          {icon ? <Feather name={icon} size={18} color={fg} /> : null}
          <Text style={[styles.title, { color: fg }]}>{title}</Text>
          {trailing ? <Text style={[styles.trailing, { color: fg }]}>{trailing}</Text> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 50, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 16, fontWeight: '800' },
  trailing: { fontSize: 15, fontWeight: '700', marginLeft: 6, opacity: 0.95 },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
});
