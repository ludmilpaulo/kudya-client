import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';

type Props = {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  onPress: () => void;
  badge?: number;
  /** `onBrand` sits on the purple header; the default floats over images. */
  tone?: 'default' | 'onBrand';
  testID?: string;
};

export default function IconButton({ icon, label, onPress, badge, tone = 'default', testID }: Props) {
  const theme = useVerticalTheme();
  const onBrand = tone === 'onBrand';
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={badge ? `${label} (${badge})` : label}
      hitSlop={6}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: onBrand ? 'rgba(255,255,255,0.18)' : theme.colors.surface },
        !onBrand && styles.shadow,
        pressed && styles.pressed,
      ]}
    >
      <Feather name={icon} size={20} color={onBrand ? theme.colors.onPrimary : theme.colors.text} />
      {badge ? (
        <View style={[styles.badge, { backgroundColor: theme.colors.accent }]}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  shadow: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  pressed: { opacity: 0.8 },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
});
