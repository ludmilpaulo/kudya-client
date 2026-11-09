import React, { createContext, useContext, useMemo } from 'react';
import { foodTheme, themeForVertical, type VerticalKey, type VerticalTheme } from '../configs/themes/verticalThemes';

const VerticalThemeContext = createContext<VerticalTheme>(foodTheme);

export function VerticalThemeProvider({
  vertical,
  children,
}: {
  vertical?: VerticalKey | string | null;
  children: React.ReactNode;
}) {
  const value = useMemo(() => themeForVertical(vertical), [vertical]);
  return <VerticalThemeContext.Provider value={value}>{children}</VerticalThemeContext.Provider>;
}

export function useVerticalTheme(): VerticalTheme {
  return useContext(VerticalThemeContext);
}

/** Wraps a screen so it renders with the theme of its vertical (route param or explicit). */
export function withVerticalTheme<P extends object>(
  Component: React.ComponentType<P>,
  resolveVertical: (props: P) => VerticalKey | string | null | undefined,
) {
  function Themed(props: P) {
    return (
      <VerticalThemeProvider vertical={resolveVertical(props)}>
        <Component {...props} />
      </VerticalThemeProvider>
    );
  }
  Themed.displayName = `withVerticalTheme(${Component.displayName || Component.name || 'Screen'})`;
  return Themed;
}
