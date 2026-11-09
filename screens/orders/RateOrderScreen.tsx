import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppNavigation, useAppRoute } from '../../navigation/hooks';
import { VerticalThemeProvider, useVerticalTheme } from '../../contexts/VerticalThemeContext';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, Chip, InlineError, PrimaryButton, RatingStars, ScreenHeader } from '../../components/kudya';
import { rateOrder, type OrderDetail } from '../../features/commerce/api';
import { useRequireUser } from '../../features/account/useRequireUser';
import { useOrderLive } from '../../features/orders/useOrderLive';
import { orderNumber, orderVertical } from '../../features/orders/format';
import { errorMessage, toast } from '../../utils/notify';
import OrderGate from '../../features/orders/components/OrderGate';
import { StoreLogo } from '../../features/orders/components/StoreMiniCard';

type Translate = ReturnType<typeof useTranslation>['t'];

function quickTags(vertical: string, t: Translate): Array<{ key: string; label: string }> {
  if (vertical === 'groceries') {
    return [
      { key: 'fresh_items', label: t('orTagFreshItems', 'Fresh items') },
      { key: 'fast_delivery', label: t('orTagFastDelivery', 'Fast delivery') },
      { key: 'good_packaging', label: t('orTagGoodPackaging', 'Good packaging') },
      { key: 'great_service', label: t('orTagGreatService', 'Great service') },
    ];
  }
  return [
    { key: 'food_quality', label: t('orTagFoodQuality', 'Food Quality') },
    { key: 'delivery', label: t('orTagDelivery', 'Delivery') },
    { key: 'packaging', label: t('orTagPackaging', 'Packaging') },
    { key: 'driver', label: t('orTagDriver', 'Driver') },
  ];
}

function ratingWord(value: number, t: Translate): string {
  if (value >= 5) return t('orRatingExcellent', 'Excellent!');
  if (value === 4) return t('orRatingGood', 'Good');
  if (value === 3) return t('orRatingOkay', 'Okay');
  if (value > 0) return t('orRatingPoor', 'Could be better');
  return t('orRatingTap', 'Tap a star to rate');
}

function RateBody({ order }: { order: OrderDetail }) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const insets = useSafeAreaInsets();
  const [storeRating, setStoreRating] = useState(order.rating?.store_rating ?? 0);
  const [driverRating, setDriverRating] = useState(order.rating?.driver_rating ?? 0);
  const [tags, setTags] = useState<string[]>(order.rating?.tags ?? []);
  const [comment, setComment] = useState(order.rating?.comment ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const alreadyRated = order.rated || !!order.rating;

  const toggleTag = (key: string) =>
    setTags((prev) => (prev.includes(key) ? prev.filter((tag) => tag !== key) : [...prev, key]));

  const submit = async () => {
    if (!storeRating) {
      setError(t('orRatingRequired', 'Please choose a star rating.'));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await rateOrder(order.id, {
        store_rating: storeRating,
        driver_rating: order.driver && driverRating ? driverRating : null,
        tags,
        comment: comment.trim(),
      });
      toast('success', t('orRatingThanks', 'Thanks for your feedback!'));
      navigation.navigate('OrderHistory', { vertical: theme.key });
    } catch (err) {
      setError(errorMessage(err, t('orRatingFailed', 'We could not submit your rating.')));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.flex, { backgroundColor: theme.colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title={t('orRateYourOrder', 'Rate Your Order')} subtitle={orderNumber(order)} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">
        <Card style={styles.center}>
          <StoreLogo uri={order.store.logo} size={64} />
          <Text style={[styles.store, { color: theme.colors.text }]}>{order.store.name}</Text>
          <Text style={[styles.question, { color: theme.colors.textMuted }]}>{t('orHowWasExperience', 'How was your experience?')}</Text>
          <RatingStars value={storeRating} onChange={alreadyRated ? undefined : setStoreRating} size={36} />
          <Text style={[styles.word, { color: theme.colors.primary }]}>{ratingWord(storeRating, t)}</Text>
        </Card>

        {order.driver ? (
          <Card style={styles.center}>
            <Text style={[styles.question, { color: theme.colors.textMuted }]}>
              {t('orRateDriver', 'Rate your courier {name}', { name: order.driver.name })}
            </Text>
            <RatingStars value={driverRating} onChange={alreadyRated ? undefined : setDriverRating} size={28} />
          </Card>
        ) : null}

        <View>
          <Text style={[styles.section, { color: theme.colors.text }]}>{t('orWhatWentWell', 'What went well?')}</Text>
          <View style={styles.tags}>
            {quickTags(theme.key, t).map((tag) => (
              <Chip
                key={tag.key}
                label={tag.label}
                selected={tags.includes(tag.key)}
                onPress={alreadyRated ? undefined : () => toggleTag(tag.key)}
              />
            ))}
          </View>
        </View>

        <View>
          <Text style={[styles.section, { color: theme.colors.text }]}>{t('orShareFeedback', 'Share your feedback (optional)')}</Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            editable={!alreadyRated}
            multiline
            maxLength={500}
            placeholder={t('orFeedbackPlaceholder', 'Tell us more about your order…')}
            placeholderTextColor={theme.colors.textMuted}
            accessibilityLabel={t('orShareFeedback', 'Share your feedback (optional)')}
            style={[styles.comment, { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          />
        </View>

        {error ? <InlineError message={error} /> : null}
        {alreadyRated ? (
          <Text style={[styles.question, { color: theme.colors.textMuted, textAlign: 'center' }]}>
            {t('orAlreadyRated', 'You have already rated this order. Thank you!')}
          </Text>
        ) : (
          <PrimaryButton testID="submit-rating" title={t('orSubmitReview', 'Submit Review')} loading={submitting} onPress={() => void submit()} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function RateOrderScreen() {
  const { params } = useAppRoute<'RateOrder'>();
  const navigation = useAppNavigation();
  const { token, signedIn } = useRequireUser();
  const { t } = useTranslation();
  const live = useOrderLive(params.orderId, { token, live: false });

  return (
    <VerticalThemeProvider vertical={orderVertical(live.order, params.vertical)}>
      <OrderGate
        title={t('orRateYourOrder', 'Rate Your Order')}
        onBack={() => navigation.goBack()}
        order={live.order}
        loading={live.loading}
        error={live.error}
        onRetry={live.reload}
        signedIn={signedIn}
        onSignIn={() => navigation.navigate('UserLogin')}
      >
        {(order) => <RateBody key={order.id} order={order} />}
      </OrderGate>
    </VerticalThemeProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 16 },
  center: { alignItems: 'center', gap: 8 },
  store: { fontSize: 18, fontWeight: '800' },
  question: { fontSize: 14 },
  word: { fontSize: 15, fontWeight: '800' },
  section: { fontSize: 15, fontWeight: '800', marginBottom: 10 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  comment: { minHeight: 100, borderWidth: 1, borderRadius: 14, padding: 12, fontSize: 15, textAlignVertical: 'top' },
});
