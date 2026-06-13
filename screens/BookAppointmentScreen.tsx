import React, { useEffect, useMemo, useState } from 'react';

import {

  View,

  Text,

  TouchableOpacity,

  TextInput,

  Alert,

  ActivityIndicator,

  ScrollView,

} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Feather } from '@expo/vector-icons';

import { LinearGradient } from 'expo-linear-gradient';

import tw from 'twrnc';

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { useSelector, useDispatch } from 'react-redux';

import { RootState } from '../redux/store';
import { persistBookingSession } from '../redux/slices/authSlice';

import { RootStackParamList } from '../navigation/navigation';

import { bookAppointment } from '../services/doctorsApi';

import { useGetAvailableSlotsQuery, useGetDoctorQuery } from '../redux/api/doctorsApi';

import type { AppointmentSlot, DoctorConsultationType, PatientGender } from '../services/doctors/types';

import { useTranslation } from '../hooks/useTranslation';

import { translateSpecialtyName } from '../utils/doctorSpecialtyI18n';

import { calculateAge, isValidDateOfBirth } from '../utils/bookingUtils';



type Route = RouteProp<RootStackParamList, 'BookAppointment'>;



const GENDER_OPTIONS: PatientGender[] = ['male', 'female', 'other', 'prefer_not_to_say'];



