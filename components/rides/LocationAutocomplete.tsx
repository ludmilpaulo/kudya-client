import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Keyboard,
} from 'react-native';
import tw from 'twrnc';
import {
  searchPlaces,
  resolvePlaceSuggestion,
  type PlaceSuggestion,
} from '../../utils/placesAutocomplete';

export type SelectedPlace = {
  description: string;
  latitude: number;
  longitude: number;
};

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  onSelectPlace: (place: SelectedPlace) => void;
  placeholder: string;
  isDark: boolean;
  near?: { latitude: number; longitude: number } | null;
  trailing?: React.ReactNode;
  editable?: boolean;
};

export default function LocationAutocomplete({
  value,
  onChangeText,
  onSelectPlace,
  placeholder,
  isDark,
  near,
  trailing,
  editable = true,
}: Props) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!editable || value.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      setLoading(true);
      void searchPlaces(value, near ?? undefined)
        .then((items) => {
          setSuggestions(items);
          setOpen(items.length > 0);
        })
        .finally(() => setLoading(false));
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, near?.latitude, near?.longitude, editable]);

  const handleSelect = async (item: PlaceSuggestion) => {
    setOpen(false);
    setSuggestions([]);
    Keyboard.dismiss();
    setLoading(true);
    try {
      const resolved = await resolvePlaceSuggestion(item);
      if (resolved) {
        onSelectPlace(resolved);
        return;
      }
      onChangeText(item.description);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={tw`flex-1`}>
      <View style={tw`flex-row items-center`}>
        <TextInput
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            setOpen(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
          returnKeyType="search"
          editable={editable}
          style={tw`flex-1 text-base py-3 ${isDark ? 'text-white' : 'text-slate-900'}`}
        />
        {loading ? <ActivityIndicator size="small" color="#2563EB" /> : trailing}
      </View>

      {open && suggestions.length > 0 && (
        <View
          style={tw`absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border overflow-hidden ${
            isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'
          }`}
        >
          <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 180 }}>
            {suggestions.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => void handleSelect(item)}
                style={tw`px-3 py-3 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}
              >
                <Text
                  numberOfLines={2}
                  style={tw`text-sm ${isDark ? 'text-slate-100' : 'text-slate-800'}`}
                >
                  {item.description}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
