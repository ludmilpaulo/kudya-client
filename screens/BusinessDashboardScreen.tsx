import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '../hooks/useTranslation';

export default function BusinessDashboardScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();

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
            {t('businessDashboardTitle', 'Manage company orders and billing')}
          </Text>
          <Text style={tw`text-slate-300 mt-3`}>
            {t(
              'businessDashboardSubtitle',
              'Invite employees, set spending limits, and pay with a corporate wallet.',
            )}
          </Text>
        </View>

        <View style={tw`mt-6 rounded-2xl bg-white border border-slate-200 p-5`}>
          <Text style={tw`font-semibold text-slate-900`}>{t('comingSoon', 'Coming soon')}</Text>
          <Text style={tw`text-slate-600 mt-2`}>
            {t('businessMobileComingSoon', 'Corporate wallet, invoices, and employee management will appear here.')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
