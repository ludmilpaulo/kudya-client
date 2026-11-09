import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppNavigation, useAppRoute } from '../../navigation/hooks';
import { VerticalThemeProvider, useVerticalTheme } from '../../contexts/VerticalThemeContext';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, EmptyState, ErrorState, LoadingState, PrimaryButton, ScreenHeader, SectionHeader } from '../../components/kudya';
import { fetchAvailableCoupons, type AvailableCoupon } from '../../features/commerce/api';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { selectCheckoutDraft, setDraftCoupon } from '../../redux/slices/checkoutDraftSlice';
import { formatDate, toNumber } from '../../features/orders/format';
import { errorMessage, toast } from '../../utils/notify';
import { useLatestRef } from '../../features/orders/useLatestRef';

type Translate = ReturnType<typeof useTranslation>['t'];

function amountText(value: string | number): string {
  const number = toNumber(value);
  return Number.isInteger(number) ? String(number) : number.toFixed(2);
}

function discountText(coupon: AvailableCoupon, t: Translate): string {
  return coupon.discount_type === 'percent'
    ? t('acPercentOff', '{value}% off', { value: amountText(coupon.discount_value) })
    : t('acAmountOff', '{value} off', { value: amountText(coupon.discount_value) });
}

function CouponCard({ coupon, applied, onApply }: { coupon: AvailableCoupon; applied: boolean; onApply: () => void }) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const details = [
    coupon.min_order ? t('acMinOrder', 'Min. order {amount}', { amount: amountText(coupon.min_order) }) : null,
    coupon.expires_at ? t('acExpires', 'Expires {date}', { date: formatDate(coupon.expires_at) }) : null,
    coupon.store_name,
  ].filter(Boolean);
  return (
    <Card style={[styles.card, !coupon.eligible && styles.ineligible]}>
      <View style={[styles.ticket, { backgroundColor: theme.colors.primarySoft }]}>
        <Feather name="tag" size={18} color={theme.colors.primary} />
        <Text style={[styles.ticketText, { color: theme.colors.primaryDark }]} numberOfLines={2}>
          {discountText(coupon, t)}
        </Text>
      </View>
      <View style={styles.flex}>
        <Text style={[styles.code, { color: theme.colors.text }]}>{coupon.code}</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>{coupon.title}</Text>
        {coupon.description ? <Text style={[styles.meta, { color: theme.colors.textMuted }]}>{coupon.description}</Text> : null}
        {details.length ? <Text style={[styles.meta, { color: theme.colors.textMuted }]}>{details.join(' · ')}</Text> : null}
        {!coupon.eligible && coupon.reason ? <Text style={[styles.reason, { color: theme.colors.error }]}>{coupon.reason}</Text> : null}
      </View>
      <PrimaryButton
        title={applied ? t('acApplied', 'Applied') : t('acApply', 'Apply')}
        variant={applied ? 'ghost' : 'solid'}
        disabled={!coupon.eligible || applied}
        onPress={onApply}
        style={styles.apply}
      />
    </Card>
  );
}

function CouponsContent() {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const dispatch = useAppDispatch();
  const { params } = useAppRoute<'Coupons'>();
  const applied = useAppSelector(selectCheckoutDraft).couponCode;
  const [code, setCode] = useState('');
  const [coupons, setCoupons] = useState<AvailableCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tRef = useLatestRef(t);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAvailableCoupons(params?.vertical, params?.subtotal);
      setCoupons([...data].sort((a, b) => Number(b.eligible) - Number(a.eligible)));
    } catch (err) {
      setError(errorMessage(err, tRef.current('acCouponsLoadFailed', 'We could not load available coupons.')));
    } finally {
      setLoading(false);
    }
  }, [params?.subtotal, params?.vertical, tRef]);

  useEffect(() => {
    void load();
  }, [load]);

  const apply = (value: string) => {
    const trimmed = value.trim().toUpperCase();
    if (!trimmed) return;
    dispatch(setDraftCoupon(trimmed));
    toast('success', t('acCouponApplied', 'Coupon {code} applied', { code: trimmed }), t('acCouponCheckout', 'The discount is confirmed at checkout.'));
    navigation.goBack();
  };

  const header = (
    <View style={styles.headerBlock}>
      <View style={styles.inputRow}>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder={t('acEnterCoupon', 'Enter coupon code')}
          placeholderTextColor={theme.colors.textMuted}
          autoCapitalize="characters"
          autoCorrect={false}
          onSubmitEditing={() => apply(code)}
          accessibilityLabel={t('acEnterCoupon', 'Enter coupon code')}
          style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
        />
        <PrimaryButton testID="apply-coupon" title={t('acApply', 'Apply')} disabled={!code.trim()} onPress={() => apply(code)} />
      </View>
      {applied ? (
        <View style={[styles.appliedRow, { backgroundColor: theme.colors.successSoft }]}>
          <Feather name="check-circle" size={16} color={theme.colors.success} />
          <Text style={[styles.appliedText, { color: theme.colors.success }]}>
            {t('acCouponActive', '{code} will be applied at checkout', { code: applied })}
          </Text>
          <PrimaryButton title={t('acRemove', 'Remove')} variant="ghost" style={styles.remove} onPress={() => dispatch(setDraftCoupon(''))} />
        </View>
      ) : null}
      <SectionHeader title={t('acAvailableOffers', 'Available offers')} />
    </View>
  );

  let listBody: React.ReactElement | null = null;
  if (loading) listBody = <LoadingState />;
  else if (error) listBody = <ErrorState title={t('acSomethingWrong', 'Something went wrong')} body={error} retryLabel={t('acRetry', 'Try again')} onRetry={() => void load()} />;
  else if (!coupons.length) listBody = <EmptyState icon="tag" title={t('acNoCoupons', 'No coupons right now')} body={t('acNoCouponsBody', 'Check back soon for new offers.')} />;

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title={t('acApplyCoupon', 'Apply Coupon')} onBack={() => navigation.goBack()} />
      <FlatList
        data={listBody ? [] : coupons}
        keyExtractor={(item) => item.code}
        ListHeaderComponent={header}
        ListEmptyComponent={listBody}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => <CouponCard coupon={item} applied={applied === item.code} onApply={() => apply(item.code)} />}
      />
    </View>
  );
}

export default function CouponsScreen() {
  const { params } = useAppRoute<'Coupons'>();
  return (
    <VerticalThemeProvider vertical={params?.vertical}>
      <CouponsContent />
    </VerticalThemeProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: 16, gap: 12, flexGrow: 1 },
  headerBlock: { gap: 14, marginBottom: 2 },
  inputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  input: { flex: 1, height: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, fontSize: 15, fontWeight: '700', letterSpacing: 1 },
  appliedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 12, borderRadius: 12 },
  appliedText: { flex: 1, fontSize: 13, fontWeight: '700' },
  remove: { minHeight: 40, backgroundColor: 'transparent' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ineligible: { opacity: 0.7 },
  ticket: { width: 72, minHeight: 72, borderRadius: 12, alignItems: 'center', justifyContent: 'center', padding: 6, gap: 4 },
  ticketText: { fontSize: 12, fontWeight: '900', textAlign: 'center' },
  code: { fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  title: { fontSize: 15, fontWeight: '700', marginTop: 2 },
  meta: { fontSize: 12, marginTop: 2 },
  reason: { fontSize: 12, marginTop: 4, fontWeight: '600' },
  apply: { minHeight: 38, paddingHorizontal: 14 },
});
