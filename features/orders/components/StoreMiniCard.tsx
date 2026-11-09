import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { Card } from '../../../components/kudya';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';

type Props = {
  name: string;
  logo: string | null;
  subtitle?: string;
  right?: React.ReactNode;
};

export function StoreLogo({ uri, size = 48 }: { uri: string | null; size?: number }) {
  const theme = useVerticalTheme();
  const [failed, setFailed] = useState(false);
  const box = { width: size, height: size, borderRadius: size / 4 };
  if (uri && !failed) {
    return (
      <Image
        source={{ uri }}
        style={[box, { backgroundColor: theme.colors.primarySoft }]}
        contentFit="cover"
        onError={() => setFailed(true)}
        accessibilityIgnoresInvertColors
      />
    );
  }
  return (
    <View style={[box, styles.placeholder, { backgroundColor: theme.colors.primarySoft }]}>
      <Feather name={theme.key === 'groceries' ? 'shopping-bag' : 'coffee'} size={size / 2.4} color={theme.colors.primary} />
    </View>
  );
}

export default function StoreMiniCard({ name, logo, subtitle, right }: Props) {
  const theme = useVerticalTheme();
  return (
    <Card style={styles.card}>
      <StoreLogo uri={logo} />
      <View style={styles.body}>
        <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
          {name}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1 },
  name: { fontSize: 16, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 2 },
});
