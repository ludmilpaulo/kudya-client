import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/navigation';
import {
  useGetCountriesQuery,
  useGetDoctorsQuery,
  useGetSpecialtiesQuery,
} from '../redux/api/doctorsApi';
import type { Country, DoctorConsultationType } from '../services/doctors/types';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useTranslation } from '../hooks/useTranslation';
import { translateSpecialtyName } from '../utils/doctorSpecialtyI18n';
import type { SupportedLocale } from '../configs/translations';
import CountryPickerModal from '../components/doctors/CountryPickerModal';
import SpecialtyPickerModal from '../components/doctors/SpecialtyPickerModal';
import DoctorCard from '../components/doctors/DoctorCard';
import DoctorSkeletonList from '../components/doctors/DoctorSkeletonList';
import { getFavoriteDoctorIds, toggleDoctorFavorite } from '../utils/doctorFavorites';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SPECIALTY_ICONS: Record<string, keyof typeof FontAwesome5.glyphMap> = {
  general: 'user-md',
  dentist: 'tooth',
  dermatologist: 'spa',
  gynecologist: 'female',
  pediatrician: 'baby',
  psychologist: 'comment-medical',
  physiotherapist: 'walking',
  cardiologist: 'heartbeat',
  orthopedic: 'crutch',
  optometrist: 'eye',
  ent: 'deaf',
  nutritionist: 'apple-alt',
  mental_health: 'smile',
  other: 'stethoscope',
};

