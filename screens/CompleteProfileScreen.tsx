import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import tw from 'twrnc';
import { useTranslation } from '../hooks/useTranslation';
import { selectAuth } from '../redux/slices/authSlice';
import { baseAPI } from '../services/types';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/navigation';

type Nav = StackNavigationProp<RootStackParamList, 'CompleteProfile'>;

export default function CompleteProfileScreen() {
  const { t, languageCode } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { token } = useSelector(selectAuth);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!firstName.trim() || !phone.trim()) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }
    if (!token) {
      navigation.replace('UserLogin');
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`${baseAPI}/api/auth/me/`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim(),
          preferred_language: languageCode,
        }),
      });
      if (!response.ok) {
        throw new Error('failed');
      }
      navigation.replace('MainTabs');
    } catch {
      Alert.alert(t('error'), t('loginFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={tw`flex-1 bg-white`}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={tw`flex-1 justify-center px-6`}>
        <Text style={tw`text-xl font-bold text-gray-800 mb-2`}>
          {t('completeProfileTitle')}
        </Text>
        <Text style={tw`text-sm text-gray-500 mb-6`}>{t('completeProfileHint')}</Text>
        <TextInput
          value={firstName}
          onChangeText={setFirstName}
          placeholder={t('firstName')}
          style={tw`border border-gray-200 rounded-lg p-3 mb-3`}
        />
        <TextInput
          value={lastName}
          onChangeText={setLastName}
          placeholder={t('lastName')}
          style={tw`border border-gray-200 rounded-lg p-3 mb-3`}
        />
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder={t('phone')}
          keyboardType="phone-pad"
          style={tw`border border-gray-200 rounded-lg p-3 mb-4`}
        />
        <TouchableOpacity
          onPress={() => void handleSubmit()}
          disabled={saving}
          style={tw`bg-blue-700 rounded-lg py-3 items-center`}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={tw`text-white font-semibold`}>{t('completeProfileContinue')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
