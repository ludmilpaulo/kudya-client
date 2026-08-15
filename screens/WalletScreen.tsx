import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
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

  useEffect(() => {
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
  }, [token]);

  return (
    <View style={tw`flex-1 bg-slate-950`}>
      <LinearGradient colors={['#0F172A', '#1E293B', '#0F172A']} style={tw`absolute inset-0`} />
      <SafeAreaView style={tw`flex-1`}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-4 self-start`}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={tw`px-6 pt-2`}>
          <Text style={tw`text-blue-300 text-sm font-semibold uppercase tracking-wider`}>
            {t('walletTitle', 'Kudya Wallet')}
          </Text>
          <Text style={tw`text-slate-400 mt-1`}>{t('walletSubtitle', 'Your balance & payouts')}</Text>

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
                  <Text style={tw`text-blue-100 mt-6 text-sm`}>{t('availableBalance', 'Available balance')}</Text>
                  <Text style={tw`text-4xl font-bold text-white mt-1`}>
                    {wallet.currency} {Number(wallet.available_balance).toFixed(2)}
                  </Text>
                  <Text style={tw`text-blue-200 mt-4 text-sm`}>
                    {t('pending', 'Pending')}: {wallet.currency}{' '}
                    {Number(wallet.pending_balance).toFixed(2)}
                  </Text>
                  <Text style={tw`text-blue-100 mt-4 text-xs`}>
                    {t(
                      'walletTopUpUnavailable',
                      'Top-up is temporarily unavailable. Balance is view-only.',
                    )}
                  </Text>
                </>
              ) : (
                <Text style={tw`text-white/90 mt-8`}>{t('error')}</Text>
              )}
            </LinearGradient>
          </View>
          {history.length > 0 ? (
            <View style={tw`px-6 mt-6`}>
              <Text style={tw`text-white font-semibold mb-3`}>{t('transactions', 'Transactions')}</Text>
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
