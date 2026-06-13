import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Pressable,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import tw from 'twrnc';
import type { Country } from '../../services/doctors/types';
import { useTranslation } from '../../hooks/useTranslation';

type Props = {
  visible: boolean;
  countries: Country[];
  selected: Country | null;
  onSelect: (country: Country) => void;
  onClose: () => void;
};

export default function CountryPickerModal({
  visible,
  countries,
  selected,
  onSelect,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.currency.toLowerCase().includes(q),
    );
  }, [countries, query]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={tw`flex-1 bg-black/40 justify-end`} onPress={onClose}>
        <Pressable style={tw`bg-white rounded-t-3xl max-h-[80%]`} onPress={(e) => e.stopPropagation()}>
          <View style={tw`p-4 border-b border-slate-100`}>
            <Text style={tw`text-lg font-bold text-slate-900`}>
              {t('selectCountry', 'Select country')}
            </Text>
            <View style={tw`mt-3 flex-row items-center bg-slate-100 rounded-xl px-3 py-2.5`}>
              <Feather name="search" size={16} color="#64748B" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={t('searchCountry', 'Search country...')}
                placeholderTextColor="#94A3B8"
                style={tw`flex-1 ml-2 text-slate-800`}
              />
            </View>
          </View>
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const active = selected?.id === item.id;
              return (
                <TouchableOpacity
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  style={tw`px-4 py-3.5 flex-row items-center justify-between border-b border-slate-50 ${
                    active ? 'bg-sky-50' : ''
                  }`}
                >
                  <View>
                    <Text style={tw`font-semibold text-slate-900`}>
                      {item.flag_icon ? `${item.flag_icon} ` : ''}
                      {item.name}
                    </Text>
                    <Text style={tw`text-xs text-slate-500 mt-0.5`}>
                      {item.code} · {item.currency}
                    </Text>
                  </View>
                  {active ? <Feather name="check" size={18} color="#0284C7" /> : null}
                </TouchableOpacity>
              );
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
