import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';

type Props = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  accessibilityLabel: string;
  onComplete?: (value: string) => void;
  hasError?: boolean;
};

/** N visual boxes driven by one transparent TextInput (works for paste + SMS/email autofill and on web). */
export default function OtpCodeInput({ value, onChange, length = 6, accessibilityLabel, onComplete, hasError }: Props) {
  const theme = useVerticalTheme();
  const inputRef = useRef<TextInput>(null);

  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, length);
    onChange(digits);
    if (digits.length === length) onComplete?.(digits);
  };

  return (
    <Pressable onPress={() => inputRef.current?.focus()} style={styles.row} accessible={false}>
      {Array.from({ length }).map((_, index) => {
        const filled = index < value.length;
        const active = index === Math.min(value.length, length - 1);
        return (
          <View
            key={index}
            style={[
              styles.box,
              {
                backgroundColor: theme.colors.surface,
                borderColor: hasError ? theme.colors.error : active || filled ? theme.colors.primary : theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.digit, { color: theme.colors.text }]}>{value[index] ?? ''}</Text>
          </View>
        );
      })}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={length}
        autoFocus
        caretHidden
        accessibilityLabel={accessibilityLabel}
        style={styles.hidden}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  box: { width: 46, height: 56, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  digit: { fontSize: 24, fontWeight: '800' },
  hidden: { ...StyleSheet.absoluteFillObject, opacity: 0.01, color: 'transparent' },
});
