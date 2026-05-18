import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import tw from 'twrnc';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { fetchRide } from '../services/ridesApi';
import { useRideWebSocket } from '../hooks/useRideWebSocket';
import { useTranslation } from '../hooks/useTranslation';
import { RootStackParamList } from '../navigation/navigation';
import { baseAPI } from '../services/types';

type Route = RouteProp<RootStackParamList, 'RideTracking'>;

export default function RideTrackingScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { t } = useTranslation();
  const token = useSelector((s: RootState) => s.auth.token);
  const { ride, driverPosition, connected, setRide } = useRideWebSocket(route.params.rideId);

  useEffect(() => {
    if (!token) return;
    fetchRide(route.params.rideId, token)
      .then(setRide)
      .catch(() => undefined);
  }, [route.params.rideId, token, setRide]);

  const pickup = ride
    ? { latitude: Number(ride.pickup_lat), longitude: Number(ride.pickup_lng) }
    : null;
  const dest = ride
    ? { latitude: Number(ride.destination_lat), longitude: Number(ride.destination_lng) }
    : null;

  const shareTrip = () => {
    if (!ride?.share_trip_token) return;
    const link = `${baseAPI}/ride/share/${ride.share_trip_token}/`;
    Share.share({ message: `${t('shareTrip', 'Track my Kudya trip')}: ${link}` });
  };

  return (
    <View style={tw`flex-1`}>
      <MapView
        style={tw`absolute inset-0`}
        initialRegion={
          pickup
            ? { ...pickup, latitudeDelta: 0.06, longitudeDelta: 0.06 }
            : { latitude: -26.2, longitude: 28.04, latitudeDelta: 0.2, longitudeDelta: 0.2 }
        }
      >
        {pickup && <Marker coordinate={pickup} title="Pickup" pinColor="#22C55E" />}
        {dest && <Marker coordinate={dest} title="Destination" pinColor="#EF4444" />}
        {driverPosition && (
          <Marker coordinate={driverPosition} title={ride?.driver_name ?? 'Driver'} pinColor="#3B82F6" />
        )}
      </MapView>

      <SafeAreaView style={tw`flex-1`} pointerEvents="box-none">
        <TouchableOpacity onPress={() => navigation.goBack()} style={tw`m-4 w-10 h-10 bg-white rounded-full items-center justify-center`}>
          <Feather name="arrow-left" size={20} />
        </TouchableOpacity>

        <View style={tw`mt-auto mx-4 mb-4 bg-white rounded-3xl p-5 shadow-lg`}>
          {!ride ? (
            <ActivityIndicator />
          ) : (
            <>
              <View style={tw`flex-row justify-between items-center mb-2`}>
                <Text style={tw`text-blue-600 text-xs font-semibold`}>{ride.ride_number}</Text>
                <View style={tw`flex-row items-center`}>
                  <View style={tw`w-2 h-2 rounded-full mr-1 ${connected ? 'bg-green-500' : 'bg-slate-300'}`} />
                  <Text style={tw`text-xs text-slate-500`}>{connected ? 'Live' : 'Polling'}</Text>
                </View>
              </View>
              <Text style={tw`text-2xl font-bold capitalize text-slate-900`}>{ride.status.replace(/_/g, ' ')}</Text>
              {ride.driver_name && (
                <Text style={tw`text-slate-600 mt-2`}>{t('driver')}: {ride.driver_name}</Text>
              )}
              <Text style={tw`text-xl font-bold text-slate-900 mt-3`}>
                {ride.currency} {ride.final_price ?? ride.estimated_price}
              </Text>
              <TouchableOpacity style={tw`mt-4 flex-row items-center justify-center py-3 bg-slate-100 rounded-xl`} onPress={shareTrip}>
                <Feather name="share-2" size={18} color="#2563EB" />
                <Text style={tw`ml-2 text-blue-600 font-semibold`}>{t('shareTrip', 'Share trip')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