export default function BookAppointmentScreen() {

  const navigation = useNavigation();

  const route = useRoute<Route>();

  const { t, languageCode } = useTranslation();

  const dispatch = useDispatch();
  const token = useSelector((s: RootState) => s.auth.token);

  const username = useSelector((s: RootState) => s.auth.user?.username ?? '');



  const { data: doctor, isLoading: doctorLoading } = useGetDoctorQuery({

    id: route.params.doctorId,

    lang: languageCode,

  });



  const [appointmentType, setAppointmentType] = useState<DoctorConsultationType>('physical');

  const [date, setDate] = useState('');

  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null);

  const [reason, setReason] = useState('');

  const [fullName, setFullName] = useState('');

  const [dateOfBirth, setDateOfBirth] = useState('');

  const [phoneNumber, setPhoneNumber] = useState('');

  const [email, setEmail] = useState('');

  const [gender, setGender] = useState<PatientGender | ''>('');

  const [submitting, setSubmitting] = useState(false);



  const calculatedAge = useMemo(() => {

    if (!dateOfBirth || !isValidDateOfBirth(dateOfBirth)) return null;

    return calculateAge(dateOfBirth);

  }, [dateOfBirth]);



  const { data: slots = [], isFetching: slotsLoading } = useGetAvailableSlotsQuery(

    { doctorId: route.params.doctorId, date, lang: languageCode },

    { skip: !date || date.length < 10 },

  );



  const availableTypes = useMemo(() => {

    const types: DoctorConsultationType[] = [];

    if (doctor?.physical_consultation_enabled) types.push('physical');

    if (doctor?.online_consultation_enabled) types.push('online');

    return types;

  }, [doctor]);



  useEffect(() => {

    if (availableTypes.length && !availableTypes.includes(appointmentType)) {

      setAppointmentType(availableTypes[0]);

    }

  }, [appointmentType, availableTypes]);



  useEffect(() => {

    setSelectedSlot(null);

  }, [date, appointmentType]);



  useEffect(() => {

    if (username && !fullName) {

      setFullName(username);

    }

  }, [fullName, username]);



  const extractErrorMessage = (error: unknown): string => {

    if (typeof error === 'object' && error !== null && 'response' in error) {

      const response = (error as { response?: { status?: number; data?: Record<string, unknown> } }).response;

      const status = response?.status;

      if (status === 401) {

        return t('loginRequired', 'Please sign in to book an appointment.');

      }

      if (typeof status === 'number' && status >= 500) {

        return t('bookingServiceUnavailable', 'The booking service is temporarily unavailable. Please try again.');

      }

      const data = response?.data;

      if (!data) return t('bookingFailed', 'Could not book appointment');

      if (typeof data.detail === 'string') return data.detail;

      const parts: string[] = [];

      for (const value of Object.values(data)) {

        if (Array.isArray(value) && typeof value[0] === 'string') {

          parts.push(value[0]);

        } else if (value && typeof value === 'object') {

          for (const nested of Object.values(value as Record<string, unknown>)) {

            if (Array.isArray(nested) && typeof nested[0] === 'string') {

              parts.push(nested[0]);

            }

          }

        }

      }

      if (parts.length) return parts.join('\n');

    }

    return t('bookingFailed', 'Could not book appointment');

  };



  const onSubmit = async () => {
    if (!date) {

      Alert.alert(t('error'), t('selectDate', 'Please select a date'));

      return;

    }

    if (!selectedSlot) {

      Alert.alert(t('error'), t('selectTimeSlot', 'Please select an available time slot'));

      return;

    }

    if (!fullName.trim() || !dateOfBirth || !phoneNumber.trim() || !email.trim() || !gender) {

      Alert.alert(t('error'), t('completePatientDetails', 'Please complete all patient details'));

      return;

    }

    if (!isValidDateOfBirth(dateOfBirth) || calculatedAge === null) {

      Alert.alert(t('error'), t('invalidDateOfBirth', 'Please enter a valid date of birth'));

      return;

    }

    if (reason.trim().length < 10) {

      Alert.alert(t('error'), t('reasonMinLength', 'Reason must be at least 10 characters'));

      return;

    }



    setSubmitting(true);

    try {

      const result = await bookAppointment(
        {
          slot_id: selectedSlot.id,
          appointment_type: appointmentType,
          reason: reason.trim(),
          patient: {
            full_name: fullName.trim(),
            date_of_birth: dateOfBirth,
            age: calculatedAge,
            phone_number: phoneNumber.trim(),
            email: email.trim(),
            gender: gender as PatientGender,
            preferred_language: languageCode,
          },
          payment_method: 'pay_at_clinic',
        },
        token,
      );
      if (result?.access_token) {
        dispatch(
          persistBookingSession({
            accessToken: String(result.access_token),
            refreshToken: result.refresh_token ? String(result.refresh_token) : undefined,
            username: email.trim(),
          }),
        );
      }

      Alert.alert(t('success'), t('appointmentBooked', 'Appointment requested successfully'));

      navigation.goBack();

    } catch (error) {

      Alert.alert(t('error'), extractErrorMessage(error));

    } finally {

      setSubmitting(false);

    }

  };



  if (doctorLoading || !doctor) {

    return (

      <View style={tw`flex-1 items-center justify-center`}>

        <ActivityIndicator size="large" color="#0284C7" />

      </View>

    );

  }



  return (

    <SafeAreaView style={tw`flex-1 bg-slate-50`}>

      <View style={tw`flex-row items-center p-4 border-b border-slate-100 bg-white`}>

        <TouchableOpacity onPress={() => navigation.goBack()}>

          <Feather name="arrow-left" size={22} />

        </TouchableOpacity>

        <Text style={tw`text-lg font-bold ml-3`}>{t('bookAppointment', 'Book Appointment')}</Text>

      </View>



      <ScrollView contentContainerStyle={tw`p-4 pb-10`} keyboardShouldPersistTaps="handled">

        <View style={tw`bg-white rounded-2xl p-4 mb-4 border border-slate-100`}>

          <Text style={tw`font-bold text-slate-900 text-lg`}>{doctor.name}</Text>

          <Text style={tw`text-sky-700 font-medium mt-1`}>

            {translateSpecialtyName(doctor.specialty_slug, doctor.specialty_name, languageCode)}

          </Text>

          {doctor.clinic_name ? (

            <Text style={tw`text-slate-500 text-sm mt-1`}>{doctor.clinic_name}</Text>

          ) : null}

          <Text style={tw`text-slate-800 font-bold mt-3`}>

            {doctor.consultation_fee} {doctor.currency}

          </Text>

        </View>



        <Text style={tw`text-sm font-semibold text-slate-600 mb-2`}>

          {t('consultation', 'Consultation type')}

        </Text>

        <View style={tw`flex-row mb-4`}>

          {availableTypes.map((type) => (

            <TouchableOpacity

              key={type}

              onPress={() => setAppointmentType(type)}

              style={tw`flex-1 mr-2 py-3 rounded-xl items-center ${

                appointmentType === type ? 'bg-sky-600' : 'bg-white border border-slate-200'

              }`}

            >

              <Text

                style={tw`${

                  appointmentType === type ? 'text-white' : 'text-slate-700'

                } font-medium`}

              >

                {type === 'online' ? t('onlineConsult', 'Online') : t('physicalConsult', 'In person')}

              </Text>

            </TouchableOpacity>

          ))}

        </View>



        <Field

          label={t('date', 'Date (YYYY-MM-DD)')}

          value={date}

          onChangeText={setDate}

          placeholder="2026-06-08"

        />



        <Text style={tw`text-sm font-semibold text-slate-600 mb-2`}>

          {t('availableSlots', 'Available time slots')}

        </Text>

        {slotsLoading ? (

          <ActivityIndicator color="#0284C7" style={tw`my-4`} />

        ) : slots.length === 0 ? (

          <Text style={tw`text-slate-500 text-sm mb-4`}>

            {date ? t('noSlotsForDate', 'No slots available for this date.') : t('selectDate', 'Please select a date')}

          </Text>

        ) : (

          <View style={tw`flex-row flex-wrap mb-4`}>

            {slots.map((slot) => {

              const active = selectedSlot?.id === slot.id;

              return (

                <TouchableOpacity

                  key={slot.id}

                  onPress={() => setSelectedSlot(slot)}

                  style={tw`px-3 py-2 rounded-xl mr-2 mb-2 border ${

                    active ? 'bg-sky-600 border-sky-600' : 'bg-white border-slate-200'

                  }`}

                >

                  <Text style={tw`${active ? 'text-white' : 'text-slate-700'} font-medium text-sm`}>

                    {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}

                  </Text>

                </TouchableOpacity>

              );

            })}

          </View>

        )}



        <Text style={tw`text-base font-bold text-slate-900 mb-3`}>

          {t('patientDetails', 'Patient details')}

        </Text>

        <Field

          label={t('patientFullName', 'Patient full name')}

          value={fullName}

          onChangeText={setFullName}

          placeholder={t('patientFullName', 'Patient full name')}

        />

        <Field

          label={t('dateOfBirth', 'Date of birth')}

          value={dateOfBirth}

          onChangeText={setDateOfBirth}

          placeholder="1990-05-20"

        />

        <View style={tw`mb-4`}>

          <Text style={tw`text-sm font-semibold text-slate-600 mb-1`}>{t('age', 'Age')}</Text>

          <View style={tw`border border-slate-100 rounded-xl px-4 py-3 bg-slate-50`}>

            <Text style={tw`text-slate-700`}>

              {calculatedAge !== null

                ? `${calculatedAge} ${t('yearsOld', 'years old')}`

                : t('ageAutoCalculated', 'Age will be calculated automatically')}

            </Text>

          </View>

        </View>

        <View style={tw`mb-4`}>

          <Text style={tw`text-sm font-semibold text-slate-600 mb-2`}>{t('gender', 'Gender')}</Text>

          <View style={tw`flex-row flex-wrap`}>

            {GENDER_OPTIONS.map((option) => (

              <TouchableOpacity

                key={option}

                onPress={() => setGender(option)}

                style={tw`px-3 py-2 rounded-xl mr-2 mb-2 border ${

                  gender === option ? 'bg-sky-600 border-sky-600' : 'bg-white border-slate-200'

                }`}

              >

                <Text style={tw`${gender === option ? 'text-white' : 'text-slate-700'} text-sm`}>

                  {t(option, option)}

                </Text>

              </TouchableOpacity>

            ))}

          </View>

        </View>

        <Field

          label={t('phoneNumber', 'Phone number')}

          value={phoneNumber}

          onChangeText={setPhoneNumber}

          placeholder="+244900000000"

        />

        <Field

          label={t('emailAddress', 'Email address')}

          value={email}

          onChangeText={setEmail}

          placeholder="patient@example.com"

        />



        <Field

          label={t('reasonForVisit', 'Reason for visit')}

          value={reason}

          onChangeText={setReason}

          placeholder={t('reasonPlaceholder', 'Briefly describe your symptoms or reason for this visit...')}

          multiline

        />

        {reason.length > 0 && reason.trim().length < 10 ? (

          <Text style={tw`text-amber-600 text-xs mb-4`}>

            {t('reasonMinLength', 'Reason must be at least 10 characters')}

          </Text>

        ) : null}



        <TouchableOpacity activeOpacity={0.9} onPress={onSubmit} disabled={submitting}>

          <LinearGradient

            colors={['#0077CC', '#00AEEF']}

            start={{ x: 0, y: 0 }}

            end={{ x: 1, y: 0 }}

            style={tw`rounded-2xl py-4 items-center mt-2`}

          >

            {submitting ? (

              <ActivityIndicator color="#fff" />

            ) : (

              <Text style={tw`text-white font-bold text-lg`}>{t('confirmBooking', 'Confirm Booking')}</Text>

            )}

          </LinearGradient>

        </TouchableOpacity>

      </ScrollView>

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

        style={tw`border border-slate-200 rounded-xl px-4 py-3 text-slate-800 bg-white`}

      />

    </View>

  );

}


