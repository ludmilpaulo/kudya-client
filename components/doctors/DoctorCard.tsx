import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import tw from 'twrnc';
import type { Doctor } from '../../services/doctors/types';
import { formatDoctorLocationLine } from '../../utils/doctorMaps';
import { formatRating } from '../../utils/formatNumber';
import { useTranslation } from '../../hooks/useTranslation';
import { translateSpecialtyName } from '../../utils/doctorSpecialtyI18n';

type Props = {
  doctor: Doctor;
  isFavorite: boolean;
  onPress: () => void;
  onPressLocation: () => void;
  onToggleFavorite: () => void;
};

export default function DoctorCard({
  doctor,
  isFavorite,
  onPress,
  onPressLocation,
  onToggleFavorite,
}: Props) {
  const { t, languageCode } = useTranslation();
  const locationLine = formatDoctorLocationLine(doctor);
  const specialtyLabel = translateSpecialtyName(
    doctor.specialty_slug,
    doctor.specialty_name,
    languageCode,
  );

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        tw`bg-white rounded-2xl p-4 mb-4 border border-slate-100`,
        Platform.OS === 'web'
          ? ({ boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)' } as object)
          : tw`shadow-md`,
      ]}
    >
      <View style={tw`flex-row`}>
        <View style={tw`relative`}>
          {doctor.profile_photo ? (
            <Image source={{ uri: doctor.profile_photo }} style={tw`w-[72px] h-[72px] rounded-2xl`} />
          ) : (
            <View style={tw`w-[72px] h-[72px] rounded-2xl bg-sky-50 items-center justify-center border-2 border-sky-100`}>
              <FontAwesome5 name="user-md" size={28} color="#0284C7" />
            </View>
          )}
          <View style={tw`absolute -bottom-1 -right-1 bg-amber-400 rounded-full px-1.5 py-0.5 flex-row items-center border-2 border-white`}>
            <Feather name="star" size={10} color="#FFFFFF" />
            <Text style={tw`text-white text-[10px] font-bold ml-0.5`}>{formatRating(doctor.rating)}</Text>
          </View>
        </View>

        <View style={tw`flex-1 ml-4`}>
          <View style={tw`flex-row items-start justify-between`}>
            <View style={tw`flex-1 pr-2`}>
              <Text style={tw`text-base font-bold text-slate-900`} numberOfLines={1}>
                {doctor.name}
              </Text>
              {doctor.is_verified ? (
                <View style={tw`flex-row items-center mt-1`}>
                  <Feather name="check-circle" size={12} color="#0284C7" />
                  <Text style={tw`text-[10px] font-semibold text-sky-700 ml-1`}>
                    {t('verifiedDoctor', 'Verified')}
                  </Text>
                </View>
              ) : null}
            </View>
            <TouchableOpacity onPress={onToggleFavorite} hitSlop={12} style={tw`p-1`}>
              <FontAwesome5
                name="heart"
                size={16}
                color={isFavorite ? '#EF4444' : '#CBD5E1'}
                solid={isFavorite}
              />
            </TouchableOpacity>
          </View>

          {doctor.clinic_name ? (
            <Text style={tw`text-xs text-slate-500 mt-0.5`} numberOfLines={1}>
              {doctor.clinic_name}
            </Text>
          ) : null}

          <View style={tw`self-start mt-2 px-2.5 py-1 rounded-full bg-sky-50 border border-sky-100`}>
            <Text style={tw`text-xs font-semibold text-sky-700`}>{specialtyLabel}</Text>
          </View>

          <TouchableOpacity onPress={onPressLocation} activeOpacity={0.7} style={tw`flex-row items-center mt-2`}>
            <Feather name="map-pin" size={12} color="#0284C7" />
            <Text style={tw`text-xs text-sky-700 ml-1 underline`} numberOfLines={1}>
              {locationLine}
            </Text>
          </TouchableOpacity>

          <View style={tw`flex-row flex-wrap mt-2`}>
            {doctor.online_consultation_enabled ? (
              <View style={tw`flex-row items-center px-2 py-0.5 rounded-md bg-emerald-50 mr-1.5 mb-1`}>
                <Feather name="video" size={10} color="#059669" />
                <Text style={tw`text-[10px] font-medium text-emerald-700 ml-1`}>
                  {t('onlineConsult', 'Online')}
                </Text>
              </View>
            ) : null}
            {doctor.physical_consultation_enabled ? (
              <View style={tw`flex-row items-center px-2 py-0.5 rounded-md bg-violet-50 mb-1`}>
                <Feather name="home" size={10} color="#7C3AED" />
                <Text style={tw`text-[10px] font-medium text-violet-700 ml-1`}>
                  {t('physicalConsult', 'In person')}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={tw`justify-between items-end pl-2`}>
          <Feather name="chevron-right" size={20} color="#CBD5E1" />
          <Text style={tw`text-base font-bold text-slate-900`}>{doctor.consultation_fee}</Text>
          <Text style={tw`text-[10px] text-slate-400 font-medium`}>{doctor.currency}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