export default function DoctorsScreen() {
  const navigation = useNavigation<Nav>();
  const { t, languageCode } = useTranslation();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countryManual, setCountryManual] = useState(false);
  const [specialtySlug, setSpecialtySlug] = useState<string | undefined>();
  const [consultationType, setConsultationType] = useState<DoctorConsultationType | undefined>();
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [specialtyModalOpen, setSpecialtyModalOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  const { data: countries = [], isLoading: countriesLoading } = useGetCountriesQuery(languageCode);
  const { data: specialties = [] } = useGetSpecialtiesQuery(languageCode);

  useEffect(() => {
    if (countryManual || !countries.length || selectedCountry) return;
    const preferred =
      countries.find((item) => item.code === 'AO') ?? countries[0];
    setSelectedCountry(preferred);
  }, [countries, countryManual, selectedCountry]);

  useEffect(() => {
    void getFavoriteDoctorIds().then(setFavoriteIds);
  }, []);

  const doctorFilters = useMemo(
    () => ({
      search: debouncedSearch,
      countryCode: selectedCountry?.code,
      specialtySlug,
      consultationType,
      lang: languageCode as SupportedLocale,
    }),
    [consultationType, debouncedSearch, languageCode, selectedCountry?.code, specialtySlug],
  );

  const {
    data: doctors = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetDoctorsQuery(doctorFilters);

  const toggleConsultation = useCallback((type: DoctorConsultationType) => {
    setConsultationType((current) => (current === type ? undefined : type));
  }, []);

  const clearFilters = useCallback(() => {
    setSearch('');
    setSpecialtySlug(undefined);
    setConsultationType(undefined);
  }, []);

  const onToggleFavorite = useCallback(async (doctorId: number) => {
    const next = await toggleDoctorFavorite(doctorId);
    setFavoriteIds((prev) =>
      next ? [...prev, doctorId] : prev.filter((id) => id !== doctorId),
    );
  }, []);

  const listHeader = (
    <View>
      <TouchableOpacity
        onPress={() => setCountryModalOpen(true)}
        style={tw`mx-4 mb-4 flex-row items-center justify-between bg-white rounded-2xl px-4 py-3.5 border border-slate-200`}
      >
        <View style={tw`flex-row items-center`}>
          <Feather name="globe" size={18} color="#0284C7" />
          <Text style={tw`ml-3 font-semibold text-slate-800`}>
            {countriesLoading
              ? t('loading', 'Loading...')
              : selectedCountry?.name ?? t('selectCountry', 'Select country')}
          </Text>
        </View>
        <Feather name="chevron-down" size={18} color="#64748B" />
      </TouchableOpacity>

      <View style={tw`px-4 pb-2`}>
        <View style={tw`flex-row items-center justify-between mb-2`}>
          <Text style={tw`text-xs font-semibold uppercase tracking-wider text-slate-400`}>
            {t('browseSpecialties', 'Browse by specialty')}
          </Text>
          <TouchableOpacity onPress={() => setSpecialtyModalOpen(true)}>
            <Text style={tw`text-xs font-semibold text-sky-600`}>{t('viewAll', 'View all')}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 108 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={tw`items-start pr-4`}
            style={tw`flex-grow-0`}
          >
            {specialties.map((item) => {
              const selected = specialtySlug === item.slug;
              const icon = SPECIALTY_ICONS[item.slug] ?? 'stethoscope';
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setSpecialtySlug(selected ? undefined : item.slug)}
                  activeOpacity={0.8}
                  style={tw`mr-3 items-center w-[76px]`}
                >
                  <View
                    style={tw`w-[68px] rounded-2xl px-2 py-2.5 items-center border ${
                      selected ? 'bg-sky-600 border-sky-600' : 'bg-white border-slate-200'
                    }`}
                  >
                    <View
                      style={tw`w-12 h-12 rounded-2xl items-center justify-center ${
                        selected ? 'bg-white/25' : 'bg-sky-50'
                      }`}
                    >
                      <FontAwesome5
                        name={icon}
                        size={18}
                        color={selected ? '#FFFFFF' : '#0284C7'}
                        solid
                      />
                    </View>
                  </View>
                  <Text
                    style={tw`mt-2 text-[11px] font-medium text-center leading-4 ${
                      selected ? 'text-sky-700' : 'text-slate-600'
                    }`}
                    numberOfLines={2}
                  >
                    {translateSpecialtyName(item.slug, item.name, languageCode)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      <View style={tw`px-4 pb-3`}>
        <Text style={tw`text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2`}>
          {t('consultationType', 'Consultation type')}
        </Text>
        <View style={tw`flex-row`}>
          {(['online', 'physical'] as const).map((type) => {
            const selected = consultationType === type;
            const isOnline = type === 'online';
            return (
              <TouchableOpacity
                key={type}
                onPress={() => toggleConsultation(type)}
                activeOpacity={0.85}
                style={tw`mr-2 flex-row items-center px-4 py-2.5 rounded-xl border ${
                  selected
                    ? isOnline
                      ? 'bg-emerald-600 border-emerald-600'
                      : 'bg-violet-600 border-violet-600'
                    : 'bg-white border-slate-200'
                }`}
              >
                <Feather
                  name={isOnline ? 'video' : 'map-pin'}
                  size={14}
                  color={selected ? '#FFFFFF' : '#64748B'}
                />
                <Text
                  style={tw`ml-2 text-sm font-semibold ${
                    selected ? 'text-white' : 'text-slate-600'
                  }`}
                >
                  {isOnline ? t('onlineConsult', 'Online') : t('physicalConsult', 'In person')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={tw`px-4 pb-3 flex-row items-center justify-between`}>
        <Text style={tw`text-sm font-semibold text-slate-700`}>
          {isLoading || isFetching
            ? t('searching', 'Searching...')
            : `${doctors.length} ${
                doctors.length === 1 ? t('doctorFound', 'doctor found') : t('doctorsFound', 'doctors found')
              }`}
        </Text>
        {(specialtySlug || consultationType || search.trim()) ? (
          <TouchableOpacity onPress={clearFilters}>
            <Text style={tw`text-xs font-semibold text-sky-600`}>{t('clearFilters', 'Clear filters')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`} edges={['top', 'left', 'right']}>
      <LinearGradient
        colors={['#0077CC', '#00AEEF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={tw`px-4 pt-2 pb-6 rounded-b-3xl`}
      >
        <View style={tw`flex-row items-center mb-4`}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={tw`mr-3 w-10 h-10 rounded-full bg-white/15 items-center justify-center`}
          >
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={tw`flex-1`}>
            <Text style={tw`text-xl font-bold text-white`}>{t('doctorsTitle', 'Find a Doctor')}</Text>
            <Text style={tw`text-sm text-sky-100 mt-0.5`}>
              {t('doctorsSubtitle', 'Book trusted healthcare professionals near you')}
            </Text>
          </View>
          <TouchableOpacity style={tw`w-10 h-10 rounded-full bg-white/15 items-center justify-center mr-2`}>
            <Feather name="bell" size={18} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={tw`w-10 h-10 rounded-full bg-white/15 items-center justify-center`}>
            <FontAwesome5 name="stethoscope" size={16} color="#FFFFFF" />
          </View>
        </View>

        <View
          style={[
            tw`flex-row items-center bg-white rounded-2xl px-4 py-3`,
            Platform.OS === 'web'
              ? ({ boxShadow: '0 10px 30px rgba(0, 119, 204, 0.25)' } as object)
              : tw`shadow-lg`,
          ]}
        >
          <Feather name="search" size={18} color="#94A3B8" />
          <TextInput
            placeholder={t('searchDoctor', 'Search by name or clinic...')}
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            style={tw`ml-3 flex-1 text-slate-800 text-base`}
          />
          {isFetching ? <ActivityIndicator size="small" color="#0284C7" /> : null}
          {search.length > 0 ? (
            <TouchableOpacity onPress={() => setSearch('')} style={tw`p-1 ml-2`}>
              <Feather name="x" size={16} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </LinearGradient>

      {isError ? (
        <View style={tw`flex-1 items-center justify-center px-8`}>
          <Text style={tw`text-lg font-bold text-slate-800 text-center`}>
            {t('doctorsLoadFailed', 'Unable to load doctors')}
          </Text>
          <Text style={tw`text-sm text-slate-500 text-center mt-2`}>
            {t('doctorsLoadFailedHint', 'Please check your connection and try again.')}
          </Text>
          <TouchableOpacity onPress={() => void refetch()} style={tw`mt-5 bg-sky-600 px-5 py-3 rounded-xl`}>
            <Text style={tw`text-white font-semibold`}>{t('retry', 'Retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={tw`px-4 pb-10 pt-4`}
          ListHeaderComponent={listHeader}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            isLoading ? (
              <DoctorSkeletonList />
            ) : (
              <View style={tw`items-center mt-10 px-6`}>
                <View style={tw`w-20 h-20 rounded-full bg-sky-50 items-center justify-center mb-4`}>
                  <FontAwesome5 name="user-md" size={32} color="#0284C7" />
                </View>
                <Text style={tw`text-lg font-bold text-slate-800 text-center`}>
                  {t('noDoctors', 'No doctors found')}
                </Text>
                <Text style={tw`text-sm text-slate-500 text-center mt-2 leading-5`}>
                  {t('noDoctorsHint', 'Try changing the country, specialty, or consultation type.')}
                </Text>
                {(specialtySlug || consultationType || search.trim()) ? (
                  <TouchableOpacity onPress={clearFilters} style={tw`mt-4`}>
                    <Text style={tw`text-sky-600 font-semibold`}>{t('clearFilters', 'Clear filters')}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )
          }
          renderItem={({ item }) => (
            <DoctorCard
              doctor={item}
              isFavorite={favoriteIds.includes(item.id)}
              onPress={() => navigation.navigate('DoctorDetail', { doctorId: item.id })}
              onPressLocation={() =>
                navigation.navigate('DoctorDetail', { doctorId: item.id, openSection: 'location' })
              }
              onToggleFavorite={() => void onToggleFavorite(item.id)}
            />
          )}
        />
      )}

      <CountryPickerModal
        visible={countryModalOpen}
        countries={countries}
        selected={selectedCountry}
        onSelect={(country) => {
          setCountryManual(true);
          setSelectedCountry(country);
        }}
        onClose={() => setCountryModalOpen(false)}
      />

      <SpecialtyPickerModal
        visible={specialtyModalOpen}
        specialties={specialties}
        selectedSlug={specialtySlug}
        onSelect={setSpecialtySlug}
        onClose={() => setSpecialtyModalOpen(false)}
      />
    </SafeAreaView>
  );
}
