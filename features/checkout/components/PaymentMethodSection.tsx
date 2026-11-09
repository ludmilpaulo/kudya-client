import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useGetPaymentMethodsQuery } from '../../../redux/slices/paymentsApi';
import type { AvailablePaymentMethod } from '../../../types/payments';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { Card, InlineError, OptionRow, SectionHeader } from '../../../components/kudya';

type IconName = React.ComponentProps<typeof Feather>['name'];

function iconForMethod(code: string): IconName {
  if (code === 'wallet') return 'briefcase';
  if (code === 'card' || code.startsWith('thunes_card')) return 'credit-card';
  if (code === 'ecocash' || code === 'mobile_money' || code.includes('mobile')) return 'smartphone';
  if (code === 'bank_transfer') return 'home';
  if (code === 'cash') return 'dollar-sign';
  return 'credit-card';
}

type Props = {
  serviceType?: string;
  value: string;
  onChange: (code: string) => void;
  phone: string;
  onPhoneChange: (value: string) => void;
  proofName: string | null;
  onPickProof: () => void;
};

export default function PaymentMethodSection({
  serviceType = 'order',
  value,
  onChange,
  phone,
  onPhoneChange,
  proofName,
  onPickProof,
}: Props) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useGetPaymentMethodsQuery(serviceType);
  const methods = useMemo<AvailablePaymentMethod[]>(
    () => (data?.methods ?? []).filter((method) => method.available),
    [data?.methods],
  );

  useEffect(() => {
    if (!methods.length) return;
    if (!methods.some((method) => method.code === value)) {
      const preferred = methods.find((method) => method.code === data?.default_method);
      onChange((preferred ?? methods[0]).code);
    }
  }, [methods, value, onChange, data?.default_method]);

  const selected = methods.find((method) => method.code === value);

  return (
    <View>
      <SectionHeader title={t('ckPaymentMethod', 'Payment method')} />
      {isLoading ? (
        <Card>
          <Text style={{ color: theme.colors.textMuted }}>…</Text>
        </Card>
      ) : null}
      {isError ? (
        <Pressable onPress={() => void refetch()}>
          <InlineError message={t('paymentMethodsLoadError', 'Could not load payment methods. Tap to retry.')} />
        </Pressable>
      ) : null}
      <View style={styles.list}>
        {methods.map((method) => (
          <OptionRow
            key={method.code}
            title={method.label}
            subtitle={method.requires_proof ? t('ckSelectProof', 'Upload proof of payment') : undefined}
            selected={method.code === value}
            onPress={() => onChange(method.code)}
            left={
              <View style={[styles.icon, { backgroundColor: theme.colors.primarySoft }]}>
                <Feather name={iconForMethod(method.code)} size={18} color={theme.colors.primary} />
              </View>
            }
          />
        ))}
      </View>
      {selected?.requires_phone ? (
        <Card style={styles.extra}>
          <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
            {t('ckEcocashHint', 'Confirm the payment on your phone. Kudya never asks for your PIN.')}
          </Text>
          <TextInput
            value={phone}
            onChangeText={onPhoneChange}
            keyboardType="phone-pad"
            placeholder={t('ckPhoneNumber', 'Phone number')}
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
          />
        </Card>
      ) : null}
      {selected?.requires_proof ? (
        <Card style={styles.extra}>
          {(selected.bank_accounts ?? []).map((bank) => (
            <View key={bank.id} style={styles.bank}>
              <Text style={[styles.bankName, { color: theme.colors.text }]}>{bank.bank_name}</Text>
              <Text style={{ color: theme.colors.textMuted }}>{bank.account_name}</Text>
              <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{bank.account_number}</Text>
              {bank.payment_reference_instructions ? (
                <Text style={{ color: theme.colors.textMuted }}>{bank.payment_reference_instructions}</Text>
              ) : null}
            </View>
          ))}
          <Pressable
            onPress={onPickProof}
            style={[styles.proof, { borderColor: theme.colors.primary }]}
            accessibilityRole="button"
          >
            <Feather name="upload" size={16} color={theme.colors.primary} />
            <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>
              {proofName ? t('ckProofSelected', 'Proof: {name}', { name: proofName }) : t('ckSelectProof', 'Upload proof of payment')}
            </Text>
          </Pressable>
        </Card>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  icon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  extra: { marginTop: 10, gap: 10 },
  hint: { fontSize: 13 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, height: 44, fontSize: 15 },
  bank: { gap: 2, paddingBottom: 8 },
  bankName: { fontWeight: '800' },
  proof: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 12, padding: 12 },
});
