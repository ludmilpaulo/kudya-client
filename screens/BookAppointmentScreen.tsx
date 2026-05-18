import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import tw from 'twrnc';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { RootStackParamList } from '../navigation/navigation';
import { bookAppointment } from '../services/doctorsApi';
import { useTranslation } from '../hooks/useTranslation';

type Route = RouteProp<RootStackParamList, 'BookAppointment'>;

export default function BookAppointmentScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { t } = useTranslation();
  const token = useSelector((s: RootState) => s.auth.token);
  const [appointmentType, setAppointmentType] = useState<'physical' | 'online'>('physical');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('09:30');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!token) {
      Alert.alert(t('loginRequired'), t('loginToAccessCart'));
      return;
    }
    if (!date) {
      Alert.alert(t('error'), t('selectDate', 'Please select a date'));
      return;
    }
    setSubmitting(true);
    try {
      await bookAppointment(token, {
        doctor: route.params.doctorId,
        appointment_type: appointmentType,
        date,
        start_time: startTime,
        end_time: endTime,
        notes,
      });
      Alert.alert(t('success'), t('appointmentBooked', 'Appointment requested successfully'));
      navigation.goBack();
    } catch {
      Alert.alert(t('error'), t('bookingFailed', 'Could not book appointment'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <View style={tw`flex-row items-center p-4 border-b border-slate-100`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} />
        </TouchableOpacity>
        <Text style={tw`text-lg font-bold ml-3`}>{t('bookAppointment', 'Book Appointment')}</Text>
      </View>

      <View style={tw`p-4`}>
        <Text style={tw`text-sm font-semibold text-slate-600 mb-2`}>{t('consultation', 'Consultation type')}</Text>
        <View style={tw`flex-row mb-4`}>
          {(['physical', 'online'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setAppointmentType(type)}
              style={tw`flex-1 mr-2 py-3 rounded-xl items-center ${
                appointmentType === type ? 'bg-blue-600' : 'bg-slate-100'
              }`}
            >
              <Text style={tw`${appointmentType === type ? 'text-white' : 'text-slate-700'} font-medium`}>
                {type === 'online' ? t('onlineConsult', 'Online') : t('physicalConsult', 'In person')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Field label={t('date', 'Date (YYYY-MM-DD)')} value={date} onChangeText={setDate} placeholder="2026-05-20" />
        <Field label={t('startTime', 'Start time')} value={startTime} onChangeText={setStartTime} placeholder="09:00" />
        <Field label={t('endTime', 'End time')} value={endTime} onChangeText={setEndTime} placeholder="09:30" />
        <Field label={t('notes', 'Notes')} value={notes} onChangeText={setNotes} placeholder="" multiline />

        <TouchableOpacity
          style={tw`bg-blue-600 rounded-2xl py-4 items-center mt-6`}
          onPress={onSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={tw`text-white font-bold text-lg`}>{t('confirmBooking', 'Confirm Booking')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <View style={tw`mb-4`}>
      <Text style={tw`text-sm font-semibold text-slate-600 mb-1`}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        style={tw`border border-slate-200 rounded-xl px-4 py-3 text-slate-800`}
      />
    </View>
  );
}
