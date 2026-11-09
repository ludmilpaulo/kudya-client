import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { useTranslation } from '../hooks/useTranslation';
import { buildBeneficiary, fieldLabel, fieldOptions, type TransferSection } from '../utils/transferFields';
import {
  fetchTransfer,
  fetchTransferDestinations,
  fetchTransfers,
  requestTransferQuote,
  sendMoneyTransfer,
  verifyTransferBeneficiary,
  type MoneyTransferRow,
  type TransferDestination,
  type TransferQuote,
  type TransferVerification,
} from '../services/transferService';

const SECTIONS: TransferSection[] = ['credit_party_identifier', 'beneficiary'];

function newKey(): string {
  return `mobile-mt-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

type Props = { token: string; currency: string; onSent?: () => void };

export default function ThunesTransferCard({ token, currency, onSent }: Props) {
  const { t } = useTranslation();
  const [destinations, setDestinations] = useState<TransferDestination[] | null>(null);
  const [history, setHistory] = useState<MoneyTransferRow[]>([]);
  const [payerId, setPayerId] = useState('');
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<TransferQuote | null>(null);
  const [choice, setChoice] = useState<Record<TransferSection, number>>({ credit_party_identifier: 0, beneficiary: 0 });
  const [values, setValues] = useState<Record<string, string>>({});
  const [verification, setVerification] = useState<TransferVerification | null>(null);
  const [pin, setPin] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState(newKey);

  useEffect(() => {
    fetchTransferDestinations(token).then(setDestinations).catch(() => setDestinations([]));
    fetchTransfers(token).then(setHistory).catch(() => setHistory([]));
  }, [token]);

  const destination = destinations?.find((row) => row.payer_id === payerId) ?? null;
  const options = useMemo(() => fieldOptions(quote?.required_fields ?? destination?.required_fields), [quote, destination]);
  const expired = quote ? new Date(quote.expires_at).getTime() <= Date.now() : false;

  const resetQuote = () => {
    setQuote(null);
    setVerification(null);
    setConfirmed(false);
  };

  const run = async (action: () => Promise<void>, fallback: string) => {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : fallback);
    } finally {
      setBusy(false);
    }
  };

  const getQuote = () =>
    run(async () => {
      if (!destination) return;
      resetQuote();
      setQuote(
        await requestTransferQuote(token, {
          payer_id: destination.payer_id,
          amount,
          currency,
          destination_currency: destination.currency,
        }),
      );
      setIdempotencyKey(newKey());
    }, t('transferQuoteFailed'));

  const verify = () =>
    run(async () => {
      if (!destination) return;
      setVerification(await verifyTransferBeneficiary(token, destination.payer_id, buildBeneficiary(options, choice, values)));
    }, t('transferVerifyFailed'));

  const send = () =>
    run(async () => {
      if (!quote) return;
      const sent = await sendMoneyTransfer(
        token,
        { quote_id: quote.id, beneficiary: buildBeneficiary(options, choice, values), pin, confirmed: true },
        idempotencyKey,
      );
      setPin('');
      resetQuote();
      setHistory((rows) => [sent, ...rows.filter((row) => row.id !== sent.id)]);
      onSent?.();
    }, t('transferSendFailed'));

  const refresh = (id: number) =>
    run(async () => {
      const row = await fetchTransfer(token, id);
      setHistory((rows) => rows.map((item) => (item.id === id ? row : item)));
    }, t('transferRefreshFailed'));

  const statusText = (row: MoneyTransferRow) => {
    if (row.beneficiary_received) return t('transferDelivered');
    if (row.reversed_to_wallet) return t('transferReversed');
    if (row.open_rfi) return t('transferNeedsInfo');
    return t('transferInProgress');
  };

  if (destinations === null) return <ActivityIndicator color="#fff" style={tw`mt-6`} />;
  if (destinations.length === 0) {
    return <Text style={tw`mt-6 text-slate-300`}>{t('transferUnavailable')}</Text>;
  }

  const input = tw`mt-2 rounded-xl bg-white/10 px-4 py-3 text-white`;
  const chip = (on: boolean) => tw`mr-2 mb-2 rounded-full px-3 py-2 ${on ? 'bg-blue-600' : 'bg-white/10'}`;
  const canSend = Boolean(quote) && !expired && confirmed && pin.length >= 4 && !busy;

  return (
    <View style={tw`mt-6`}>
      <Text style={tw`text-white font-semibold`}>{t('transferDestination')}</Text>
      <View style={tw`mt-2 flex-row flex-wrap`}>
        {destinations.map((row) => (
          <TouchableOpacity
            key={row.payer_id}
            accessibilityRole="button"
            accessibilityState={{ selected: payerId === row.payer_id }}
            onPress={() => {
              setPayerId(row.payer_id);
              setValues({});
              setChoice({ credit_party_identifier: 0, beneficiary: 0 });
              resetQuote();
            }}
            style={chip(payerId === row.payer_id)}
          >
            <Text style={tw`text-white text-xs`}>
              {row.name} · {row.country} · {row.currency}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        value={amount}
        onChangeText={(value) => {
          setAmount(value);
          resetQuote();
        }}
        keyboardType="decimal-pad"
        placeholder={`${t('transferAmount')} (${currency})`}
        placeholderTextColor="#94A3B8"
        style={input}
      />
      <TouchableOpacity
        onPress={() => void getQuote()}
        disabled={!destination || !(Number(amount) > 0) || busy}
        style={tw`mt-3 rounded-xl bg-blue-600 py-3 items-center ${!destination || busy ? 'opacity-50' : ''}`}
      >
        <Text style={tw`text-white font-semibold`}>{t('transferGetQuote')}</Text>
      </TouchableOpacity>

      {quote ? (
        <View style={tw`mt-4 rounded-xl bg-white/10 p-4`}>
          <Text style={tw`text-blue-100`}>{t('transferFee')}: {quote.fee} {quote.source_currency}</Text>
          <Text style={tw`text-white font-semibold mt-1`}>{t('transferTotal')}: {quote.total_debit} {quote.source_currency}</Text>
          <Text style={tw`text-white font-semibold mt-1`}>
            {t('transferReceives')}: {quote.destination_amount} {quote.destination_currency}
          </Text>
          <Text style={tw`text-blue-100 mt-1`}>{t('transferRate')}: {quote.fx_rate || '—'}</Text>
          <Text style={tw`mt-1 ${expired ? 'text-red-300' : 'text-slate-300'} text-xs`}>
            {expired ? t('transferQuoteExpired') : `${t('transferQuoteValid')} ${new Date(quote.expires_at).toLocaleTimeString()}`}
          </Text>
        </View>
      ) : null}

      {quote && !expired ? (
        <View style={tw`mt-4`}>
          {SECTIONS.map((section) =>
            options[section].length ? (
              <View key={section} style={tw`mb-3`}>
                <Text style={tw`text-white font-semibold`}>
                  {section === 'beneficiary' ? t('transferBeneficiaryDetails') : t('transferAccountDetails')}
                </Text>
                {options[section].length > 1 ? (
                  <View style={tw`mt-2 flex-row flex-wrap`}>
                    {options[section].map((group, index) => (
                      <TouchableOpacity
                        key={group.join('+')}
                        onPress={() => {
                          setChoice((prev) => ({ ...prev, [section]: index }));
                          setVerification(null);
                        }}
                        style={chip(choice[section] === index)}
                      >
                        <Text style={tw`text-white text-xs`}>{group.map(fieldLabel).join(' + ')}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : null}
                {(options[section][choice[section]] ?? []).map((name) => {
                  const key = `${section}.${name}`;
                  return (
                    <TextInput
                      key={key}
                      value={values[key] ?? ''}
                      onChangeText={(value) => {
                        setValues((prev) => ({ ...prev, [key]: value }));
                        setVerification(null);
                      }}
                      placeholder={fieldLabel(name)}
                      placeholderTextColor="#94A3B8"
                      style={input}
                    />
                  );
                })}
              </View>
            ) : null,
          )}
          <TouchableOpacity onPress={() => void verify()} disabled={busy} style={tw`rounded-xl bg-white/10 py-3 items-center`}>
            <Text style={tw`text-white`}>{t('transferVerify')}</Text>
          </TouchableOpacity>
          {verification ? (
            <Text style={tw`mt-2 text-sm ${verification.verified ? 'text-emerald-300' : 'text-amber-300'}`}>
              {verification.verified ? t('transferVerified') : verification.warning}
            </Text>
          ) : null}
          <TextInput
            value={pin}
            onChangeText={(value) => setPin(value.replace(/\D/g, '').slice(0, 6))}
            secureTextEntry
            keyboardType="number-pad"
            placeholder={t('transferPin')}
            placeholderTextColor="#94A3B8"
            style={input}
          />
          <View style={tw`mt-3 flex-row items-center`}>
            <Switch value={confirmed} onValueChange={setConfirmed} accessibilityLabel={t('transferConfirmShort')} />
            <Text style={tw`ml-2 flex-1 text-slate-200 text-sm`}>
              {t('transferConfirm', undefined, { amount: `${quote.total_debit} ${quote.source_currency}` })}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => void send()}
            disabled={!canSend}
            style={tw`mt-3 rounded-xl bg-emerald-600 py-3 items-center ${canSend ? '' : 'opacity-50'}`}
          >
            <Text style={tw`text-white font-semibold`}>{t('transferSend')}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {error ? <Text style={tw`mt-3 text-red-300 text-sm`}>{error}</Text> : null}

      {history.length ? (
        <View style={tw`mt-6`}>
          <Text style={tw`text-white font-semibold mb-2`}>{t('transferHistory')}</Text>
          {history.map((row) => (
            <View key={row.id} style={tw`mb-2 rounded-xl bg-white/10 px-4 py-3`}>
              <Text style={tw`text-white`}>
                {row.amount} {row.currency} → {row.destination_amount} {row.destination_currency}
              </Text>
              <Text style={tw`text-blue-200 text-xs mt-1`}>{statusText(row)}</Text>
              {!row.beneficiary_received && !row.reversed_to_wallet ? (
                <TouchableOpacity onPress={() => void refresh(row.id)} style={tw`mt-1 self-start`}>
                  <Text style={tw`text-blue-300 text-xs underline`}>{t('paymentCheckStatus')}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
