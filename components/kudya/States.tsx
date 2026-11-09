import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useVerticalTheme } from '../../contexts/VerticalThemeContext';
import PrimaryButton from './PrimaryButton';

type IconName = React.ComponentProps<typeof Feather>['name'];

export function LoadingState({ label }: { label?: string }) {
  const theme = useVerticalTheme();
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {label ? <Text style={[styles.body, { color: theme.colors.textMuted }]}>{label}</Text> : null}
    </View>
  );
}

export function EmptyState({
  icon = 'inbox',
  title,
  body,
  actionLabel,
  onAction,
}: {
  icon?: IconName;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const theme = useVerticalTheme();
  return (
    <View style={styles.center}>
      <View style={[styles.iconWrap, { backgroundColor: theme.colors.primarySoft }]}>
        <Feather name={icon} size={30} color={theme.colors.primary} />
      </View>
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      {body ? <Text style={[styles.body, { color: theme.colors.textMuted }]}>{body}</Text> : null}
      {actionLabel && onAction ? (
        <PrimaryButton title={actionLabel} onPress={onAction} style={styles.action} />
      ) : null}
    </View>
  );
}

export function ErrorState({
  title,
  body,
  retryLabel = 'Try again',
  onRetry,
}: {
  title: string;
  body?: string;
  retryLabel?: string;
  onRetry?: () => void;
}) {
  const theme = useVerticalTheme();
  return (
    <View style={styles.center}>
      <View style={[styles.iconWrap, { backgroundColor: '#FEE2E2' }]}>
        <Feather name="alert-triangle" size={28} color={theme.colors.error} />
      </View>
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      {body ? <Text style={[styles.body, { color: theme.colors.textMuted }]}>{body}</Text> : null}
      {onRetry ? <PrimaryButton title={retryLabel} variant="outline" onPress={onRetry} style={styles.action} /> : null}
    </View>
  );
}

export function InlineError({ message }: { message: string }) {
  const theme = useVerticalTheme();
  return (
    <View style={[styles.inline, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]} accessibilityRole="alert">
      <Feather name="alert-circle" size={16} color={theme.colors.error} />
      <Text style={[styles.inlineText, { color: theme.colors.error }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  iconWrap: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  title: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  body: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  action: { marginTop: 8, alignSelf: 'stretch' },
  inline: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 12, borderWidth: 1 },
  inlineText: { flex: 1, fontSize: 13, fontWeight: '600' },
});
