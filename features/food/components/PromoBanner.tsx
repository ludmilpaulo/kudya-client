import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';

type Props = {
  title: string;
  subtitle?: string | null;
  image?: string | null;
  ctaLabel?: string;
  onPress?: () => void;
  /** Slim single-line strip used inside the restaurant page. */
  compact?: boolean;
  testID?: string;
};

export default function PromoBanner({ title, subtitle, image, ctaLabel, onPress, compact = false, testID }: Props) {
  const theme = useVerticalTheme();
  const content = (
    <LinearGradient
      colors={theme.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[compact ? styles.compact : styles.fill, { borderRadius: compact ? theme.radius.md : theme.radius.xl }]}
    >
      {compact ? <Feather name="tag" size={16} color={theme.colors.onPrimary} /> : null}
      <View style={styles.copy}>
        <Text style={compact ? styles.compactTitle : styles.title} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
        {!compact && ctaLabel ? (
          <View style={[styles.cta, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.ctaText, { color: theme.colors.primary }]}>{ctaLabel}</Text>
            <Feather name="arrow-right" size={14} color={theme.colors.primary} />
          </View>
        ) : null}
      </View>
      {!compact && image ? <Image source={{ uri: image }} style={styles.image} contentFit="cover" /> : null}
    </LinearGradient>
  );
  if (!onPress) return <View testID={testID}>{content}</View>;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={ctaLabel ? `${title}. ${ctaLabel}` : title}
      style={({ pressed }) => pressed && styles.pressed}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, minHeight: 140, overflow: 'hidden' },
  compact: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
  copy: { flex: 1, gap: 4, alignItems: 'flex-start' },
  title: { color: '#fff', fontSize: 19, fontWeight: '800' },
  compactTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.88)', fontSize: 13 },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, marginTop: 6 },
  ctaText: { fontSize: 13, fontWeight: '800' },
  image: { width: 100, height: 100, borderRadius: 16 },
  pressed: { opacity: 0.9 },
});
