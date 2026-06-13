import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { RootStackParamList } from '../navigation/navigation';
import { useTranslation } from '../hooks/useTranslation';
import {
  useGetRideCategoriesQuery,
  useEstimateRidePriceMutation,
  useGetNearbyDriversMutation,
  useRequestRideMutation,
} from '../redux/api/ridesApi';
import type { RideCategory } from '../services/rides/types';
import { geocodeAddress } from '../utils/getCoordsFromLocationOrAddress';
import RideRequestSheet from '../components/rides/RideRequestSheet';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SafeMapView = MapView as React.ComponentType<React.ComponentProps<typeof MapView>>;

interface LatLng {
  latitude: number;
  longitude: number;
}

const DEFAULT_REGION: Region = {
  latitude: -33.9249,
  longitude: 18.4241,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export default function RidesScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const token = useSelector((s: RootState) => s.auth.token);
  const mapRef = useRef<MapView | null>(null);

  const [locationState, setLocationState] = useState<'loading' | 'ready' | 'denied'>('loading');
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupCoords, setPickupCoords] = useState<LatLng | null>(null);
  const [destCoords, setDestCoords] = useState<LatLng | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<RideCategory | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const { data: categories = [], isLoading: categoriesLoading } = useGetRideCategoriesQuery('ZA');
  const [estimatePrice, { data: estimate, isLoading: estimateLoading, reset: resetEstimate }] =
    useEstimateRidePriceMutation();
  const [fetchNearby, { data: nearby, isLoading: driversLoading, reset: resetNearby }] =
    useGetNearbyDriversMutation();
  const [requestRide, { isLoading: requestLoading }] = useRequestRideMutation();

  useEffect(() => {
    if (categories.length && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  const initLocation = useCallback(async () => {
    setLocationState('loading');
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationState('denied');
      return;
    }
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setPickupCoords(coords);
      setLocationState('ready');

      const places = await Location.reverseGeocodeAsync(coords);
      if (places[0]) {
        const label = [places[0].name, places[0].city].filter(Boolean).join(', ');
        setPickup(label || t('ride.current_location', 'Current location'));
      } else {
        setPickup(t('ride.current_location', 'Current location'));
      }

      mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.05, longitudeDelta: 0.05 });
    } catch {
      setLocationState('denied');
    }
  }, [t]);

  useEffect(() => {
    initLocation();
  }, [initLocation]);

  const refreshQuote = useCallback(async () => {
    if (!pickupCoords || !destCoords || !selectedCategory) return;
    setValidationMessage(null);
    resetEstimate();
    resetNearby();

    try {
      await estimatePrice({
        pickup_latitude: pickupCoords.latitude,
        pickup_longitude: pickupCoords.longitude,
        destination_latitude: destCoords.latitude,
        destination_longitude: destCoords.longitude,
        ride_category_id: selectedCategory.id,
        country_code: 'ZA',
      }).unwrap();

      await fetchNearby({
        pickup_latitude: pickupCoords.latitude,
        pickup_longitude: pickupCoords.longitude,
        ride_category_id: selectedCategory.id,
        country_code: 'ZA',
      }).unwrap();

      mapRef.current?.fitToCoordinates([pickupCoords, destCoords], {
        edgePadding: { top: 100, right: 48, bottom: 360, left: 48 },
        animated: true,
      });
    } catch {
      setValidationMessage(t('ride.estimate_error', 'Something went wrong. Please try again.'));
    }
  }, [
    pickupCoords,
    destCoords,
    selectedCategory,
    estimatePrice,
    fetchNearby,
    resetEstimate,
    resetNearby,
    t,
  ]);

  useEffect(() => {
    if (pickupCoords && destCoords && selectedCategory) {
      void refreshQuote();
    }
  }, [pickupCoords, destCoords, selectedCategory?.id, refreshQuote]);

  const onDestinationSubmit = async () => {
    if (!destination.trim()) {
      setValidationMessage(t('ride.enter_destination', 'Please enter your destination first.'));
      return;
    }
    const coords = await geocodeAddress(destination.trim());
    if (!coords) {
      setValidationMessage(t('ride.destination_not_found', 'Could not find that destination.'));
      return;
    }
    setDestCoords({ latitude: coords.lat, longitude: coords.lng });
    setValidationMessage(null);
  };

  const canRequest = Boolean(
    token &&
      pickupCoords &&
      destCoords &&
      selectedCategory &&
      estimate &&
      nearby?.drivers_available &&
      !estimateLoading &&
      !driversLoading,
  );

  const onRequest = async () => {
    if (!token) {
      Alert.alert(t('loginRequired', 'Login required'), t('login', 'Login'));
      navigation.navigate('UserLogin');
      return;
    }
    if (!pickupCoords || !destCoords || !selectedCategory) {
      setValidationMessage(t('ride.missing_locations', 'Please set pickup and destination.'));
      return;
    }
    if (!nearby?.drivers_available) {
      setValidationMessage(t('ride.no_drivers_available', 'No drivers are currently available nearby.'));
      return;
    }

    try {
      const ride = await requestRide({
        pickup_address: pickup || t('ride.current_location', 'Current location'),
        pickup_lat: pickupCoords.latitude,
        pickup_lng: pickupCoords.longitude,
        destination_address: destination,
        destination_lat: destCoords.latitude,
        destination_lng: destCoords.longitude,
        ride_type: selectedCategory.slug,
        payment_method: 'cash',
      }).unwrap();

      Alert.alert(t('ride.request_sent_title', 'Ride request sent'), t('ride.request_sent_body', 'Waiting for a driver to accept...'));
      navigation.navigate('RideTracking', { rideId: ride.id });
    } catch {
      Alert.alert(t('error', 'Error'), t('bookingFailed', 'Could not request ride'));
    }
  };

  const routeCoords = useMemo(
    () => (pickupCoords && destCoords ? [pickupCoords, destCoords] : []),
    [pickupCoords, destCoords],
  );

  const mapRegion = pickupCoords
    ? { ...pickupCoords, latitudeDelta: 0.08, longitudeDelta: 0.08 }
    : DEFAULT_REGION;

  return (
    <View style={tw`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
      <SafeMapView
        ref={mapRef}
        style={tw`absolute inset-0`}
        initialRegion={mapRegion}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {pickupCoords && (
          <Marker coordinate={pickupCoords} title={t('pickup', 'Pickup')}>
            <View style={tw`w-4 h-4 rounded-full bg-emerald-500 border-2 border-white`} />
          </Marker>
        )}
        {destCoords && (
          <Marker coordinate={destCoords} title={t('destination', 'Destination')}>
            <View style={tw`w-4 h-4 rounded-full bg-red-500 border-2 border-white`} />
          </Marker>
        )}
        {routeCoords.length === 2 && (
          <Polyline coordinates={routeCoords} strokeColor="#2563EB" strokeWidth={4} />
        )}
      </SafeMapView>

      <SafeAreaView style={tw`flex-1`} pointerEvents="box-none">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={tw`m-4 w-11 h-11 rounded-full items-center justify-center shadow-lg ${
            isDark ? 'bg-slate-900' : 'bg-white'
          }`}
        >
          <Feather name="arrow-left" size={22} color={isDark ? '#F8FAFC' : '#0F172A'} />
        </TouchableOpacity>

        {locationState === 'loading' && (
          <View
            style={tw`mx-4 mt-2 self-start rounded-full px-4 py-2 flex-row items-center ${
              isDark ? 'bg-slate-900/90' : 'bg-white/95'
            }`}
          >
            <ActivityIndicator size="small" color="#2563EB" />
          </View>
        )}

        {locationState === 'denied' && (
          <TouchableOpacity
            onPress={initLocation}
            style={tw`mx-4 mt-2 self-start rounded-full px-4 py-2 ${isDark ? 'bg-amber-900/80' : 'bg-amber-100'}`}
          >
            <Feather name="map-pin" size={16} color="#D97706" />
          </TouchableOpacity>
        )}
      </SafeAreaView>

      <RideRequestSheet
        pickup={pickup}
        destination={destination}
        onPickupChange={setPickup}
        onDestinationChange={setDestination}
        onDestinationSubmit={onDestinationSubmit}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        estimate={estimate ?? null}
        nearby={nearby ?? null}
        estimateLoading={estimateLoading}
        driversLoading={driversLoading}
        requestLoading={requestLoading}
        canRequest={canRequest}
        validationMessage={validationMessage}
        onRequest={onRequest}
        isDark={isDark}
        t={t}
      />
    </View>
  );
}
