import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { RootStackParamList } from '../navigation/navigation';
import { useTranslation } from '../hooks/useTranslation';
import { estimateRide, requestRide } from '../services/ridesApi';

type Nav = NativeStackNavigationProp<RootStackParamList>;
const RIDE_TYPES = ['economy', 'comfort', 'premium', 'xl'] as const;
const SafeMapView = MapView as any;

interface LatLng {
  latitude: number;
  longitude: number;
}

export default function RidesScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const token = useSelector((s: RootState) => s.auth.token);
  const mapRef = useRef<MapView | null>(null);

  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [rideType, setRideType] = useState<typeof RIDE_TYPES[number]>('economy');
  const [pickupCoords, setPickupCoords] = useState<LatLng | null>(null);
  const [destCoords, setDestCoords] = useState<LatLng | null>(null);
  const [estimate, setEstimate] = useState<{
    estimated_price: string;
    distance_km: string;
    duration_minutes: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const initLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const loc = await Location.getCurrentPositionAsync({});
    const coords = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };
    setPickupCoords(coords);
    mapRef.current?.animateToRegion({
      ...coords,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  }, []);

  useEffect(() => {
    initLocation();
  }, [initLocation]);

  const defaultDest = pickupCoords
    ? { latitude: pickupCoords.latitude + 0.05, longitude: pickupCoords.longitude + 0.03 }
    : null;

  const onEstimate = async () => {
    if (!pickupCoords) {
      Alert.alert(t('error'), t('locationDenied', 'Enable location to continue'));
      return;
    }
    const dest = destCoords ?? defaultDest;
    if (!dest) return;
    setLoading(true);
    try {
      const result = await estimateRide({
        pickup_lat: pickupCoords.latitude,
        pickup_lng: pickupCoords.longitude,
        destination_lat: dest.latitude,
        destination_lng: dest.longitude,
        ride_type: rideType,
      });
      setEstimate(result);
      mapRef.current?.fitToCoordinates([pickupCoords, dest], {
        edgePadding: { top: 80, right: 40, bottom: 200, left: 40 },
        animated: true,
      });
    } catch {
      Alert.alert(t('error'), t('estimateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const onRequest = async () => {
    if (!token) {
      Alert.alert(t('loginRequired'), t('login'));
      return;
    }
    if (!pickupCoords) return;
    const dest = destCoords ?? defaultDest;
    if (!dest) return;
    setLoading(true);
    try {
      const ride = await requestRide(token, {
        pickup_address: pickup || 'Current location',
        destination_address: destination || 'Destination',
        pickup_lat: pickupCoords.latitude,
        pickup_lng: pickupCoords.longitude,
        destination_lat: dest.latitude,
        destination_lng: dest.longitude,
        ride_type: rideType,
        payment_method: 'cash',
      });
      navigation.navigate('RideTracking', { rideId: ride.id });
    } catch {
      Alert.alert(t('error'), t('bookingFailed'));
    } finally {
      setLoading(false);
    }
  };

  const region = pickupCoords
    ? { ...pickupCoords, latitudeDelta: 0.08, longitudeDelta: 0.08 }
    : { latitude: -26.2, longitude: 28.04, latitudeDelta: 0.2, longitudeDelta: 0.2 };

  return (
    <View style={tw`flex-1 bg-slate-900`}>
      <SafeMapView ref={mapRef} style={tw`absolute inset-0`} initialRegion={region} showsUserLocation>
        {pickupCoords && <Marker coordinate={pickupCoords} title="Pickup" pinColor="#22C55E" />}
        {(destCoords ?? defaultDest) && (
          <Marker coordinate={destCoords ?? defaultDest!} title="Destination" pinColor="#EF4444" />
        )}
      </SafeMapView>

      <SafeAreaView style={tw`flex-1`} pointerEvents="box-none">
        <TouchableOpacity onPress={() => navigation.goBack()} style={tw`m-4 w-10 h-10 bg-white rounded-full items-center justify-center shadow`}>
          <Feather name="arrow-left" size={20} color="#0F172A" />
        </TouchableOpacity>

        <View style={tw`mt-auto mx-4 mb-4 bg-white rounded-3xl p-4 shadow-lg`}>
          <Text style={tw`text-lg font-bold text-slate-900 mb-3`}>{t('ridesTitle')}</Text>
          <TextInput
            style={tw`bg-slate-100 rounded-xl px-4 py-3 mb-2 text-slate-900`}
            placeholder={t('pickupPlaceholder')}
            value={pickup}
            onChangeText={setPickup}
          />
          <TextInput
            style={tw`bg-slate-100 rounded-xl px-4 py-3 mb-3 text-slate-900`}
            placeholder={t('destinationPlaceholder')}
            value={destination}
            onChangeText={setDestination}
            onSubmitEditing={() => {
              if (defaultDest) setDestCoords(defaultDest);
            }}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`mb-3`}>
            {RIDE_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setRideType(type)}
                style={tw`mr-2 px-4 py-2 rounded-full ${rideType === type ? 'bg-blue-600' : 'bg-slate-200'}`}
              >
                <Text style={tw`${rideType === type ? 'text-white' : 'text-slate-700'} capitalize font-medium`}>{type}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {estimate && (
            <View style={tw`bg-blue-50 rounded-xl p-3 mb-3`}>
              <Text style={tw`text-slate-600 text-sm`}>
                {estimate.distance_km} km · {estimate.duration_minutes} min
              </Text>
              <Text style={tw`text-2xl font-bold text-slate-900`}>ZAR {estimate.estimated_price}</Text>
            </View>
          )}
          <TouchableOpacity style={tw`bg-slate-200 rounded-xl py-3 items-center mb-2`} onPress={onEstimate} disabled={loading}>
            {loading ? <ActivityIndicator /> : <Text style={tw`font-semibold text-slate-800`}>{t('seePrice')}</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={tw`bg-blue-600 rounded-xl py-4 items-center`} onPress={onRequest} disabled={loading}>
            <Text style={tw`text-white font-bold text-lg`}>{t('requestRide')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
