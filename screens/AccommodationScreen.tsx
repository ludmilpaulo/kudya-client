import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import tw from 'twrnc';
import { useAppNavigation } from '../navigation/hooks';
import { baseAPI } from '../services/types';
import { useTranslation } from '../hooks/useTranslation';

type StayListing = {
  id: number;
  title: string;
  city?: { name?: string } | string;
  city_name?: string;
  price?: string | number;
  currency?: string;
};

export default function AccommodationScreen() {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const [listings, setListings] = useState<StayListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${baseAPI}/api/properties/search/`, { params: { purpose: 'stay' } })
      .then((res) => {
        const payload = res.data as StayListing[] | { results?: StayListing[] };
        setListings(Array.isArray(payload) ? payload : payload.results ?? []);
      })
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      <View style={tw`flex-row items-center p-4`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} />
        </TouchableOpacity>
        <Text style={tw`text-xl font-bold ml-3`}>{t('accommodationTitle', 'Book a Stay')}</Text>
      </View>
      {loading ? (
        <ActivityIndicator style={tw`mt-16`} color="#2563EB" />
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={tw`px-4 pb-8`}
          ListEmptyComponent={<Text style={tw`text-center text-slate-500 mt-16`}>{t('noListings', 'No listings yet')}</Text>}
          renderItem={({ item }) => {
            const cityName =
              typeof item.city === 'object' ? item.city?.name ?? '' : String(item.city_name || item.city || '');
            return (
              <TouchableOpacity
                style={tw`bg-white rounded-2xl mb-3 overflow-hidden border border-slate-100`}
                onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}
              >
                <View style={tw`p-4`}>
                  <Text style={tw`font-bold text-slate-900`}>{item.title}</Text>
                  <Text style={tw`text-slate-500 text-sm`}>{cityName}</Text>
                  <Text style={tw`font-bold text-blue-600 mt-2`}>
                    {item.price} {item.currency} / night
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
