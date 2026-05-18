import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useTranslation } from '../hooks/useTranslation';
import { estimatePackage, requestPackage } from '../services/deliveriesApi';

const PACKAGE_TYPES = ['envelope', 'small', 'medium', 'large', 'fragile', 'document'] as const;

export default function SendPackageScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const token = useSelector((s: RootState) => s.auth.token);
  const [packageType, setPackageType] = useState<typeof PACKAGE_TYPES[number]>('small');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [price, setPrice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const coords = {
    pickup_lat: -26.2041, pickup_lng: 28.0473,
    dropoff_lat: -26.15, dropoff_lng: 28.05,
  };

  const onEstimate = async () => {
    setLoading(true);
    try {
      const r = await estimatePackage({ ...coords, package_type: packageType, urgency: 'standard' });
      setPrice(r.estimated_price);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async () => {
    if (!token) {
      Alert.alert(t('loginRequired'), t('login'));
      return;
    }
    setLoading(true);
    try {
      await requestPackage(token, {
        package_type: packageType,
        urgency: 'standard',
        pickup_address: 'Pickup location',
        dropoff_address: 'Drop-off location',
        ...coords,
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
      });
      Alert.alert(t('success'), t('packageRequested', 'Courier request sent'));
      navigation.goBack();
    } catch {
      Alert.alert(t('error'), t('bookingFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <View style={tw`flex-row items-center p-4 border-b border-slate-100`}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Feather name="arrow-left" size={22} /></TouchableOpacity>
        <Text style={tw`text-xl font-bold ml-3`}>{t('sendPackage', 'Send Package')}</Text>
      </View>
      <ScrollView style={tw`p-4`}>
        <Text style={tw`font-semibold mb-2`}>{t('packageSize', 'Package size')}</Text>
        <View style={tw`flex-row flex-wrap mb-4`}>
          {PACKAGE_TYPES.map((p) => (
            <TouchableOpacity key={p} onPress={() => setPackageType(p)} style={tw`mr-2 mb-2 px-3 py-2 rounded-lg ${packageType === p ? 'bg-violet-600' : 'bg-slate-100'}`}>
              <Text style={tw`${packageType === p ? 'text-white' : 'text-slate-700'} capitalize text-sm`}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput style={tw`border rounded-xl px-4 py-3 mb-3`} placeholder={t('recipientName', 'Recipient name')} value={recipientName} onChangeText={setRecipientName} />
        <TextInput style={tw`border rounded-xl px-4 py-3 mb-4`} placeholder={t('recipientPhone', 'Recipient phone')} value={recipientPhone} onChangeText={setRecipientPhone} keyboardType="phone-pad" />
        {price && <Text style={tw`text-lg font-bold text-violet-700 mb-4`}>ZAR {price}</Text>}
        <TouchableOpacity style={tw`bg-slate-200 rounded-xl py-3 items-center mb-2`} onPress={onEstimate} disabled={loading}>
          <Text>{t('seePrice', 'See price')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={tw`bg-violet-600 rounded-xl py-4 items-center`} onPress={onSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={tw`text-white font-bold`}>{t('requestCourier', 'Request Courier')}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
