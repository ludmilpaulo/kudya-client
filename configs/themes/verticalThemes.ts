import { theme as baseTheme } from '../theme';
import { GROCERY_THEME } from '../../features/groceries/theme';

export type VerticalKey = 'food' | 'groceries';

export type VerticalTheme = {
  key: VerticalKey;
  brandName: string;
  colors: {
    primary: string;
    primaryDark: string;
    primarySoft: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    success: string;
    successSoft: string;
    warning: string;
    error: string;
    onPrimary: string;
  };
  gradient: readonly [string, string];
  radius: { sm: number; md: number; lg: number; xl: number; full: number };
};

export const foodTheme: VerticalTheme = {
  key: 'food',
  brandName: 'Kudya Food',
  colors: {
    primary: baseTheme.colors.primary,
    primaryDark: baseTheme.colors.primaryDark,
    primarySoft: '#F3E8FF',
    accent: '#F59E0B',
    background: '#F7F5FB',
    surface: '#FFFFFF',
    text: '#111827',
    textMuted: '#6B7280',
    border: '#E9E3F5',
    success: '#16A34A',
    successSoft: '#DCFCE7',
    warning: '#F59E0B',
    error: baseTheme.colors.error,
    onPrimary: '#FFFFFF',
  },
  gradient: ['#7C3AED', '#5B21B6'],
  radius: { sm: 8, md: 12, lg: 16, xl: 24, full: 999 },
};

export const groceryTheme: VerticalTheme = {
  key: 'groceries',
  brandName: 'Kudya Groceries',
  colors: {
    primary: GROCERY_THEME.primary,
    primaryDark: GROCERY_THEME.dark,
    primarySoft: GROCERY_THEME.light,
    accent: '#F59E0B',
    background: GROCERY_THEME.background,
    surface: GROCERY_THEME.white,
    text: GROCERY_THEME.text,
    textMuted: GROCERY_THEME.muted,
    border: GROCERY_THEME.border,
    success: '#16A34A',
    successSoft: '#DCFCE7',
    warning: '#F59E0B',
    error: baseTheme.colors.error,
    onPrimary: '#FFFFFF',
  },
  gradient: ['#16A34A', '#056B34'],
  radius: { sm: 8, md: 12, lg: 16, xl: 24, full: 999 },
};

export function themeForVertical(vertical?: string | null): VerticalTheme {
  return vertical === 'groceries' || vertical === 'grocery' ? groceryTheme : foodTheme;
}
