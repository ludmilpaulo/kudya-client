import type { AppNavigationProp } from '../../navigation/hooks';

/** Support is a tab inside MainTabs, so it must be reached through the nested navigator. */
export function goToSupport(navigation: AppNavigationProp): void {
  navigation.navigate('MainTabs', { screen: 'Support' } as never);
}

export function goHome(navigation: AppNavigationProp): void {
  navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
}

export function goBackOr(navigation: AppNavigationProp, fallback: () => void): void {
  if (navigation.canGoBack()) navigation.goBack();
  else fallback();
}
