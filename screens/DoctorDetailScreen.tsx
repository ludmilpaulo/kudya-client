import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/navigation';
import { useGetDoctorQuery } from '../redux/api/doctorsApi';
import { useTranslation } from '../hooks/useTranslation';
import { translateSpecialtyName } from '../utils/doctorSpecialtyI18n';
import { formatRating } from '../utils/formatNumber';
import { formatDoctorAddress, openDirections, openDoctorInMaps } from '../utils/doctorMaps';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'DoctorDetail'>;

export default function DoctorDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { t, languageCode } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);
  const [locationOffset, setLocationOffset] = useState(0);

  const { data: doctor, isLoading, isError } = useGetDoctorQuery({
    id: route.params.doctorId,
    lang: languageCode,
  });
  const specialtyLabel = doctor
    ? translateSpecialtyName(doctor.specialty_slug, doctor.specialty_name, languageCode)
    : '';

  useEffect(() => {
    if (doctor && route.params.openSection === 'location' && locationOffset > 0) {
      const timer = setTimeout(() => {
        scrollRef.current?.scrollTo({ y: locationOffset - 16, animated: true });
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [doctor, locationOffset, route.params.openSection]);

  if (isLoading) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-slate-50`}>
        <ActivityIndicator size="large" color="#0284C7" />
      </View>
    );
  }

  if (isError || !doctor) {
    return (
      <View style={tw`flex-1 items-center justify-center p-6 bg-slate-50`}>
        <Text style={tw`text-slate-600`}>{t('error')}</Text>
      </View>
    );
  }

  const address = formatDoctorAddress(doctor);
  const services = doctor.services_offered
    ? doctor.services_offered.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`} edges={['top', 'left', 'right']}>
      <ScrollView ref={scrollRef} contentContainerStyle={tw`pb-32`} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#0077CC', '#00AEEF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={tw`px-4 pt-2 pb-16 rounded-b-3xl`}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={tw`w-10 h-10 rounded-full bg-white/15 items-center justify-center mb-6`}
          >
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={tw`items-center`}>
            {doctor.profile_photo ? (
              <Image
                source={{ uri: doctor.profile_photo }}
                style={tw`w-28 h-28 rounded-3xl border-4 border-white/30`}
              />
            ) : (
              <View style={tw`w-28 h-28 rounded-3xl bg-white/20 items-center justify-center border-4 border-white/30`}>
                <FontAwesome5 name="user-md" size={40} color="#FFFFFF" />
              </View>
            )}
            <Text style={tw`text-2xl font-bold text-white mt-4 text-center`}>{doctor.name}</Text>
            {doctor.professional_title ? (
              <Text style={tw`text-sky-100 mt-1`}>{doctor.professional_title}</Text>
            ) : null}
            {doctor.clinic_name ? (
              <Text style={tw`text-white/90 mt-1 text-center`}>{doctor.clinic_name}</Text>
            ) : null}
            <View style={tw`mt-3 px-3 py-1 rounded-full bg-white/20`}>
              <Text style={tw`text-white font-semibold text-sm`}>{specialtyLabel}</Text>
            </View>
            {doctor.is_verified ? (
              <View style={tw`flex-row items-center mt-2`}>
                <Feather name="check-circle" size={14} color="#FFFFFF" />
                <Text style={tw`text-white text-sm font-semibold ml-1`}>
                  {t('verifiedDoctor', 'Verified')}
                </Text>
              </View>
            ) : null}
            <View style={tw`flex-row items-center mt-3 bg-white/15 px-3 py-1.5 rounded-full`}>
              <Feather name="star" size={14} color="#FCD34D" />
              <Text style={tw`ml-1.5 font-bold text-white`}>{formatRating(doctor.rating)}</Text>
              <Text style={tw`text-sky-100 ml-1.5 text-sm`}>
                ({doctor.review_count} {t('reviews', 'reviews')})
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={tw`-mt-8 mx-4`}>
          <View
            style={[
              tw`bg-white rounded-2xl p-5 border border-slate-100`,
              Platform.OS === 'web'
                ? ({ boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)' } as object)
                : tw`shadow-md`,
            ]}
          >
            <Text style={tw`text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3`}>
              {t('doctorDetails', 'Doctor details')}
            </Text>
            <InfoRow
              icon="briefcase"
              label={t('experience', 'Experience')}
              value={`${doctor.years_experience} ${t('years', 'years')}`}
            />
            <InfoRow icon="globe" label={t('languages', 'Languages')} value={doctor.languages} />
            <InfoRow
              icon="video"
              label={t('consultation', 'Consultation')}
              value={[
                doctor.physical_consultation_enabled ? t('physicalConsult', 'In person') : null,
                doctor.online_consultation_enabled ? t('onlineConsult', 'Online') : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            />
            <InfoRow
              icon="dollar-sign"
              label={t('fee', 'Consultation fee')}
              value={`${doctor.consultation_fee} ${doctor.currency}`}
            />
          </View>
        </View>

        {doctor.biography ? (
          <View style={tw`mx-4 mt-5 bg-white rounded-2xl p-5 border border-slate-100`}>
            <Text style={tw`text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2`}>
              {t('about', 'About')}
            </Text>
            <Text style={tw`text-slate-600 leading-6`}>{doctor.biography}</Text>
          </View>
        ) : null}

        {services.length > 0 ? (
          <View style={tw`mx-4 mt-5 bg-white rounded-2xl p-5 border border-slate-100`}>
            <Text style={tw`text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3`}>
              {t('servicesOffered', 'Services offered')}
            </Text>
            {services.map((service) => (
              <Text key={service} style={tw`text-slate-700 mb-1`}>
                • {service}
              </Text>
            ))}
          </View>
        ) : null}

        <View
          onLayout={(event) => {
            const { y } = (
              event as unknown as { nativeEvent: { layout: { y: number } } }
            ).nativeEvent.layout;
            setLocationOffset(y);
          }}
          style={tw`mx-4 mt-5 bg-white rounded-2xl p-5 border border-slate-100`}
        >
          <Text style={tw`text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3`}>
            {t('location', 'Location')}
          </Text>
          {doctor.clinic_name ? (
            <Text style={tw`text-base font-bold text-slate-900`}>{doctor.clinic_name}</Text>
          ) : null}
          <Text style={tw`text-slate-600 mt-1 leading-6`}>{address || '—'}</Text>

          <View style={tw`mt-4 h-36 rounded-2xl bg-sky-50 border border-sky-100 items-center justify-center`}>
            <Feather name="map" size={28} color="#0284C7" />
            <Text style={tw`text-xs text-slate-500 mt-2 px-4 text-center`}>{address}</Text>
          </View>

          <View style={tw`flex-row mt-4`}>
            <TouchableOpacity
              onPress={() => void openDoctorInMaps(doctor)}
              style={tw`flex-1 mr-2 py-3 rounded-xl bg-sky-600 items-center`}
            >
              <Text style={tw`text-white font-semibold text-sm`}>{t('openInMaps', 'Open in Maps')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => void openDirections(doctor)}
              style={tw`flex-1 py-3 rounded-xl border border-sky-200 items-center`}
            >
              <Text style={tw`text-sky-700 font-semibold text-sm`}>
                {t('getDirections', 'Get Directions')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {doctor.availability && doctor.availability.length > 0 ? (
          <View style={tw`mx-4 mt-5 bg-white rounded-2xl p-5 border border-slate-100`}>
            <Text style={tw`text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3`}>
              {t('availability', 'Availability')}
            </Text>
            {doctor.availability.map((slot) => (
              <View key={slot.id} style={tw`flex-row items-center justify-between py-2 border-b border-slate-50`}>
                <Text style={tw`text-slate-700 font-medium`}>{slot.day_name}</Text>
                <Text style={tw`text-slate-500 text-sm`}>
                  {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <View
        style={[
          tw`absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100`,
          Platform.OS === 'web'
            ? ({ boxShadow: '0 -4px 20px rgba(15, 23, 42, 0.06)' } as object)
            : null,
        ]}
      >
        <View style={tw`flex-row items-center justify-between mb-3 px-1`}>
          <Text style={tw`text-sm text-slate-500`}>{t('fee', 'Consultation fee')}</Text>
          <Text style={tw`text-lg font-bold text-slate-900`}>
            {doctor.consultation_fee} {doctor.currency}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('BookAppointment', { doctorId: doctor.id })}
        >
          <LinearGradient
            colors={['#0077CC', '#00AEEF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={tw`rounded-2xl py-4 items-center`}
          >
            <Text style={tw`text-white font-bold text-lg`}>{t('bookAppointment', 'Book Appointment')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={tw`flex-row items-start mb-4`}>
      <View style={tw`w-9 h-9 rounded-xl bg-sky-50 items-center justify-center`}>
        <Feather name={icon as 'map-pin'} size={16} color="#0284C7" />
      </View>
      <View style={tw`ml-3 flex-1`}>
        <Text style={tw`text-xs text-slate-400 font-medium`}>{label}</Text>
        <Text style={tw`text-slate-800 font-medium mt-0.5`}>{value}</Text>
      </View>
    </View>
  );
}
