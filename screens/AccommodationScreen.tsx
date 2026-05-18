import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { baseAPI } from '../services/types';
import { useTranslation } from '../hooks/useTranslation';

interface Listing {
  id: number;
  title: string;
  property_type: string;
  city_name: string | null;
  price_per_night: number;
  currency: string;
  rating: number;
  images: { image: string }[];
}

export default function AccommodationScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${baseAPI}/api/accommodation/listings/`)
      .then((res) => setListings(res.data.results ?? res.data))
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
          renderItem={({ item }) => (
            <View style={tw`bg-white rounded-2xl mb-3 overflow-hidden border border-slate-100`}>
              {item.images?.[0]?.image ? (
                <Image source={{ uri: item.images[0].image }} style={tw`w-full h-40`} />
              ) : (
                <View style={tw`w-full h-40 bg-slate-200 items-center justify-center`}>
                  <Feather name="home" size={32} color="#94A3B8" />
                </View>
              )}
              <View style={tw`p-4`}>
                <Text style={tw`font-bold text-slate-900`}>{item.title}</Text>
                <Text style={tw`text-slate-500 text-sm`}>{item.city_name} · {item.property_type}</Text>
                <Text style={tw`font-bold text-blue-600 mt-2`}>
                  {item.price_per_night} {item.currency} / night
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
