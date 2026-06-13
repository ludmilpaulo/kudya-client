import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import tw from 'twrnc';
import type { NearbyDriverResponse, RideCategory, RidePriceEstimate } from '../../services/rides/types';

type TranslateFn = (key: string, fallback?: string) => string;

type Props = {
  pickup: string;
  destination: string;
  onPickupChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onDestinationSubmit: () => void;
  categories: RideCategory[];
  selectedCategory: RideCategory | null;
  onSelectCategory: (category: RideCategory) => void;
  estimate: RidePriceEstimate | null;
  nearby: NearbyDriverResponse | null;
  estimateLoading: boolean;
  driversLoading: boolean;
  requestLoading: boolean;
  canRequest: boolean;
  validationMessage: string | null;
  onRequest: () => void;
  isDark: boolean;
  t: TranslateFn;
};

export default function RideRequestSheet({
  pickup,
  destination,
  onPickupChange,
  onDestinationChange,
  onDestinationSubmit,
  categories,
  selectedCategory,
  onSelectCategory,
  estimate,
  nearby,
  estimateLoading,
  driversLoading,
  requestLoading,
  canRequest,
  validationMessage,
  onRequest,
  isDark,
  t,
}: Props) {
  return (
    <View
      style={tw`absolute left-0 right-0 bottom-0 rounded-t-3xl px-4 pt-4 pb-8 ${
        isDark ? 'bg-slate-900' : 'bg-white'
      }`}
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={tw`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {t('ride.request_title', 'Request a ride')}
        </Text>

        <TextInput
          value={pickup}
          onChangeText={onPickupChange}
          placeholder={t('pickup', 'Pickup')}
          placeholderTextColor={isDark ? '#94A3B8' : '#64748B'}
          style={tw`rounded-xl px-4 py-3 mb-3 border ${isDark ? 'border-slate-700 text-white' : 'border-slate-200 text-slate-900'}`}
        />
        <TextInput
          value={destination}
          onChangeText={onDestinationChange}
          onSubmitEditing={onDestinationSubmit}
          placeholder={t('destination', 'Destination')}
          placeholderTextColor={isDark ? '#94A3B8' : '#64748B'}
          style={tw`rounded-xl px-4 py-3 mb-3 border ${isDark ? 'border-slate-700 text-white' : 'border-slate-200 text-slate-900'}`}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`mb-3`}>
          {categories.map((category) => {
            const active = selectedCategory?.id === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                onPress={() => onSelectCategory(category)}
                style={tw`mr-2 rounded-full px-4 py-2 ${active ? 'bg-blue-600' : isDark ? 'bg-slate-800' : 'bg-slate-100'}`}
              >
                <Text style={tw`${active ? 'text-white' : isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {estimateLoading || driversLoading ? (
          <ActivityIndicator color="#2563EB" style={tw`my-3`} />
        ) : null}

        {estimate ? (
          <Text style={tw`mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {estimate.currency} {estimate.estimated_min_price.toFixed(0)} - {estimate.estimated_max_price.toFixed(0)}
          </Text>
        ) : null}

        {nearby ? (
          <Text style={tw`mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{nearby.message}</Text>
        ) : null}

        {validationMessage ? (
          <Text style={tw`mb-2 text-amber-600`}>{validationMessage}</Text>
        ) : null}

        <TouchableOpacity
          onPress={onRequest}
          disabled={!canRequest || requestLoading}
          style={tw`rounded-xl py-4 items-center ${canRequest ? 'bg-blue-600' : 'bg-slate-400'}`}
        >
          <Text style={tw`text-white font-bold`}>
            {requestLoading ? t('loading', 'Loading...') : t('ride.request_ride', 'Request ride')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
