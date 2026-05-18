import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '../hooks/useTranslation';

export default function ComingSoonScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50 items-center justify-center px-8`}>
      <View style={tw`w-20 h-20 rounded-full bg-blue-100 items-center justify-center mb-6`}>
        <Feather name="clock" size={36} color="#2563EB" />
      </View>
      <Text style={tw`text-2xl font-bold text-slate-900 text-center`}>
        {t('comingSoon', 'Coming Soon')}
      </Text>
      <Text style={tw`text-slate-500 text-center mt-2`}>
        {t('comingSoonDesc', 'This Kudya service is launching soon in your region.')}
      </Text>
      <TouchableOpacity onPress={() => navigation.goBack()} style={tw`mt-8 bg-blue-600 px-8 py-3 rounded-xl`}>
        <Text style={tw`text-white font-semibold`}>{t('back')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
