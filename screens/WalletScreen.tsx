import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import { RootState } from '../redux/store';
import { baseAPI } from '../services/types';
import { useTranslation } from '../hooks/useTranslation';
import { useGetPaymentMethodsQuery } from '../redux/slices/paymentsApi';
import { createTransfer } from '../services/financialService';

type Tab = 'balance' | 'send';

interface WalletData {
  available_balance: string;
  pending_balance: string;
  currency: string;
}

type WalletTx = {
  id: number;
  amount: string;
  currency: string;
  description?: string;
  transaction_type?: string;
  created_at: string;
};

export default function WalletScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const token = useSelector((s: RootState) => s.auth.token);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [history, setHistory] = useState<WalletTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('100');
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>('balance');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [pin, setPin] = useState('');
  const { data: methods } = useGetPaymentMethodsQuery(undefined, { skip: !token });
  const availableMethods = (methods?.methods ?? []).filter((item) => item.available);
  const selectedMethod = method || methods?.default_method || availableMethods[0]?.code || 'card';
  const selected = availableMethods.find((item) => item.code === selectedMethod);

  const loadWallet = () => {
    if (!token) {
      setLoading(false);
      return;
    }
    Promise.all([
      axios.get(`${baseAPI}/api/wallet/me/`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${baseAPI}/api/wallet/history/`, { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(([me, hist]) => {
        setWallet(me.data);
        const rows = hist.data as WalletTx[] | { results?: WalletTx[] };
        setHistory(Array.isArray(rows) ? rows : rows.results ?? []);
      })
      .catch(() => setWallet(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadWallet();
  }, [token]);

  const handleTopUp = async () => {
    if (!token) return;
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setMessage(t('invalidAmount'));
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const { data } = await axios.post<{
        authorization_url?: string | null;
        customer_message?: string | null;
        detail?: string;
      }>(
        `${baseAPI}/api/wallet/top_up/`,
        {
          amount: parsed,
          currency: wallet?.currency || methods?.currency,
          method: selectedMethod,
          phone: phone || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const url = data.authorization_url;
      if (url) {
        await Linking.openURL(url);
        setMessage(t('completePayment'));
      } else {
        setMessage(data.customer_message || t('topUpStarted'));
      }
      loadWallet();
    } catch (err) {
      const detail =
        axios.isAxiosError(err) && err.response?.data && typeof err.response.data === 'object'
          ? String((err.response.data as { detail?: string }).detail || '')
          : '';
      setMessage(detail || t('topUpFailed'));
    } finally {
      setBusy(false);
    }
  };

  const handleSend = async () => {
    if (!token) return;
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setMessage(t('invalidAmount'));
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await createTransfer(
        {
          amount: parsed,
          currency: wallet?.currency || 'ZAR',
          recipient_phone: recipientPhone,
          pin: pin || undefined,
          idempotency_key: `mobile-transfer-${Date.now()}`,
        },
        token,
      );
      setMessage(t('transferSuccess'));
      loadWallet();
    } catch (err) {
      const detail =
        axios.isAxiosError(err) && err.response?.data && typeof err.response.data === 'object'
          ? String((err.response.data as { detail?: string }).detail || '')
          : '';
      setMessage(detail || t('failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={tw`flex-1 bg-slate-950`}>
      <LinearGradient colors={['#0F172A', '#1E293B', '#0F172A']} style={tw`absolute inset-0`} />
      <SafeAreaView style={tw`flex-1`}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-4 self-start`}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={tw`px-6 pt-2`}>
          <Text style={tw`text-blue-300 text-sm font-semibold uppercase tracking-wider`}>
            {t('walletTitle')}
          </Text>
          <Text style={tw`text-slate-400 mt-1`}>{t('walletSubtitle')}</Text>

          <View style={tw`mt-4 flex-row`}>
            <TouchableOpacity onPress={() => setTab('balance')} style={tw`mr-2 rounded-full px-4 py-2 ${tab === 'balance' ? 'bg-blue-600' : 'bg-white/10'}`}>
              <Text style={tw`text-white text-sm`}>{t('topUp')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTab('send')} style={tw`rounded-full px-4 py-2 ${tab === 'send' ? 'bg-blue-600' : 'bg-white/10'}`}>
              <Text style={tw`text-white text-sm`}>{t('sendMoney')}</Text>
            </TouchableOpacity>
          </View>

          <View style={tw`mt-8 rounded-3xl overflow-hidden`}>
            <LinearGradient colors={['#2563EB', '#1D4ED8']} style={tw`p-6`}>
              <View style={tw`flex-row items-center justify-between`}>
                <Feather name="credit-card" size={28} color="#BFDBFE" />
                <View style={tw`bg-white/20 rounded-full px-3 py-1`}>
                  <Text style={tw`text-white text-xs font-semibold`}>Kudya</Text>
                </View>
              </View>
              {loading ? (
                <ActivityIndicator color="#fff" style={tw`mt-8 mb-4`} />
              ) : !token ? (
                <Text style={tw`text-white/90 mt-8 text-base`}>{t('loginRequired')}</Text>
              ) : wallet ? (
                <>
                  <Text style={tw`text-blue-100 mt-6 text-sm`}>{t('availableBalance')}</Text>
                  <Text style={tw`text-4xl font-bold text-white mt-1`}>
                    {wallet.currency} {Number(wallet.available_balance).toFixed(2)}
                  </Text>
                  <Text style={tw`text-blue-200 mt-4 text-sm`}>
                    {t('pending')}: {wallet.currency}{' '}
                    {Number(wallet.pending_balance).toFixed(2)}
                  </Text>
                </>
              ) : (
                <Text style={tw`text-white/90 mt-8`}>{t('error')}</Text>
              )}
            </LinearGradient>
          </View>
          {token && tab === 'balance' ? (
            <View style={tw`mt-6`}>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="100"
                placeholderTextColor="#94A3B8"
                style={tw`rounded-xl bg-white/10 px-4 py-3 text-white`}
              />
              {availableMethods.length > 0 ? (
                <View style={tw`mt-3 flex-row flex-wrap`}>
                  {availableMethods.map((item) => (
                    <TouchableOpacity
                      key={item.code}
                      onPress={() => setMethod(item.code)}
                      style={tw`mr-2 mb-2 rounded-full px-3 py-2 ${selectedMethod === item.code ? 'bg-blue-600' : 'bg-white/10'}`}
                    >
                      <Text style={tw`text-white text-xs`}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
              {selected?.requires_phone ? (
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="2637…"
                  placeholderTextColor="#94A3B8"
                  style={tw`mt-2 rounded-xl bg-white/10 px-4 py-3 text-white`}
                />
              ) : null}
              <TouchableOpacity
                onPress={() => void handleTopUp()}
                disabled={busy}
                style={tw`mt-3 rounded-xl bg-blue-600 py-3 items-center`}
              >
                <Text style={tw`text-white font-semibold`}>
                  {busy ? t('loading', 'Loading...') : t('topUp')}
                </Text>
              </TouchableOpacity>
              {message ? <Text style={tw`text-blue-200 mt-2 text-sm`}>{message}</Text> : null}
            </View>
          ) : null}
          {token && tab === 'send' ? (
            <View style={tw`mt-6`}>
              <TextInput
                value={recipientPhone}
                onChangeText={setRecipientPhone}
                keyboardType="phone-pad"
                placeholder={t('recipientPhone')}
                placeholderTextColor="#94A3B8"
                style={tw`rounded-xl bg-white/10 px-4 py-3 text-white`}
              />
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="100"
                placeholderTextColor="#94A3B8"
                style={tw`mt-2 rounded-xl bg-white/10 px-4 py-3 text-white`}
              />
              <TextInput
                value={pin}
                onChangeText={setPin}
                secureTextEntry
                placeholder={t('walletPin')}
                placeholderTextColor="#94A3B8"
                style={tw`mt-2 rounded-xl bg-white/10 px-4 py-3 text-white`}
              />
              <TouchableOpacity
                onPress={() => void handleSend()}
                disabled={busy}
                style={tw`mt-3 rounded-xl bg-blue-600 py-3 items-center`}
              >
                <Text style={tw`text-white font-semibold`}>{t('sendMoney')}</Text>
              </TouchableOpacity>
              {message ? <Text style={tw`text-blue-200 mt-2 text-sm`}>{message}</Text> : null}
            </View>
          ) : null}
          {history.length > 0 ? (
            <View style={tw`px-6 mt-6`}>
              <Text style={tw`text-white font-semibold mb-3`}>{t('transactions')}</Text>
              {history.slice(0, 20).map((tx) => (
                <View key={tx.id} style={tw`mb-2 rounded-xl bg-white/10 px-4 py-3`}>
                  <Text style={tw`text-white`}>{tx.description || tx.transaction_type}</Text>
                  <Text style={tw`text-blue-200 text-xs`}>
                    {tx.amount} {tx.currency}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  );
}
