import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';

export default function ImageGallery({ images, label }: { images: string[]; label: string }) {
  const theme = useVerticalTheme();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, 640);
  const [index, setIndex] = useState(0);

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  if (!images.length) {
    return (
      <View style={[styles.empty, { backgroundColor: theme.colors.primarySoft }]}>
        <Feather name="shopping-bag" size={48} color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: theme.colors.surface }}>
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={onScrollEnd}>
        {images.map((uri, position) => (
          <Image
            key={uri}
            source={{ uri }}
            style={{ width, height: 280 }}
            contentFit="contain"
            accessibilityLabel={`${label} ${position + 1}/${images.length}`}
          />
        ))}
      </ScrollView>
      {images.length > 1 ? (
        <View style={styles.dots}>
          {images.map((uri, position) => (
            <View
              key={uri}
              style={[styles.dot, { backgroundColor: position === index ? theme.colors.primary : theme.colors.border }]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { height: 240, alignItems: 'center', justifyContent: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
