import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/navigation';
import { fetchDoctors, fetchSpecialties, Doctor, MedicalSpecialty } from '../services/doctorsApi';
import { useTranslation } from '../hooks/useTranslation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function DoctorsScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<MedicalSpecialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialtySlug, setSpecialtySlug] = useState<string | null>(null);
  const [consultationType, setConsultationType] = useState<string | null>(null);

  useEffect(() => {
    fetchSpecialties().then(setSpecialties).catch(() => setSpecialties([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (specialtySlug) params.specialty_slug = specialtySlug;
    if (consultationType) params.consultation_type = consultationType;
    if (search.trim()) params.search = search.trim();
    fetchDoctors(params)
      .then(setDoctors)
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, [specialtySlug, consultationType, search]);

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      <View style={tw`px-4 pt-2 pb-3 flex-row items-center`}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={tw`mr-3 p-2`}>
          <Feather name="arrow-left" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={tw`text-xl font-bold text-slate-900 flex-1`}>
          {t('doctorsTitle', 'Find a Doctor')}
        </Text>
      </View>

      <View style={tw`px-4 mb-3`}>
        <View style={tw`flex-row items-center bg-white rounded-xl px-3 py-2 border border-slate-200`}>
          <Feather name="search" size={18} color="#94A3B8" />
          <TextInput
            placeholder={t('searchDoctor', 'Search by name or clinic...')}
            value={search}
            onChangeText={setSearch}
            style={tw`ml-2 flex-1 text-slate-800`}
          />
        </View>
      </View>

      <FlatList
        horizontal
        data={specialties}
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tw`px-4 pb-3`}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSpecialtySlug(specialtySlug === item.slug ? null : item.slug)}
            style={tw`mr-2 px-4 py-2 rounded-full ${
              specialtySlug === item.slug ? 'bg-blue-600' : 'bg-white border border-slate-200'
            }`}
          >
            <Text style={tw`${specialtySlug === item.slug ? 'text-white' : 'text-slate-700'} text-sm font-medium`}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      <View style={tw`flex-row px-4 mb-3`}>
        {(['online', 'physical'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setConsultationType(consultationType === type ? null : type)}
            style={tw`mr-2 px-3 py-1.5 rounded-lg ${
              consultationType === type ? 'bg-emerald-600' : 'bg-white border border-slate-200'
            }`}
          >
            <Text style={tw`text-sm ${consultationType === type ? 'text-white' : 'text-slate-600'}`}>
              {type === 'online' ? t('onlineConsult', 'Online') : t('physicalConsult', 'In person')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={tw`mt-16`} />
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={tw`px-4 pb-8`}
          ListEmptyComponent={
            <Text style={tw`text-center text-slate-500 mt-16`}>{t('noDoctors', 'No doctors found')}</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={tw`bg-white rounded-2xl p-4 mb-3 flex-row shadow-sm border border-slate-100`}
              onPress={() => navigation.navigate('DoctorDetail', { doctorId: item.id })}
            >
              {item.profile_photo ? (
                <Image source={{ uri: item.profile_photo }} style={tw`w-16 h-16 rounded-full`} />
              ) : (
                <View style={tw`w-16 h-16 rounded-full bg-blue-100 items-center justify-center`}>
                  <FontAwesome5 name="user-md" size={24} color="#2563EB" />
                </View>
              )}
              <View style={tw`flex-1 ml-3`}>
                <Text style={tw`font-bold text-slate-900`}>{item.name}</Text>
                <Text style={tw`text-sm text-blue-600`}>{item.specialty_name}</Text>
                <Text style={tw`text-xs text-slate-500 mt-0.5`}>
                  {item.city_name ?? item.country_name} · {item.years_experience}y exp
                </Text>
                <View style={tw`flex-row justify-between items-center mt-2`}>
                  <Text style={tw`font-bold text-slate-800`}>
                    {item.consultation_fee} {item.currency}
                  </Text>
                  <View style={tw`flex-row items-center`}>
                    <Feather name="star" size={14} color="#F59E0B" />
                    <Text style={tw`ml-1 text-sm text-slate-700`}>{item.rating.toFixed(1)}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
