import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppNavigation, useAppRoute } from '../../navigation/hooks';
import { VerticalThemeProvider, useVerticalTheme } from '../../contexts/VerticalThemeContext';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, InlineError, OptionRow, PrimaryButton, ScreenHeader } from '../../components/kudya';
import { requestRefund, type OrderDetail } from '../../features/commerce/api';
import { useRequireUser } from '../../features/account/useRequireUser';
import { useOrderLive } from '../../features/orders/useOrderLive';
import { formatDate, orderNumber, orderVertical, toNumber } from '../../features/orders/format';
import { REFUND_REASONS, refundReasonLabel, refundStatusLabel, type RefundReason } from '../../features/orders/refundReasons';
import { formatMoney } from '../../utils/money';
import { errorMessage, toast } from '../../utils/notify';
import OrderGate from '../../features/orders/components/OrderGate';
import OrderStatusPill from '../../features/orders/components/OrderStatusPill';
import StoreMiniCard from '../../features/orders/components/StoreMiniCard';

function RefundForm({ order }: { order: OrderDetail }) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const insets = useSafeAreaInsets();
  const [reason, setReason] = useState<RefundReason | null>(null);
  const [details, setDetails] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const maxAmount = toNumber(order.total);

  const submit = async () => {
    if (!reason) {
      setError(t('orRefundReasonRequired', 'Please choose a reason.'));
      return;
    }
    const cleaned = amount.replace(',', '.').trim();
    if (cleaned) {
      const value = Number(cleaned);
      if (!Number.isFinite(value) || value <= 0 || value > maxAmount) {
        setError(t('orRefundAmountInvalid', 'Enter an amount between 0 and {max}.', { max: formatMoney(maxAmount, order.currency) }));
        return;
      }
    }
    if (reason === 'other' && !details.trim()) {
      setError(t('orRefundDetailsRequired', 'Please tell us what went wrong.'));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await requestRefund(order.id, {
        reason,
        details: details.trim() || undefined,
        amount: cleaned ? Number(cleaned).toFixed(2) : undefined,
      });
      toast('success', t('orRefundSubmitted', 'Refund request sent'), t('orRefundSubmittedBody', 'We will review it and get back to you.'));
      navigation.navigate('RefundsDisputes');
    } catch (err) {
      setError(errorMessage(err, t('orRefundFailed', 'We could not send your refund request.')));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.flex, { backgroundColor: theme.colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title={t('orRequestRefund', 'Request a refund')} subtitle={orderNumber(order)} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">
        <StoreMiniCard
          name={order.store.name}
          logo={order.store.logo}
          subtitle={`${formatDate(order.created_at)} · ${formatMoney(order.total, order.currency)}`}
        />

        {order.refund ? (
          <Card style={styles.existing}>
            <Text style={[styles.section, { color: theme.colors.text }]}>{t('orRefundExisting', 'A refund was already requested')}</Text>
            <OrderStatusPill status={order.refund.status} label={refundStatusLabel(order.refund.status, t)} />
            <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
              {refundReasonLabel(order.refund.reason, t)} · {formatMoney(order.refund.amount, order.currency)}
            </Text>
            <PrimaryButton title={t('orViewRefunds', 'View refunds')} variant="outline" onPress={() => navigation.navigate('RefundsDisputes')} />
          </Card>
        ) : (
          <>
            <View style={styles.group}>
              <Text style={[styles.section, { color: theme.colors.text }]}>{t('orWhatWentWrong', 'What went wrong?')}</Text>
              {REFUND_REASONS.map((key) => (
                <OptionRow key={key} title={refundReasonLabel(key, t)} selected={reason === key} onPress={() => setReason(key)} />
              ))}
            </View>

            <View style={styles.group}>
              <Text style={[styles.section, { color: theme.colors.text }]}>{t('orRefundDetails', 'Details')}</Text>
              <TextInput
                value={details}
                onChangeText={setDetails}
                multiline
                maxLength={1000}
                placeholder={t('orRefundDetailsPlaceholder', 'Which items were affected? Anything else we should know?')}
                placeholderTextColor={theme.colors.textMuted}
                accessibilityLabel={t('orRefundDetails', 'Details')}
                style={[styles.textarea, { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              />
            </View>

            <View style={styles.group}>
              <Text style={[styles.section, { color: theme.colors.text }]}>{t('orRefundAmount', 'Amount (optional)')}</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder={t('orRefundAmountPlaceholder', 'Up to {max}', { max: formatMoney(maxAmount, order.currency) })}
                placeholderTextColor={theme.colors.textMuted}
                accessibilityLabel={t('orRefundAmount', 'Amount (optional)')}
                style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              />
              <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
                {t('orRefundAmountHint', 'Leave empty and our team will calculate the refund for you.')}
              </Text>
            </View>

            {error ? <InlineError message={error} /> : null}
            <PrimaryButton testID="submit-refund" title={t('orSubmitRequest', 'Submit request')} loading={submitting} onPress={() => void submit()} />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function RefundRequestScreen() {
  const { params } = useAppRoute<'RefundRequest'>();
  const navigation = useAppNavigation();
  const { token, signedIn } = useRequireUser();
  const { t } = useTranslation();
  const live = useOrderLive(params.orderId, { token, live: false });

  return (
    <VerticalThemeProvider vertical={orderVertical(live.order, params.vertical)}>
      <OrderGate
        title={t('orRequestRefund', 'Request a refund')}
        onBack={() => navigation.goBack()}
        order={live.order}
        loading={live.loading}
        error={live.error}
        onRetry={live.reload}
        signedIn={signedIn}
        onSignIn={() => navigation.navigate('UserLogin')}
      >
        {(order) => <RefundForm order={order} />}
      </OrderGate>
    </VerticalThemeProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 18 },
  group: { gap: 10 },
  section: { fontSize: 15, fontWeight: '800' },
  existing: { gap: 10 },
  hint: { fontSize: 12 },
  textarea: { minHeight: 100, borderWidth: 1, borderRadius: 14, padding: 12, fontSize: 15, textAlignVertical: 'top' },
  input: { height: 48, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, fontSize: 15 },
});
