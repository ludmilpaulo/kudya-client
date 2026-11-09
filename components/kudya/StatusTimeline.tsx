import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useVerticalTheme } from '../../contexts/VerticalThemeContext';

export type TimelineStep = {
  key: string;
  label: string;
  description?: string;
  time?: string | null;
  state: 'done' | 'active' | 'pending';
};

export default function StatusTimeline({ steps }: { steps: TimelineStep[] }) {
  const theme = useVerticalTheme();
  return (
    <View>
      {steps.map((step, index) => {
        const last = index === steps.length - 1;
        const done = step.state === 'done';
        const active = step.state === 'active';
        const dotColor = done || active ? theme.colors.primary : theme.colors.border;
        return (
          <View key={step.key} style={styles.row} accessibilityLabel={`${step.label}: ${step.state}`}>
            <View style={styles.rail}>
              <View
                style={[
                  styles.dot,
                  { borderColor: dotColor, backgroundColor: done ? theme.colors.primary : theme.colors.surface },
                  active && { backgroundColor: theme.colors.primarySoft },
                ]}
              >
                {done ? <Feather name="check" size={12} color={theme.colors.onPrimary} /> : null}
                {active ? <View style={[styles.pulse, { backgroundColor: theme.colors.primary }]} /> : null}
              </View>
              {!last ? (
                <View style={[styles.line, { backgroundColor: done ? theme.colors.primary : theme.colors.border }]} />
              ) : null}
            </View>
            <View style={[styles.body, !last && styles.bodySpacing]}>
              <View style={styles.titleRow}>
                <Text
                  style={[
                    styles.label,
                    { color: step.state === 'pending' ? theme.colors.textMuted : theme.colors.text },
                  ]}
                >
                  {step.label}
                </Text>
                {step.time ? <Text style={[styles.time, { color: theme.colors.textMuted }]}>{step.time}</Text> : null}
              </View>
              {step.description ? (
                <Text style={[styles.description, { color: theme.colors.textMuted }]}>{step.description}</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  rail: { width: 28, alignItems: 'center' },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  pulse: { width: 8, height: 8, borderRadius: 4 },
  line: { width: 2, flex: 1, minHeight: 22 },
  body: { flex: 1, paddingLeft: 10 },
  bodySpacing: { paddingBottom: 18 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  label: { fontSize: 14, fontWeight: '700' },
  time: { fontSize: 12 },
  description: { fontSize: 12, marginTop: 2 },
});
