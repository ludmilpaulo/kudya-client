import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useVerticalTheme } from '../../contexts/VerticalThemeContext';

type IconName = React.ComponentProps<typeof Feather>['name'];

export type StoreCardTag = { label: string; icon?: IconName; tone?: 'brand' | 'success' | 'muted' };

type Props = {
  name: string;
  image?: string | null;
  subtitle?: string;
  rating?: number | null;
  ratingCount?: number | null;
  eta?: string | null;
  deliveryFee?: string | null;
  badge?: string | null;
  closed?: boolean;
  closedLabel?: string;
  tags?: StoreCardTag[];
  layout?: 'row' | 'card';
  onPress?: () => void;
  testID?: string;
};

export default function StoreCard({
  name,
  image,
  subtitle,
  rating,
  ratingCount,
  eta,
  deliveryFee,
  badge,
  closed,
  closedLabel = 'Closed',
  tags,
  layout = 'row',
  onPress,
  testID,
}: Props) {
  const theme = useVerticalTheme();
  const card = layout === 'card';
  const tagColors = (tone: StoreCardTag['tone']) =>
    tone === 'success'
      ? { bg: theme.colors.successSoft, fg: theme.colors.success }
      : tone === 'muted'
        ? { bg: theme.colors.background, fg: theme.colors.textMuted }
        : { bg: theme.colors.primarySoft, fg: theme.colors.primaryDark };
  const meta = (
    <View style={styles.meta}>
      {rating ? (
        <View style={styles.metaItem}>
          <Feather name="star" size={12} color={theme.colors.accent} />
          <Text style={[styles.metaText, { color: theme.colors.text }]}>
            {rating.toFixed(1)}
            {ratingCount ? <Text style={{ color: theme.colors.textMuted }}> ({ratingCount})</Text> : null}
          </Text>
        </View>
      ) : null}
      {eta ? (
        <View style={styles.metaItem}>
          <Feather name="clock" size={12} color={theme.colors.textMuted} />
          <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>{eta}</Text>
        </View>
      ) : null}
      {deliveryFee ? (
        <View style={styles.metaItem}>
          <Feather name="truck" size={12} color={theme.colors.textMuted} />
          <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>{deliveryFee}</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={closed ? `${name}, ${closedLabel}` : name}
      style={({ pressed }) => [
        card ? styles.card : styles.row,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.lg },
        pressed && { opacity: 0.9 },
      ]}
    >
      <View style={card ? styles.cardImageWrap : styles.rowImageWrap}>
        {image ? (
          <Image source={{ uri: image }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.placeholder, { backgroundColor: theme.colors.primarySoft }]}>
            <Text style={[styles.placeholderText, { color: theme.colors.primary }]}>{name.slice(0, 1)}</Text>
          </View>
        )}
        {badge ? (
          <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
        {closed ? (
          <View style={styles.closed}>
            <Text style={styles.closedText}>{closedLabel}</Text>
          </View>
        ) : null}
      </View>
      <View style={card ? styles.cardBody : styles.rowBody}>
        <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
          {name}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
        {meta}
        {tags?.length ? (
          <View style={styles.tags}>
            {tags.map((tag) => {
              const colors = tagColors(tag.tone);
              return (
                <View key={tag.label} style={[styles.tag, { backgroundColor: colors.bg }]}>
                  {tag.icon ? <Feather name={tag.icon} size={11} color={colors.fg} /> : null}
                  <Text style={[styles.tagText, { color: colors.fg }]}>{tag.label}</Text>
                </View>
              );
            })}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', borderWidth: 1, padding: 10, gap: 12, alignItems: 'center' },
  card: { borderWidth: 1, overflow: 'hidden', width: 220 },
  rowImageWrap: { width: 76, height: 76, borderRadius: 12, overflow: 'hidden' },
  cardImageWrap: { width: '100%', height: 120, overflow: 'hidden' },
  rowBody: { flex: 1, gap: 3 },
  cardBody: { padding: 12, gap: 3 },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontSize: 28, fontWeight: '800' },
  name: { fontSize: 15, fontWeight: '800' },
  subtitle: { fontSize: 12 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, fontWeight: '600' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 11, fontWeight: '800' },
  badge: { position: 'absolute', left: 8, top: 8, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  closed: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(17,24,39,0.55)', alignItems: 'center', justifyContent: 'center' },
  closedText: { color: '#fff', fontWeight: '800' },
});
