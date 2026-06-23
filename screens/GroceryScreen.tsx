import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';

import { RootStackParamList } from '../navigation/navigation';
import { AppDispatch, RootState } from '../redux/store';
import { fetchStoresByVertical } from '../redux/slices/storesSlice';
import StoreCard from '../components/StoreCard';
import { getDistanceFromLatLonInKm } from '../utils/distance';
import { useUserLocation } from '../hooks/useUserLocation';
import { useTranslation } from '../hooks/useTranslation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function GroceryScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const stores = useSelector((s: RootState) => s.stores.data);
  const loading = useSelector((s: RootState) => s.stores.loading);
  const error = useSelector((s: RootState) => s.stores.error);
  const userLocation = useUserLocation();

  useEffect(() => {
    dispatch(fetchStoresByVertical('groceries'));
  }, [dispatch]);

  const storesWithDistance = useMemo(() => {
    return stores.map((store) => {
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
          store.longitude,
        );
      }
      return { ...store, distance };
    });
  }, [stores, userLocation]);

  const cardWidth = (Dimensions.get('window').width - 48) / 2;

  return (
    <LinearGradient colors={['#ecfdf5', '#d1fae5', '#6ee7b7']} style={tw`flex-1`}>
      <SafeAreaView style={tw`flex-1`}>
        <View style={tw`flex-row items-center p-4`}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-2`}>
            <Feather name="arrow-left" size={22} />
          </TouchableOpacity>
          <Text style={tw`text-xl font-bold ml-2`}>{t('groceries', 'Groceries')}</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#059669" style={tw`mt-12`} />
        ) : error ? (
          <Text style={tw`text-center text-red-600 px-6 mt-8`}>{error}</Text>
        ) : storesWithDistance.length === 0 ? (
          <View style={tw`flex-1 items-center justify-center px-8`}>
            <Feather name="shopping-bag" size={48} color="#059669" />
            <Text style={tw`text-center text-slate-600 mt-4`}>
              {t('noStores', 'No stores found nearby.')}
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={tw`px-4 pb-24 flex-row flex-wrap justify-between`}>
            {storesWithDistance.map((store, index) => (
              <StoreCard
                key={store.id}
                store={store}
                index={index}
                cardWidth={cardWidth}
                onPress={() =>
                  navigation.navigate('Products', {
                    storeId: store.id,
                    storeName: store.name,
                    vertical: 'groceries',
                  })
                }
              />
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}
