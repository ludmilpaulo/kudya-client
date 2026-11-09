import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { BottomSheet, Chip, InlineError, PrimaryButton } from '../../../components/kudya';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';

/** The backend truncates the reason at 200 characters. */
const MAX_REASON = 200;

type Props = {
  visible: boolean;
  submitting: boolean;
  error: string | null;
  paid: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

export default function CancelOrderSheet({ visible, submitting, error, paid, onClose, onConfirm }: Props) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const reasons = [
    { key: 'changed_mind', label: t('orCancelChangedMind', 'I changed my mind') },
    { key: 'mistake', label: t('orCancelMistake', 'I ordered by mistake') },
    { key: 'too_long', label: t('orCancelTooLong', 'It is taking too long') },
    { key: 'other', label: t('orCancelOther', 'Other') },
  ];
  const [choice, setChoice] = useState<string | null>(null);
  const [details, setDetails] = useState('');

  useEffect(() => {
    if (visible) {
      setChoice(null);
      setDetails('');
    }
  }, [visible]);

  const chosen = reasons.find((reason) => reason.key === choice);
  const reason = [chosen?.label, details.trim()].filter(Boolean).join(': ').slice(0, MAX_REASON);
  const ready = !!chosen && (choice !== 'other' || details.trim().length > 0);

  return (
    <BottomSheet
      visible={visible}
      onClose={submitting ? () => undefined : onClose}
      title={t('orCancelTitle', 'Cancel this order?')}
      footer={
        <View style={styles.footer}>
          <PrimaryButton title={t('orKeepOrder', 'Keep order')} variant="outline" onPress={onClose} disabled={submitting} style={styles.flex} />
          <PrimaryButton
            testID="confirm-cancel-order"
            title={t('orConfirmCancel', 'Cancel order')}
            variant="danger"
            onPress={() => onConfirm(reason)}
            loading={submitting}
            disabled={!ready}
            style={styles.flex}
          />
        </View>
      }
    >
      <Text style={[styles.body, { color: theme.colors.textMuted }]}>
        {paid
          ? t('orCancelPaidBody', 'The restaurant has not accepted it yet. Because you already paid, we will open a refund request for you.')
          : t('orCancelBody', 'The restaurant has not accepted it yet, so you can still cancel.')}
      </Text>
      <View style={styles.chips}>
        {reasons.map((item) => (
          <Chip key={item.key} label={item.label} selected={choice === item.key} onPress={() => setChoice(item.key)} />
        ))}
      </View>
      <TextInput
        value={details}
        onChangeText={setDetails}
        maxLength={MAX_REASON}
        multiline
        placeholder={t('orCancelDetailsPlaceholder', 'Tell us more (optional)')}
        placeholderTextColor={theme.colors.textMuted}
        style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
      />
      {error ? <InlineError message={error} /> : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 14, lineHeight: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, minHeight: 72, marginTop: 14, marginBottom: 8, fontSize: 14, textAlignVertical: 'top' },
  footer: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
});
