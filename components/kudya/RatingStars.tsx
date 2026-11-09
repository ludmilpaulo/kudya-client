import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useVerticalTheme } from '../../contexts/VerticalThemeContext';

type Props = {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
};

export default function RatingStars({ value, onChange, size = 28 }: Props) {
  const theme = useVerticalTheme();
  return (
    <View style={styles.row} accessibilityRole={onChange ? 'adjustable' : 'text'} accessibilityLabel={`${value} of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const icon = value >= star ? 'star' : value >= star - 0.5 ? 'star-half-o' : 'star-o';
        const glyph = <FontAwesome name={icon} size={size} color={theme.colors.accent} />;
        return onChange ? (
          <Pressable key={star} onPress={() => onChange(star)} hitSlop={6} accessibilityLabel={`${star} stars`}>
            {glyph}
          </Pressable>
        ) : (
          <View key={star}>{glyph}</View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
});
