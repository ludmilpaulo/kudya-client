import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';

type Props = {
  title: string;
  subtitle?: string;
  ctaLabel: string;
  image?: string | null;
  badge?: string;
  width?: number;
  onPress: () => void;
};

export default function PromoBanner({ title, subtitle, ctaLabel, image, badge, width, onPress }: Props) {
  const theme = useVerticalTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${ctaLabel}`}
      style={[styles.wrap, { width, borderRadius: theme.radius.xl }]}
    >
      <LinearGradient colors={theme.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fill}>
        <View style={styles.copy}>
          {badge ? (
            <View style={styles.badge}>
              <Text style={[styles.badgeText, { color: theme.colors.primaryDark }]} numberOfLines={1}>
                {badge.replace(/\n/g, ' ')}
              </Text>
            </View>
          ) : null}
          <Text style={styles.title} numberOfLines={2}>
            {title.replace(/\n/g, ' ')}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
          <View style={[styles.cta, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.ctaText, { color: theme.colors.primary }]}>{ctaLabel}</Text>
            <Feather name="arrow-right" size={14} color={theme.colors.primary} />
          </View>
        </View>
        {image ? <Image source={{ uri: image }} style={styles.image} contentFit="cover" /> : null}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  fill: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, minHeight: 150 },
  copy: { flex: 1, gap: 6, alignItems: 'flex-start' },
  badge: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  title: { color: '#fff', fontSize: 20, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.88)', fontSize: 13 },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, marginTop: 4 },
  ctaText: { fontSize: 13, fontWeight: '800' },
  image: { width: 110, height: 110, borderRadius: 16 },
});
