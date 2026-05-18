import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { baseAPI } from '../services/types';
import { useTranslation } from '../hooks/useTranslation';

const CATEGORIES = ['payment', 'wrong_order', 'late_delivery', 'driver', 'refund', 'safety', 'other'] as const;

export default function SupportScreen() {
  const { t } = useTranslation();
  const token = useSelector((s: RootState) => s.auth.token);
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('other');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const onSubmit = async () => {
    if (!token) {
      Alert.alert(t('loginRequired'), t('login'));
      return;
    }
    try {
      await axios.post(
        `${baseAPI}/api/support/tickets/`,
        { category, subject, message },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      Alert.alert(t('success'), t('ticketSubmitted', 'Support ticket submitted'));
      setSubject('');
      setMessage('');
    } catch {
      Alert.alert(t('error'), t('ticketFailed', 'Could not submit ticket'));
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <Text style={tw`text-2xl font-bold px-4 pt-4`}>{t('support', 'Support')}</Text>
      <ScrollView style={tw`px-4 pt-4`}>
        <View style={tw`flex-row flex-wrap mb-4`}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity key={c} onPress={() => setCategory(c)} style={tw`mr-2 mb-2 px-3 py-1.5 rounded-lg ${category === c ? 'bg-blue-600' : 'bg-slate-100'}`}>
              <Text style={tw`${category === c ? 'text-white' : 'text-slate-600'} text-xs capitalize`}>{c.replace('_', ' ')}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput style={tw`border rounded-xl px-4 py-3 mb-3`} placeholder={t('subject', 'Subject')} value={subject} onChangeText={setSubject} />
        <TextInput style={tw`border rounded-xl px-4 py-3 mb-4 h-32`} placeholder={t('message', 'Message')} value={message} onChangeText={setMessage} multiline />
        <TouchableOpacity style={tw`bg-blue-600 rounded-2xl py-4 items-center mb-8`} onPress={onSubmit}>
          <Text style={tw`text-white font-bold`}>{t('submit', 'Submit')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
