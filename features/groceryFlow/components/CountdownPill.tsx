import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { useCountdown } from '../useCountdown';

const pad = (value: number) => String(value).padStart(2, '0');

export default function CountdownPill({ endAt }: { endAt: string | null }) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const countdown = useCountdown(endAt);
  if (!countdown || countdown.expired) return null;
  const time = `${countdown.days > 0 ? `${countdown.days}d ` : ''}${pad(countdown.hours)}:${pad(countdown.minutes)}:${pad(countdown.seconds)}`;
  return (
    <View
      style={[styles.pill, { backgroundColor: theme.colors.primarySoft }]}
      accessibilityLabel={t('grEndsIn', 'Ends in {time}', { time })}
    >
      <Feather name="clock" size={12} color={theme.colors.primary} />
      <Text style={[styles.text, { color: theme.colors.primaryDark }]}>{t('grEndsIn', 'Ends in {time}', { time })}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  text: { fontSize: 12, fontWeight: '800' },
});
