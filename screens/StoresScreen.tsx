import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';

import { RootStackParamList } from '../navigation/navigation';
import { RootState, AppDispatch } from '../redux/store';
import { fetchStoresByType, fetchStoresByVertical } from '../redux/slices/storesSlice';
import type { MarketplaceVertical } from '../utils/normalizeStores';
import StoreCard from '../components/StoreCard';
import { getDistanceFromLatLonInKm } from '../utils/distance';
import { useUserLocation } from '../hooks/useUserLocation';
import type { Store } from '../services/types';

type StoresRouteProp = RouteProp<RootStackParamList, 'Stores'>;
type StoresNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Stores'>;

export default function StoresScreen() {
  const route = useRoute<StoresRouteProp>();
  const navigation = useNavigation<StoresNavigationProp>();
  const { storeTypeId, vertical } = route.params;
  const dispatch = useDispatch<AppDispatch>();

  const stores = useSelector((state: RootState) => state.stores.data);
  const loading = useSelector((state: RootState) => state.stores.loading);
  const error = useSelector((state: RootState) => state.stores.error);

  const userLocation = useUserLocation();

  const title =
    vertical === 'food'
      ? 'Restaurants'
      : vertical === 'groceries'
        ? 'Groceries'
        : 'Nearby Stores';

  useEffect(() => {
    if (vertical === 'food' || vertical === 'groceries') {
      dispatch(fetchStoresByVertical(vertical));
      return;
    }
    if (storeTypeId) {
      dispatch(fetchStoresByType(storeTypeId));
    }
  }, [storeTypeId, vertical, dispatch]);

  // Calculate store distances
  const storesWithDistance = useMemo(() => {
    return stores.map(store => {
      let distance = null;
      if (
        userLocation &&
        typeof store.latitude === 'number' &&
        typeof store.longitude === 'number'
      ) {
        distance = getDistanceFromLatLonInKm(
          userLocation.latitude,
          userLocation.longitude,
          store.latitude,
          store.longitude
        );
      }
      return { ...store, distance };
    });
  }, [stores, userLocation]);

  // Sort by distance (if available)
  const sortedStores = useMemo(() => {
    return [...storesWithDistance].sort((a, b) => {
      if (a.distance != null && b.distance != null) {
        return a.distance - b.distance;
      }
      if (a.distance != null) return -1;
      if (b.distance != null) return 1;
      return 0;
    });
  }, [storesWithDistance]);

  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - 48) / 2;

  return (
    <LinearGradient
      colors={['#FCD34D', '#ffcc00', '#3B82F6']}
      style={tw`flex-1`}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={tw`p-4 pb-32 flex-row flex-wrap justify-between`}>
        <Text style={tw`text-2xl font-bold text-white mb-4 w-full`}>{title}</Text>

        {loading && (
          <View style={tw`w-full py-24 items-center`}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={tw`text-white mt-3`}>Loading stores...</Text>
          </View>
        )}

        {!loading && error && (
          <Text style={tw`w-full text-center text-red-100 bg-red-500/60 rounded-xl px-4 py-3 mb-4`}>
            {error}
          </Text>
        )}

        {!loading && !error && sortedStores.length === 0 && (
          <Text style={tw`w-full text-center text-white/90 mt-16 text-base`}>No stores available for this category.</Text>
        )}

        {!loading &&
          sortedStores.map((store, idx) => (
            <StoreCard
              key={store.id}
              store={store}
              onPress={() =>
                navigation.navigate('Products', {
                  storeId: store.id,
                  storeName: store.name,
                  vertical: vertical ?? undefined,
                })
              }
              index={idx}
              cardWidth={cardWidth}
            />
          ))}
      </ScrollView>
    </LinearGradient>
  );
}
