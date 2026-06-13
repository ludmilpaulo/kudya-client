import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Pressable,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import tw from 'twrnc';
import type { MedicalSpecialty } from '../../services/doctors/types';
import { useTranslation } from '../../hooks/useTranslation';
import { translateSpecialtyName } from '../../utils/doctorSpecialtyI18n';

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

type Props = {
  visible: boolean;
  specialties: MedicalSpecialty[];
  selectedSlug?: string;
  onSelect: (slug: string | undefined) => void;
  onClose: () => void;
};

export default function SpecialtyPickerModal({
  visible,
  specialties,
  selectedSlug,
  onSelect,
  onClose,
}: Props) {
  const { t, languageCode } = useTranslation();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={tw`flex-1 bg-black/40 justify-end`} onPress={onClose}>
        <Pressable style={tw`bg-white rounded-t-3xl max-h-[80%]`} onPress={(e) => e.stopPropagation()}>
          <View style={tw`p-4 border-b border-slate-100`}>
            <Text style={tw`text-lg font-bold text-slate-900`}>
              {t('allSpecialties', 'All specialties')}
            </Text>
          </View>
          <FlatList
            data={specialties}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => {
              const active = selectedSlug === item.slug;
              const icon = SPECIALTY_ICONS[item.slug] ?? 'stethoscope';
              return (
                <TouchableOpacity
                  onPress={() => {
                    onSelect(active ? undefined : item.slug);
                    onClose();
                  }}
                  style={tw`px-4 py-3.5 flex-row items-center border-b border-slate-50 ${
                    active ? 'bg-sky-50' : ''
                  }`}
                >
                  <View style={tw`w-10 h-10 rounded-xl bg-sky-100 items-center justify-center mr-3`}>
                    <FontAwesome5 name={icon} size={16} color="#0284C7" solid />
                  </View>
                  <Text style={tw`font-semibold text-slate-900 flex-1`}>
                    {translateSpecialtyName(item.slug, item.name, languageCode)}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
