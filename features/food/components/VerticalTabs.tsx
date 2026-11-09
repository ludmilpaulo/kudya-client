import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAppNavigation } from '../../../navigation/hooks';

type IconName = React.ComponentProps<typeof Feather>['name'];

/** Food ↔ Groceries switcher shown at the top of the food home. */
export default function VerticalTabs() {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const tabs: Array<{ key: 'food' | 'groceries'; icon: IconName; label: string; onPress?: () => void }> = [
    { key: 'food', icon: 'coffee', label: t('fdTabFood', 'Food') },
    { key: 'groceries', icon: 'shopping-cart', label: t('fdTabGroceries', 'Groceries'), onPress: () => navigation.navigate('GroceryHome') },
  ];
  return (
    <View style={[styles.wrap, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} accessibilityRole="tablist">
      {tabs.map((tab) => {
        const selected = tab.key === 'food';
        return (
          <Pressable
            key={tab.key}
            testID={`food-vertical-${tab.key}`}
            onPress={tab.onPress}
            disabled={selected}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[styles.tab, selected && { backgroundColor: theme.colors.primary }]}
          >
            <Feather name={tab.icon} size={15} color={selected ? theme.colors.onPrimary : theme.colors.textMuted} />
            <Text style={[styles.label, { color: selected ? theme.colors.onPrimary : theme.colors.textMuted }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', borderRadius: 999, borderWidth: 1, padding: 4 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: 999 },
  label: { fontSize: 14, fontWeight: '800' },
});
