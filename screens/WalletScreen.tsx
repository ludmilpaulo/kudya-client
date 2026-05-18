import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

export default function WalletScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const token = useSelector((s: RootState) => s.auth.token);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    axios
      .get(`${baseAPI}/api/wallet/me/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setWallet(res.data))
      .catch(() => setWallet(null))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-900`}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-4`}>
        <Feather name="arrow-left" size={22} color="#fff" />
      </TouchableOpacity>
      <View style={tw`px-6 pt-4`}>
        <Text style={tw`text-blue-200 text-sm`}>Kudya Wallet</Text>
        {loading ? (
          <ActivityIndicator color="#fff" style={tw`mt-10`} />
        ) : wallet ? (
          <>
            <Text style={tw`text-4xl font-bold text-white mt-2`}>
              {wallet.currency} {Number(wallet.available_balance).toFixed(2)}
            </Text>
            <Text style={tw`text-slate-400 mt-1`}>
              {t('pending', 'Pending')}: {wallet.currency} {Number(wallet.pending_balance).toFixed(2)}
            </Text>
          </>
        ) : (
          <Text style={tw`text-white mt-4`}>{t('loginRequired')}</Text>
        )}
      </View>
    </SafeAreaView>
  );
}
