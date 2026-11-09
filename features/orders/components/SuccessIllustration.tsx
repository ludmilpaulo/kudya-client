import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';

type IconName = React.ComponentProps<typeof Feather>['name'];

const ORBIT: Array<{ icon: IconName; style: { top?: number; bottom?: number; left?: number; right?: number } }> = [
  { icon: 'star', style: { top: 6, left: 14 } },
  { icon: 'heart', style: { top: 18, right: 6 } },
  { icon: 'smile', style: { bottom: 10, left: 4 } },
];

/** Big themed check with a few floating Feather icons (storyboard "Delivered!" art). */
export default function SuccessIllustration({ icon = 'check' }: { icon?: IconName }) {
  const theme = useVerticalTheme();
  const bag: IconName = theme.key === 'groceries' ? 'shopping-bag' : 'package';
  return (
    <View style={styles.wrap} accessible={false} importantForAccessibility="no-hide-descendants">
      <View style={[styles.outer, { backgroundColor: theme.colors.primarySoft }]}>
        <View style={[styles.inner, { backgroundColor: theme.colors.primary }]}>
          <Feather name={icon} size={52} color={theme.colors.onPrimary} />
        </View>
      </View>
      {ORBIT.map((item) => (
        <View key={item.icon} style={[styles.orbit, item.style, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Feather name={item.icon} size={16} color={theme.colors.accent} />
        </View>
      ))}
      <View style={[styles.orbit, styles.bag, { backgroundColor: theme.colors.successSoft }]}>
        <Feather name={bag} size={18} color={theme.colors.success} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 200, height: 200, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  outer: { width: 150, height: 150, borderRadius: 75, alignItems: 'center', justifyContent: 'center' },
  inner: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  orbit: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bag: { bottom: 14, right: 10, width: 44, height: 44, borderRadius: 22, borderWidth: 0 },
});
