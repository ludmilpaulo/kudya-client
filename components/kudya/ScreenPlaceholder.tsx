import React from 'react';
import { View } from 'react-native';
import { useAppNavigation } from '../../navigation/hooks';
import { VerticalThemeProvider, useVerticalTheme } from '../../contexts/VerticalThemeContext';
import ScreenHeader from './ScreenHeader';
import { EmptyState } from './States';

function PlaceholderBody({ title }: { title: string }) {
  const theme = useVerticalTheme();
  const navigation = useAppNavigation();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader title={title} onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} />
      <EmptyState icon="tool" title={title} body="This screen is being prepared." />
    </View>
  );
}

export function createPlaceholderScreen(title: string, vertical?: 'food' | 'groceries') {
  function Placeholder() {
    return (
      <VerticalThemeProvider vertical={vertical}>
        <PlaceholderBody title={title} />
      </VerticalThemeProvider>
    );
  }
  Placeholder.displayName = `Placeholder(${title})`;
  return Placeholder;
}
