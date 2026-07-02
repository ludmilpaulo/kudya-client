import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Linking,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Marker, Polyline } from 'react-native-maps';
import RideMapView from '../components/rides/RideMapView';
import tw from 'twrnc';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { fetchRide } from '../services/ridesApi';
import { useRideWebSocket } from '../hooks/useRideWebSocket';
import { useTranslation } from '../hooks/useTranslation';
import {
  useGetRideSearchStatusQuery,
  useAcceptDriverCounterOfferMutation,
  useRejectDriverCounterOfferMutation,
  useCancelRideMutation,
} from '../redux/api/ridesApi';
import { RootStackParamList } from '../navigation/navigation';
import { baseAPI } from '../services/types';
import RideChatModal from '../components/rides/RideChatModal';
import type { RideStop } from '../services/rides/types';

type Route = RouteProp<RootStackParamList, 'RideTracking'>;

const ACTIVE_STATUSES = new Set(['confirmed', 'accepted', 'arrived', 'in_progress']);

export default function RideTrackingScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { t } = useTranslation();
  const token = useSelector((s: RootState) => s.auth.token);
  const [chatVisible, setChatVisible] = useState(false);
  const {
    ride,
    searchStatus,
    driverPosition,
    connected,
    searchTimedOut,
    setRide,
    setSearchStatus,
  } = useRideWebSocket(route.params.rideId);

  const isSearching = ride?.status === 'searching';
  const hasCounterOffer = ride?.negotiation_status === 'driver_countered' && ride?.driver_counter_offer;
  const isActiveTrip = ride ? ACTIVE_STATUSES.has(ride.status) : false;
  const contact = ride?.driver_contact;

  const { data: searchPoll } = useGetRideSearchStatusQuery(route.params.rideId, {
    skip: !token || (!isSearching && !hasCounterOffer),
    pollingInterval: isSearching || hasCounterOffer ? 5000 : 0,
  });
  const [acceptCounter, { isLoading: acceptingCounter }] = useAcceptDriverCounterOfferMutation();
  const [rejectCounter, { isLoading: rejectingCounter }] = useRejectDriverCounterOfferMutation();
  const [cancelRide, { isLoading: cancelling }] = useCancelRideMutation();

  useEffect(() => {
    if (!token) return;
    fetchRide(route.params.rideId, token)
      .then(setRide)
      .catch(() => undefined);
  }, [route.params.rideId, token, setRide]);

  useEffect(() => {
    if (searchPoll?.search) {
      setSearchStatus(searchPoll.search);
    }
    if (searchPoll?.ride) {
      setRide(searchPoll.ride);
    }
  }, [searchPoll, setRide, setSearchStatus]);

  const pickup = ride
    ? { latitude: Number(ride.pickup_lat), longitude: Number(ride.pickup_lng) }
    : null;
  const dest = ride
    ? { latitude: Number(ride.destination_lat), longitude: Number(ride.destination_lng) }
    : null;

  const routeCoords = useMemo(() => {
    if (!pickup || !dest) return [];
    const points = [pickup];
    const sortedStops = [...(ride?.stops ?? [])].sort(
      (a: RideStop, b: RideStop) => a.sort_order - b.sort_order,
    );
    for (const stop of sortedStops) {
      points.push({ latitude: Number(stop.latitude), longitude: Number(stop.longitude) });
    }
    points.push(dest);
    return points;
  }, [pickup, dest, ride?.stops]);

  const activeSearch = searchStatus ?? searchPoll?.search ?? null;
  const radiusKm = activeSearch?.current_search_radius_km ?? ride?.current_search_radius_km;
  const ladder = activeSearch?.search_radius_ladder_km ?? [3, 5, 8, 12, 15];

  const displayPrice =
    ride?.agreed_price ?? ride?.final_price ?? ride?.customer_price_offer ?? ride?.estimated_price;

  const shareTrip = () => {
    if (!ride?.share_trip_token) return;
    const link = `${baseAPI}/ride/share/${ride.share_trip_token}/`;
    Share.share({ message: `${t('shareTrip', 'Track my Kudya trip')}: ${link}` });
  };

  const callDriver = () => {
    const phone = contact?.maskedPhoneNumber ?? ride?.driver_phone;
    if (!phone) return;
    Linking.openURL(`tel:${phone}`).catch(() => undefined);
  };

  const onCancelRide = () => {
    Alert.alert(
      t('ride.cancel_title', 'Cancel ride?'),
      t('ride.cancel_message', 'Your driver will be notified.'),
      [
        { text: t('ride.keep_ride', 'Keep ride'), style: 'cancel' },
        {
          text: t('ride.cancel_confirm', 'Cancel ride'),
          style: 'destructive',
          onPress: () => {
            void cancelRide({ rideId: route.params.rideId })
              .unwrap()
              .then((updated) => {
                setRide(updated);
                navigation.goBack();
              })
              .catch(() => Alert.alert(t('error', 'Error'), t('ride.cancel_failed', 'Could not cancel ride.')));
          },
        },
      ],
    );
  };

  const driverMarker =
    driverPosition ??
    (ride?.driver_lat && ride?.driver_lng
      ? { latitude: Number(ride.driver_lat), longitude: Number(ride.driver_lng) }
      : null);

  return (
    <View style={tw`flex-1`}>
      <SafeAreaView style={styles.topOverlay} pointerEvents="box-none">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={tw`m-4 w-10 h-10 bg-white rounded-full items-center justify-center`}
        >
          <Feather name="arrow-left" size={20} />
        </TouchableOpacity>

        <View style={tw`mt-auto mx-4 mb-4 bg-white rounded-3xl p-5 shadow-lg max-h-[62%] z-10`}>
          {!ride ? (
            <ActivityIndicator />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={tw`flex-row justify-between items-center mb-2`}>
                <Text style={tw`text-blue-600 text-xs font-semibold`}>{ride.ride_number}</Text>
                <View style={tw`flex-row items-center`}>
                  <View style={tw`w-2 h-2 rounded-full mr-1 ${connected ? 'bg-green-500' : 'bg-slate-300'}`} />
                  <Text style={tw`text-xs text-slate-500`}>
                    {connected ? t('ride.live_status', 'Live') : t('ride.polling_status', 'Polling')}
                  </Text>
                </View>
              </View>

              {hasCounterOffer ? (
                <View style={tw`mb-3 bg-amber-50 border border-amber-200 rounded-2xl p-4`}>
                  <Text style={tw`text-lg font-bold text-amber-900`}>
                    {t('ride.driver_counter_offer', 'Driver counter-offer')}
                  </Text>
                  <Text style={tw`text-2xl font-bold text-slate-900 mt-2`}>
                    {ride.currency} {ride.driver_counter_offer}
                  </Text>
                  <View style={tw`flex-row gap-2 mt-4`}>
                    <TouchableOpacity
                      style={tw`flex-1 bg-slate-200 rounded-xl py-3 items-center`}
                      disabled={rejectingCounter}
                      onPress={() => {
                        void rejectCounter(route.params.rideId)
                          .unwrap()
                          .then(setRide);
                      }}
                    >
                      <Text style={tw`font-bold text-slate-800`}>{t('ride.reject_counter', 'Reject')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={tw`flex-1 bg-blue-600 rounded-xl py-3 items-center`}
                      disabled={acceptingCounter}
                      onPress={() => {
                        void acceptCounter(route.params.rideId)
                          .unwrap()
                          .then(setRide);
                      }}
                    >
                      <Text style={tw`font-bold text-white`}>{t('ride.accept_counter', 'Accept')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}

              {isSearching ? (
                <View style={tw`mb-3`}>
                  <View style={tw`flex-row items-center mb-2`}>
                    <ActivityIndicator size="small" color="#2563EB" />
                    <Text style={tw`ml-2 text-lg font-bold text-slate-900`}>
                      {t('ride.searching_driver', 'Searching for a driver...')}
                    </Text>
                  </View>
                  <Text style={tw`text-slate-600`}>
                    {t('ride.searching_within', 'Searching within {radius} km', {
                      radius: radiusKm ?? ladder[0],
                    })}
                  </Text>
                </View>
              ) : (
                <Text style={tw`text-xl font-bold capitalize text-slate-900`}>
                  {t(`ride.status.${ride.status}`, ride.status.replace(/_/g, ' '))}
                </Text>
              )}

              {isActiveTrip && (contact || ride.driver_name) ? (
                <View style={tw`mt-3 p-3 bg-slate-50 rounded-2xl`}>
                  <View style={tw`flex-row items-center`}>
                    {contact?.driverAvatarUrl || ride.driver_avatar_url ? (
                      <Image
                        source={{ uri: contact?.driverAvatarUrl ?? ride.driver_avatar_url ?? undefined }}
                        style={tw`w-12 h-12 rounded-full mr-3`}
                      />
                    ) : (
                      <View style={tw`w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-3`}>
                        <Feather name="user" size={22} color="#2563EB" />
                      </View>
                    )}
                    <View style={tw`flex-1`}>
                      <Text style={tw`font-bold text-slate-900`}>
                        {contact?.driverName ?? ride.driver_name}
                      </Text>
                      <Text style={tw`text-xs text-slate-500`}>
                        ★ {(contact?.driverRating ?? ride.driver_rating ?? 0).toFixed(1)} ·{' '}
                        {contact?.vehicleModel ?? t('ride.vehicle', 'Vehicle')}
                        {contact?.vehicleColor ? ` · ${contact.vehicleColor}` : ''}
                      </Text>
                      {contact?.vehiclePlateNumber ? (
                        <Text style={tw`text-xs font-semibold text-slate-700 mt-0.5`}>
                          {contact.vehiclePlateNumber}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              ) : ride.driver_name ? (
                <Text style={tw`text-slate-600 mt-2`}>{t('driver')}: {ride.driver_name}</Text>
              ) : null}

              <Text style={tw`text-xl font-bold text-slate-900 mt-3`}>
                {ride.currency} {displayPrice}
              </Text>

              <View style={tw`mt-3 gap-2`}>
                <Text style={tw`text-xs text-emerald-700`}>● {ride.pickup_address}</Text>
                {(ride.stops ?? [])
                  .slice()
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((stop, index) => (
                    <Text key={stop.id} style={tw`text-xs text-amber-700`}>
                      ● {t('ride.stop_label', 'Stop')} {index + 1}: {stop.address}
                    </Text>
                  ))}
                <Text style={tw`text-xs text-red-700`}>● {ride.destination_address}</Text>
              </View>

              {ride.duration_minutes ? (
                <Text style={tw`text-sm text-slate-500 mt-2`}>
                  {ride.duration_minutes} min · {Number(ride.distance_km ?? 0).toFixed(1)} km
                </Text>
              ) : null}

              {isActiveTrip ? (
                <View style={tw`flex-row flex-wrap gap-2 mt-4`}>
                  {(contact?.canChat ?? isActiveTrip) && ride.driver_name ? (
                    <TouchableOpacity
                      style={tw`flex-1 min-w-[30%] flex-row items-center justify-center py-3 bg-blue-50 rounded-xl`}
                      onPress={() => setChatVisible(true)}
                    >
                      <Feather name="message-circle" size={18} color="#2563EB" />
                      <Text style={tw`ml-2 text-blue-700 font-semibold`}>{t('ride.chat', 'Chat')}</Text>
                    </TouchableOpacity>
                  ) : null}
                  {(contact?.canCall ?? Boolean(ride.driver_phone)) ? (
                    <TouchableOpacity
                      style={tw`flex-1 min-w-[30%] flex-row items-center justify-center py-3 bg-emerald-50 rounded-xl`}
                      onPress={callDriver}
                    >
                      <Feather name="phone" size={18} color="#059669" />
                      <Text style={tw`ml-2 text-emerald-700 font-semibold`}>{t('ride.call', 'Call')}</Text>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity
                    style={tw`flex-1 min-w-[30%] flex-row items-center justify-center py-3 bg-slate-100 rounded-xl`}
                    onPress={shareTrip}
                  >
                    <Feather name="share-2" size={18} color="#2563EB" />
                    <Text style={tw`ml-2 text-blue-600 font-semibold`}>{t('shareTrip', 'Share')}</Text>
                  </TouchableOpacity>
                </View>
              ) : !isSearching ? (
                <TouchableOpacity
                  style={tw`mt-4 flex-row items-center justify-center py-3 bg-slate-100 rounded-xl`}
                  onPress={shareTrip}
                >
                  <Feather name="share-2" size={18} color="#2563EB" />
                  <Text style={tw`ml-2 text-blue-600 font-semibold`}>{t('shareTrip', 'Share trip')}</Text>
                </TouchableOpacity>
              ) : null}

              {isActiveTrip && ride.status !== 'completed' ? (
                <TouchableOpacity
                  style={tw`mt-3 py-3 items-center rounded-xl border border-red-200`}
                  disabled={cancelling}
                  onPress={onCancelRide}
                >
                  <Text style={tw`text-red-600 font-semibold`}>
                    {t('ride.cancel_ride', 'Cancel ride')}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>

      {ride && (
        <RideChatModal
          visible={chatVisible}
          rideId={ride.id}
          driverName={contact?.driverName ?? ride.driver_name ?? t('driver', 'Driver')}
          onClose={() => setChatVisible(false)}
        />
      )}

      <RideMapView
        key={pickup ? `${pickup.latitude},${pickup.longitude}` : 'default'}
        initialRegion={
          pickup
            ? { ...pickup, latitudeDelta: 0.06, longitudeDelta: 0.06 }
            : { latitude: -26.2, longitude: 28.04, latitudeDelta: 0.2, longitudeDelta: 0.2 }
        }
        showsUserLocation
        loadingEnabled
      >
        {routeCoords.length > 1 && (
          <Polyline coordinates={routeCoords} strokeColor="#2563EB" strokeWidth={4} />
        )}
        {pickup && <Marker coordinate={pickup} title={t('pickup', 'Pickup')} pinColor="#22C55E" />}
        {(ride?.stops ?? [])
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((stop, index) => (
            <Marker
              key={stop.id}
              coordinate={{ latitude: Number(stop.latitude), longitude: Number(stop.longitude) }}
              title={`${t('ride.stop_label', 'Stop')} ${index + 1}`}
              pinColor="#F59E0B"
            />
          ))}
        {dest && <Marker coordinate={dest} title={t('destination', 'Destination')} pinColor="#EF4444" />}
        {driverMarker && (
          <Marker
            coordinate={driverMarker}
            title={ride?.driver_name ?? t('driver', 'Driver')}
            pinColor="#3B82F6"
          />
        )}
      </RideMapView>
    </View>
  );
}

const styles = StyleSheet.create({
  topOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
});
