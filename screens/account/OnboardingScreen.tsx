import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppNavigation, useAppRoute } from '../../navigation/hooks';
import { VerticalThemeProvider, useVerticalTheme } from '../../contexts/VerticalThemeContext';
import { useTranslation } from '../../hooks/useTranslation';
import { EmptyState, ErrorState, LoadingState, PrimaryButton } from '../../components/kudya';
import { fetchOnboarding, type OnboardingSlide } from '../../features/commerce/api';
import { markOnboardingDone, type OnboardingVertical } from '../../features/account/onboardingStorage';
import { errorMessage } from '../../utils/notify';
import { useLatestRef } from '../../features/orders/useLatestRef';

type IconName = React.ComponentProps<typeof Feather>['name'];

function slideIcon(name: string): IconName {
  return name in Feather.glyphMap ? (name as IconName) : 'star';
}

function Slide({ slide, width }: { slide: OnboardingSlide; width: number }) {
  const theme = useVerticalTheme();
  return (
    <View style={[styles.slide, { width }]}>
      {slide.image ? (
        <Image source={{ uri: slide.image }} style={styles.image} contentFit="contain" accessibilityIgnoresInvertColors />
      ) : (
        <View style={[styles.iconOuter, { backgroundColor: theme.colors.primarySoft }]}>
          <View style={[styles.iconInner, { backgroundColor: theme.colors.primary }]}>
            <Feather name={slideIcon(slide.icon)} size={56} color={theme.colors.onPrimary} />
          </View>
        </View>
      )}
      <Text style={[styles.title, { color: theme.colors.text }]} accessibilityRole="header">
        {slide.title}
      </Text>
      <Text style={[styles.body, { color: theme.colors.textMuted }]}>{slide.body}</Text>
    </View>
  );
}

function Dots({ count, index }: { count: number; index: number }) {
  const theme = useVerticalTheme();
  return (
    <View style={styles.dots} accessibilityLabel={`${index + 1} / ${count}`}>
      {Array.from({ length: count }).map((_, dot) => (
        <View
          key={dot}
          style={[styles.dot, { backgroundColor: dot === index ? theme.colors.primary : theme.colors.border }, dot === index && styles.dotActive]}
        />
      ))}
    </View>
  );
}

function OnboardingContent({ vertical }: { vertical: OnboardingVertical }) {
  const theme = useVerticalTheme();
  const { t, languageCode } = useTranslation();
  const navigation = useAppNavigation();
  const { params } = useAppRoute<'Onboarding'>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<OnboardingSlide>>(null);
  const [slides, setSlides] = useState<OnboardingSlide[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tRef = useLatestRef(t);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOnboarding(vertical, languageCode);
      setSlides([...data].sort((a, b) => a.sort_order - b.sort_order));
    } catch (err) {
      setError(errorMessage(err, tRef.current('acOnboardingLoadFailed', 'We could not load the introduction.')));
    } finally {
      setLoading(false);
    }
  }, [languageCode, tRef, vertical]);

  useEffect(() => {
    void load();
  }, [load]);

  const finish = async () => {
    await markOnboardingDone(vertical);
    const next = params?.next ?? 'MainTabs';
    if (next === 'MainTabs') navigation.navigate('MainTabs');
    else navigation.replace(next);
  };

  const goTo = (target: number) => {
    listRef.current?.scrollToOffset({ offset: target * width, animated: true });
    setIndex(target);
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / Math.max(width, 1));
    if (next !== index && next >= 0 && next < slides.length) setIndex(next);
  };

  const last = index >= slides.length - 1;
  let body: React.ReactNode;
  if (loading) body = <LoadingState />;
  else if (error)
    body = <ErrorState title={t('acSomethingWrong', 'Something went wrong')} body={error} retryLabel={t('acRetry', 'Try again')} onRetry={() => void load()} />;
  else if (!slides.length)
    body = (
      <EmptyState
        icon="smile"
        title={t('acWelcomeTitle', 'Welcome to Kudya')}
        body={t('acWelcomeBody', 'One app. Everyday needs.')}
        actionLabel={t('acGetStarted', 'Get Started')}
        onAction={() => void finish()}
      />
    );
  else
    body = (
      <>
        <FlatList
          ref={listRef}
          data={slides}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <Slide slide={item} width={width} />}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={32}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          style={styles.flex}
        />
        <Dots count={slides.length} index={index} />
        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <PrimaryButton
            testID="onboarding-next"
            title={last ? t('acGetStarted', 'Get Started') : t('acNext', 'Next')}
            icon={last ? undefined : 'arrow-right'}
            onPress={() => (last ? void finish() : goTo(index + 1))}
          />
        </View>
      </>
    );

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Text style={[styles.brand, { color: theme.colors.primary }]}>{theme.brandName}</Text>
        {!last || error ? (
          <Pressable onPress={() => void finish()} hitSlop={10} accessibilityRole="button" accessibilityLabel={t('acSkip', 'Skip')}>
            <Text style={[styles.skip, { color: theme.colors.textMuted }]}>{t('acSkip', 'Skip')}</Text>
          </Pressable>
        ) : null}
      </View>
      {body}
    </View>
  );
}

export default function OnboardingScreen() {
  const { params } = useAppRoute<'Onboarding'>();
  const vertical: OnboardingVertical = params?.vertical ?? 'app';
  return (
    <VerticalThemeProvider vertical={vertical === 'app' ? undefined : vertical}>
      <OnboardingContent vertical={vertical} />
    </VerticalThemeProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  brand: { fontSize: 18, fontWeight: '900' },
  skip: { fontSize: 15, fontWeight: '700' },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 14 },
  image: { width: '100%', height: 280 },
  iconOuter: { width: 220, height: 220, borderRadius: 110, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  iconInner: { width: 140, height: 140, borderRadius: 70, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '900', textAlign: 'center' },
  body: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 16 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 22 },
  footer: { paddingHorizontal: 20 },
});
