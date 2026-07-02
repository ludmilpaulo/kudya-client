import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import type { RideCategory, RidePriceEstimate } from '../../services/rides/types';
import { formatCurrency } from '../../utils/currency';

const ICON_NAMES: Record<string, { set: 'feather' | 'fa5' | 'mci'; name: string }> = {
  car: { set: 'feather', name: 'navigation' },
  'car-side': { set: 'fa5', name: 'car-side' },
  gem: { set: 'feather', name: 'award' },
  users: { set: 'feather', name: 'users' },
  bike: { set: 'mci', name: 'bike' },
};

function CategoryIcon({ iconKey, selected, isDark }: { iconKey: string; selected: boolean; isDark: boolean }) {
  const color = selected ? '#FFFFFF' : isDark ? '#94A3B8' : '#475569';
  const spec = ICON_NAMES[iconKey] ?? ICON_NAMES.car;

  if (spec.set === 'fa5') {
    return <FontAwesome5 name={spec.name as 'car-side'} size={20} color={color} />;
  }
  if (spec.set === 'mci') {
    return <MaterialCommunityIcons name={spec.name as 'bike'} size={22} color={color} />;
  }
  return <Feather name={spec.name as 'navigation'} size={20} color={color} />;
}

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
    <View>
      <Text style={tw`text-sm font-semibold mb-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
        {t('ride.choose_ride', 'Choose your ride')}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`pb-1`}>
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
              style={tw`mr-3 w-[132px] rounded-2xl p-3.5 border ${
                selected
                  ? 'bg-blue-600 border-blue-500'
                  : isDark
                    ? 'bg-slate-800 border-slate-700'
                    : 'bg-white border-slate-200'
              }`}
            >
              <View
                style={tw`w-11 h-11 rounded-xl items-center justify-center mb-2.5 ${
                  selected ? 'bg-blue-500/80' : isDark ? 'bg-slate-700' : 'bg-slate-100'
                }`}
              >
                <CategoryIcon iconKey={cat.icon} selected={selected} isDark={isDark} />
              </View>
              <Text style={tw`font-bold text-sm ${selected ? 'text-white' : isDark ? 'text-white' : 'text-slate-900'}`}>
                {cat.name}
              </Text>
              <Text
                style={tw`text-xs mt-0.5 leading-4 ${selected ? 'text-blue-100' : isDark ? 'text-slate-400' : 'text-slate-500'}`}
                numberOfLines={2}
              >
                {cat.description}
              </Text>
              <Text style={tw`text-xs mt-2 ${selected ? 'text-blue-200' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {cat.capacity} {t('ride.seats', 'seats')}
              </Text>
              <Text
                style={tw`text-sm font-bold mt-1.5 ${selected ? 'text-white' : isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
              >
                {t('ride.from_price', 'From')} {fromPrice}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {estimateLoading && (
        <View style={tw`flex-row items-center mt-3`}>
          <ActivityIndicator size="small" color="#2563EB" />
          <Text style={tw`ml-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {t('ride.calculating_fare', 'Calculating fare...')}
          </Text>
        </View>
      )}
    </View>
  );
}
