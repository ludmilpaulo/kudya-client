import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import type { RideCategory, RidePriceEstimate } from '../../services/rides/types';
import { formatCurrency } from '../../utils/currency';

const ICONS: Record<string, React.ReactNode> = {
  car: <Feather name="navigation" size={22} color="#fff" />,
  'car-side': <FontAwesome5 name="car-side" size={20} color="#fff" />,
  gem: <Feather name="award" size={22} color="#fff" />,
  users: <Feather name="users" size={22} color="#fff" />,
  bike: <MaterialCommunityIcons name="bike" size={24} color="#fff" />,
};

type Props = {
  categories: RideCategory[];
  selectedId: number | null;
  onSelect: (category: RideCategory) => void;
  estimate: RidePriceEstimate | null;
  estimateLoading: boolean;
  isDark: boolean;
  t: (key: string, fallback?: string) => string;
};

export default function RideCategorySelector({
  categories,
  selectedId,
  onSelect,
  estimate,
  estimateLoading,
  isDark,
  t,
}: Props) {
  return (
    <View style={tw`mt-4`}>
      <Text style={tw`text-sm font-semibold mb-3 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
        {t('ride.choose_ride', 'Choose your ride')}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((cat) => {
          const selected = cat.id === selectedId;
          const fromPrice =
            selected && estimate
              ? formatCurrency(estimate.estimated_min_price, estimate.currency as never)
              : `${formatCurrency(Number(cat.minimumFare), 'ZAR' as never)}+`;
          return (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.85}
              onPress={() => onSelect(cat)}
              style={tw`mr-3 w-36 rounded-2xl p-3 border ${
                selected
                  ? 'bg-blue-600 border-blue-500'
                  : isDark
                    ? 'bg-slate-800 border-slate-700'
                    : 'bg-white border-slate-200'
              }`}
            >
              <View
                style={tw`w-10 h-10 rounded-xl items-center justify-center mb-2 ${
                  selected ? 'bg-blue-500' : isDark ? 'bg-slate-700' : 'bg-slate-100'
                }`}
              >
                {ICONS[cat.icon] ?? ICONS.car}
              </View>
              <Text style={tw`font-bold ${selected ? 'text-white' : isDark ? 'text-white' : 'text-slate-900'}`}>
                {cat.name}
              </Text>
              <Text
                style={tw`text-xs mt-0.5 ${selected ? 'text-blue-100' : isDark ? 'text-slate-400' : 'text-slate-500'}`}
                numberOfLines={2}
              >
                {cat.description}
              </Text>
              <Text style={tw`text-xs mt-2 ${selected ? 'text-blue-100' : isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {cat.capacity} {t('ride.seats', 'seats')}
              </Text>
              <Text style={tw`text-sm font-semibold mt-1 ${selected ? 'text-white' : isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {t('ride.from_price', 'From')} {fromPrice}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {estimateLoading && (
        <View style={tw`flex-row items-center mt-3`}>
          <ActivityIndicator size="small" color="#2563EB" />
          <Text style={tw`ml-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {t('ride.calculating_fare', 'Calculating fare...')}
          </Text>
        </View>
      )}
    </View>
  );
}
