import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import tw from 'twrnc';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/navigation';
import { fetchDoctor, Doctor } from '../services/doctorsApi';
import { useTranslation } from '../hooks/useTranslation';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'DoctorDetail'>;

export default function DoctorDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { t } = useTranslation();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctor(route.params.doctorId)
      .then(setDoctor)
      .catch(() => setDoctor(null))
      .finally(() => setLoading(false));
  }, [route.params.doctorId]);

  if (loading) {
    return (
      <View style={tw`flex-1 items-center justify-center`}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={tw`flex-1 items-center justify-center p-6`}>
        <Text style={tw`text-slate-600`}>{t('error')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView contentContainerStyle={tw`pb-28`}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-4`}>
          <Feather name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>

        <View style={tw`items-center px-6`}>
          {doctor.profile_photo ? (
            <Image source={{ uri: doctor.profile_photo }} style={tw`w-28 h-28 rounded-full`} />
          ) : (
            <View style={tw`w-28 h-28 rounded-full bg-blue-100 items-center justify-center`}>
              <FontAwesome5 name="user-md" size={40} color="#2563EB" />
            </View>
          )}
          <Text style={tw`text-2xl font-bold text-slate-900 mt-4 text-center`}>{doctor.name}</Text>
          {doctor.professional_title ? (
            <Text style={tw`text-slate-500`}>{doctor.professional_title}</Text>
          ) : null}
          <Text style={tw`text-blue-600 font-semibold mt-1`}>{doctor.specialty_name}</Text>
          <View style={tw`flex-row items-center mt-2`}>
            <Feather name="star" size={16} color="#F59E0B" />
            <Text style={tw`ml-1 font-semibold`}>{doctor.rating.toFixed(1)}</Text>
            <Text style={tw`text-slate-400 ml-1`}>({doctor.review_count} reviews)</Text>
          </View>
        </View>

        <View style={tw`mx-6 mt-6 bg-slate-50 rounded-2xl p-4`}>
          <InfoRow icon="map-pin" label={t('location', 'Location')} value={`${doctor.city_name ?? ''} ${doctor.country_name}`.trim()} />
          <InfoRow icon="globe" label={t('languages', 'Languages')} value={doctor.languages} />
          <InfoRow icon="briefcase" label={t('experience', 'Experience')} value={`${doctor.years_experience} years`} />
          <InfoRow
            icon="video"
            label={t('consultation', 'Consultation')}
            value={[
              doctor.physical_consultation_enabled ? 'In person' : null,
              doctor.online_consultation_enabled ? 'Online' : null,
            ].filter(Boolean).join(' · ')}
          />
          <InfoRow
            icon="dollar-sign"
            label={t('fee', 'Consultation fee')}
            value={`${doctor.consultation_fee} ${doctor.currency}`}
          />
        </View>

        {doctor.biography ? (
          <View style={tw`mx-6 mt-4`}>
            <Text style={tw`font-bold text-slate-900 mb-2`}>{t('about', 'About')}</Text>
            <Text style={tw`text-slate-600 leading-6`}>{doctor.biography}</Text>
          </View>
        ) : null}

        {doctor.availability && doctor.availability.length > 0 ? (
          <View style={tw`mx-6 mt-4`}>
            <Text style={tw`font-bold text-slate-900 mb-2`}>{t('availability', 'Availability')}</Text>
            {doctor.availability.map((slot) => (
              <Text key={slot.id} style={tw`text-slate-600 text-sm mb-1`}>
                {slot.day_name}: {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
              </Text>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <View style={tw`absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100`}>
        <TouchableOpacity
          style={tw`bg-blue-600 rounded-2xl py-4 items-center`}
          onPress={() => navigation.navigate('BookAppointment', { doctorId: doctor.id })}
        >
          <Text style={tw`text-white font-bold text-lg`}>{t('bookAppointment', 'Book Appointment')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={tw`flex-row items-center mb-3`}>
      <Feather name={icon as 'map-pin'} size={18} color="#64748B" />
      <View style={tw`ml-3 flex-1`}>
        <Text style={tw`text-xs text-slate-400`}>{label}</Text>
        <Text style={tw`text-slate-800`}>{value}</Text>
      </View>
    </View>
  );
}
