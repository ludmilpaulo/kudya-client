import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import tw from 'twrnc';
import { useAppNavigation } from '../navigation/hooks';
import { useTranslation } from '../hooks/useTranslation';
import { fetchMyBusinesses, type Business } from '../features/business/api';

export default function BusinessDashboardScreen() {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyBusinesses()
      .then(setAccounts)
      .catch(() => setError(t('unableToLoadData', 'Unable to load data')))
      .finally(() => setLoading(false));
  }, [t]);

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      <View style={tw`px-4 py-3 flex-row items-center`}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={tw`mr-3`}>
          <Feather name="arrow-left" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={tw`text-xl font-bold text-slate-900`}>{t('business', 'Business')}</Text>
      </View>

      <ScrollView contentContainerStyle={tw`px-4 pb-8`}>
        <View style={tw`rounded-3xl bg-slate-900 p-6`}>
          <Text style={tw`text-blue-200 text-sm`}>{t('corporateAccounts', 'Corporate accounts')}</Text>
          <Text style={tw`text-white text-2xl font-bold mt-2`}>
            {t('businessDashboardTitle', 'Businesses linked to your account')}
          </Text>
        </View>

        {loading ? <ActivityIndicator style={tw`mt-8`} /> : null}
        {error ? <Text style={tw`text-red-600 mt-6`}>{error}</Text> : null}
        {!loading && accounts.length === 0 ? (
          <Text style={tw`text-slate-600 mt-6`}>
            {t('noBusinessAccounts', 'No business accounts are linked to this user yet.')}
          </Text>
        ) : null}
        {accounts.map((account) => (
          <View key={account.id} style={tw`mt-4 rounded-2xl bg-white border border-slate-200 p-5`}>
            <Text style={tw`font-semibold text-slate-900`}>{account.name}</Text>
            <Text style={tw`text-slate-500 mt-1`}>
              {account.category_slug} · {account.status}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
