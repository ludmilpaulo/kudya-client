import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card, EmptyState, ErrorState, LoadingState, RatingStars } from '../../../components/kudya';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { errorMessage } from '../../../utils/notify';
import { fetchStoreReviews, type StoreReview } from '../../commerce/api';
import type { FoodStore } from '../format';
import { useRemote } from '../useRemote';

function formatDate(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  try {
    return date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return date.toDateString();
  }
}

function ReviewCard({ review, locale }: { review: StoreReview; locale: string }) {
  const theme = useVerticalTheme();
  return (
    <Card style={styles.review}>
      <View style={styles.reviewHeader}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.primarySoft }]}>
          <Text style={[styles.avatarText, { color: theme.colors.primary }]}>{review.customer_name.slice(0, 1)}</Text>
        </View>
        <View style={styles.reviewMeta}>
          <Text style={[styles.reviewName, { color: theme.colors.text }]}>{review.customer_name}</Text>
          <Text style={[styles.reviewDate, { color: theme.colors.textMuted }]}>{formatDate(review.created_at, locale)}</Text>
        </View>
        <RatingStars value={review.rating} size={13} />
      </View>
      {review.comment ? <Text style={[styles.comment, { color: theme.colors.text }]}>{review.comment}</Text> : null}
      {review.tags?.length ? (
        <View style={styles.tags}>
          {review.tags.map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: theme.colors.primarySoft }]}>
              <Text style={[styles.tagText, { color: theme.colors.primaryDark }]}>{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Card>
  );
}

export default function RestaurantReviews({ store }: { store: FoodStore }) {
  const theme = useVerticalTheme();
  const { t, languageCode } = useTranslation();
  const { data, loading, error, reload } = useRemote(() => fetchStoreReviews('food', store.id), [store.id]);

  if (loading && !data) return <LoadingState label={t('fdLoadingReviews', 'Loading reviews…')} />;
  if (error) {
    return (
      <ErrorState
        title={t('fdReviewsError', 'Could not load reviews')}
        body={errorMessage(error, t('fdTryAgainLater', 'Please try again in a moment.'))}
        retryLabel={t('fdRetry', 'Try again')}
        onRetry={reload}
      />
    );
  }
  const reviews = data ?? [];
  const average = store.rating ?? (reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0);
  const total = store.rating_count || reviews.length;

  return (
    <View style={styles.wrap}>
      <Card style={styles.summary}>
        <Text style={[styles.average, { color: theme.colors.text }]}>{average ? average.toFixed(1) : '–'}</Text>
        <View style={styles.summaryRight}>
          <RatingStars value={average} size={18} />
          <Text style={[styles.reviewDate, { color: theme.colors.textMuted }]}>
            {t('fdRatingsCount', '{count} ratings', { count: total })}
          </Text>
        </View>
      </Card>
      {reviews.length ? (
        reviews.map((review) => <ReviewCard key={review.id} review={review} locale={languageCode} />)
      ) : (
        <EmptyState
          icon="message-circle"
          title={t('fdNoReviews', 'No reviews yet')}
          body={t('fdNoReviewsBody', 'Be the first to rate this restaurant after your order.')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  average: { fontSize: 36, fontWeight: '900' },
  summaryRight: { gap: 4 },
  review: { gap: 8 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15, fontWeight: '800' },
  reviewMeta: { flex: 1 },
  reviewName: { fontSize: 14, fontWeight: '800' },
  reviewDate: { fontSize: 12 },
  comment: { fontSize: 14, lineHeight: 20 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 11, fontWeight: '700' },
});
