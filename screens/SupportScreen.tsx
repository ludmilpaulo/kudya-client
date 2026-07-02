import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import tw from 'twrnc';
import axios from 'axios';
import { useSelector } from 'react-redux';

import { RootState } from '../redux/store';
import { baseAPI } from '../services/types';
import { useTranslation } from '../hooks/useTranslation';

const CATEGORIES = [
  'payment',
  'wrong_order',
  'late_delivery',
  'driver',
  'refund',
  'safety',
  'other',
] as const;

type Category = (typeof CATEGORIES)[number];

export default function SupportScreen() {
  const { t } = useTranslation();
  const token = useSelector((s: RootState) => s.auth.token);
  const [category, setCategory] = useState<Category>('other');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categoryLabel = (c: Category) =>
    t(`supportCategory_${c}` as 'supportCategory_payment', c.replace('_', ' '));

  const onSubmit = async () => {
    if (!token) {
      Alert.alert(t('loginRequired'), t('login'));
      return;
    }
    if (!subject.trim() || !message.trim()) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(
        `${baseAPI}/api/support/tickets/`,
        { category, subject: subject.trim(), message: message.trim() },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      Alert.alert(t('success'), t('ticketSubmitted', 'Support ticket submitted'));
      setSubject('');
      setMessage('');
    } catch {
      Alert.alert(t('error'), t('ticketFailed', 'Could not submit ticket'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      <View style={tw`px-4 pt-4 pb-2`}>
        <Text style={tw`text-2xl font-bold text-slate-900`}>{t('support', 'Support')}</Text>
        <Text style={tw`text-slate-500 mt-1`}>{t('supportSubtitle', "We're here to help")}</Text>
      </View>

      <ScrollView style={tw`px-4 pt-2`} keyboardShouldPersistTaps="handled">
        <View style={tw`flex-row flex-wrap mb-4`}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setCategory(c)}
              style={tw`mr-2 mb-2 px-3 py-2 rounded-xl ${
                category === c ? 'bg-blue-600' : 'bg-white border border-slate-200'
              }`}
            >
              <Text style={tw`${category === c ? 'text-white' : 'text-slate-600'} text-xs font-semibold`}>
                {categoryLabel(c)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={tw`bg-white rounded-2xl border border-slate-100 p-4 shadow-sm`}>
          <Text style={tw`text-xs font-semibold text-slate-500 mb-2 uppercase`}>{t('subject', 'Subject')}</Text>
          <TextInput
            style={tw`border border-slate-200 rounded-xl px-4 py-3 mb-4 text-slate-900`}
            placeholder={t('subject', 'Subject')}
            value={subject}
            onChangeText={setSubject}
          />
          <Text style={tw`text-xs font-semibold text-slate-500 mb-2 uppercase`}>{t('message', 'Message')}</Text>
          <TextInput
            style={tw`border border-slate-200 rounded-xl px-4 py-3 mb-4 h-32 text-slate-900`}
            placeholder={t('message', 'Message')}
            value={message}
            onChangeText={setMessage}
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={tw`bg-blue-600 rounded-2xl py-4 items-center flex-row justify-center ${submitting ? 'opacity-70' : ''}`}
            onPress={onSubmit}
            disabled={submitting}
          >
            <Feather name="send" size={18} color="#fff" style={tw`mr-2`} />
            <Text style={tw`text-white font-bold`}>{t('submit', 'Submit')}</Text>
          </TouchableOpacity>
        </View>
        <View style={tw`h-10`} />
      </ScrollView>
    </SafeAreaView>
  );
}
