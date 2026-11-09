import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { Card } from '../../../components/kudya';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';
import type { OrderDriver } from '../../commerce/api';
import RoundIconButton from './RoundIconButton';

type Props = {
  driver: OrderDriver;
  onCall?: () => void;
  onChat?: () => void;
};

export default function CourierCard({ driver, onCall, onChat }: Props) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const initials = driver.name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <Card style={styles.card}>
      {driver.avatar ? (
        <Image source={{ uri: driver.avatar }} style={styles.avatar} contentFit="cover" accessibilityIgnoresInvertColors />
      ) : (
        <View style={[styles.avatar, styles.initials, { backgroundColor: theme.colors.primarySoft }]}>
          <Text style={[styles.initialsText, { color: theme.colors.primary }]}>{initials || '?'}</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
          {driver.name}
        </Text>
        <View style={styles.meta}>
          <Feather name="truck" size={12} color={theme.colors.textMuted} />
          <Text style={[styles.metaText, { color: theme.colors.textMuted }]} numberOfLines={1}>
            {driver.vehicle || t('orYourCourier', 'Your courier')}
          </Text>
        </View>
      </View>
      {onCall ? (
        <RoundIconButton icon="phone" label={t('orCallDriver', 'Call driver')} onPress={onCall} disabled={!driver.phone} />
      ) : null}
      {onChat ? <RoundIconButton icon="message-circle" label={t('orChatDriver', 'Chat with driver')} onPress={onChat} solid /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  initials: { alignItems: 'center', justifyContent: 'center' },
  initialsText: { fontSize: 18, fontWeight: '900' },
  body: { flex: 1 },
  name: { fontSize: 16, fontWeight: '800' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  metaText: { fontSize: 13 },
});
