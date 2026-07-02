import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  useColorScheme,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import RideMapView from '../components/rides/RideMapView';
import * as Location from 'expo-location';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { RootStackParamList } from '../navigation/navigation';
import { useTranslation } from '../hooks/useTranslation';
import { useRideCountryCode } from '../hooks/useRideCountryCode';
import {
  useGetRideCategoriesQuery,
  useEstimateRidePriceMutation,
  useGetNearbyDriversMutation,
  useRequestRideMutation,
} from '../redux/api/ridesApi';
import type { RideCategory, RideStopDraft } from '../services/rides/types';
import { geocodeAddress, reverseGeocodeLabel } from '../utils/getCoordsFromLocationOrAddress';
import { fetchUserDetails } from '../services/checkoutService';
import { baseAPI } from '../services/types';
import RideRequestSheet from '../components/rides/RideRequestSheet';
import type { SelectedPlace } from '../components/rides/LocationAutocomplete';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface LatLng {
  latitude: number;
  longitude: number;
}

const DEFAULT_REGION: Region = {
  latitude: 20,
  longitude: 0,
  latitudeDelta: 100,
  longitudeDelta: 100,
};

function createStopId() {
  return `stop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function RidesScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const token = useSelector((s: RootState) => s.auth.token);
  const user = useSelector((s: RootState) => s.auth.user);
  const mapRef = useRef<MapView | null>(null);

  const [locationState, setLocationState] = useState<'loading' | 'ready' | 'denied'>('loading');
  const [userAvatarUri, setUserAvatarUri] = useState<string | null>(null);
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupCoords, setPickupCoords] = useState<LatLng | null>(null);
  const [destCoords, setDestCoords] = useState<LatLng | null>(null);
  const [stops, setStops] = useState<RideStopDraft[]>([]);
  const [usePriceOffer, setUsePriceOffer] = useState(false);
  const [priceOffer, setPriceOffer] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RideCategory | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [geocodingDestination, setGeocodingDestination] = useState(false);
  const [geocodingPickup, setGeocodingPickup] = useState(false);
  const [pickupMode, setPickupMode] = useState<'gps' | 'manual'>('gps');
  const [pickupMapSelectActive, setPickupMapSelectActive] = useState(false);
  const [quotePickupCoords, setQuotePickupCoords] = useState<LatLng | null>(null);
  const destinationGeocodeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pickupGeocodeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pickupQuoteDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pickupReverseDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { countryCode } = useRideCountryCode(quotePickupCoords ?? pickupCoords);

  const geocodeNear = useCallback(
    (coords?: LatLng | null) =>
      coords ? { lat: coords.latitude, lng: coords.longitude } : undefined,
    [],
  );

  const { data: categories = [] } = useGetRideCategoriesQuery(countryCode);
  const [estimatePrice, { data: estimate, isLoading: estimateLoading, reset: resetEstimate }] =
    useEstimateRidePriceMutation();
  const [fetchNearby, { data: nearby, isLoading: driversLoading, reset: resetNearby }] =
    useGetNearbyDriversMutation();
  const [requestRide, { isLoading: requestLoading }] = useRequestRideMutation();

  const resolvedStops = useMemo(
    () => stops.filter((stop) => stop.latitude != null && stop.longitude != null),
    [stops],
  );

  const stopCoordsKey = resolvedStops
    .map((stop) => `${stop.latitude},${stop.longitude}`)
    .join('|');

  useEffect(() => {
    if (!categories.length) return;
    setSelectedCategory((prev) => {
      if (prev && categories.some((cat) => cat.id === prev.id)) return prev;
      return categories[0];
    });
  }, [categories, countryCode]);

  const applyPickupCoords = useCallback((coords: LatLng, mode: 'gps' | 'manual' = 'gps') => {
    setPickupCoords(coords);
    setPickupMode(mode);
    if (pickupQuoteDebounceRef.current) {
      clearTimeout(pickupQuoteDebounceRef.current);
    }
    if (mode === 'gps') {
      pickupQuoteDebounceRef.current = setTimeout(() => {
        setQuotePickupCoords(coords);
      }, 600);
    } else {
      setQuotePickupCoords(coords);
    }
  }, []);

  const syncPickupLabelFromCoords = useCallback(
    async (coords: LatLng) => {
      const label = await reverseGeocodeLabel(coords.latitude, coords.longitude);
      if (label) {
        setPickup(label);
        return label;
      }
      const fallback = t('ride.current_location', 'Current location');
      setPickup(fallback);
      return fallback;
    },
    [t],
  );

  const initLocation = useCallback(async () => {
    setLocationState('loading');
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationState('denied');
      return;
    }
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
        mayShowUserSettingsDialog: true,
      });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      applyPickupCoords(coords, 'gps');
      setLocationState('ready');
      await syncPickupLabelFromCoords(coords);

      mapRef.current?.animateToRegion({
        ...coords,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      });
    } catch {
      setLocationState('denied');
    }
  }, [applyPickupCoords, syncPickupLabelFromCoords]);

  useEffect(() => {
    if (locationState !== 'ready') return;
    let subscription: Location.LocationSubscription | null = null;
    void Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Highest,
        distanceInterval: 5,
        timeInterval: 3000,
      },
      (loc) => {
        const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        if (pickupMode !== 'gps') return;
        applyPickupCoords(coords, 'gps');
        if (pickupReverseDebounceRef.current) {
          clearTimeout(pickupReverseDebounceRef.current);
        }
        pickupReverseDebounceRef.current = setTimeout(() => {
          void syncPickupLabelFromCoords(coords);
        }, 1500);
      },
    ).then((sub) => {
      subscription = sub;
    });
    return () => {
      subscription?.remove();
      if (pickupQuoteDebounceRef.current) clearTimeout(pickupQuoteDebounceRef.current);
      if (pickupReverseDebounceRef.current) clearTimeout(pickupReverseDebounceRef.current);
    };
  }, [locationState, pickupMode, applyPickupCoords, syncPickupLabelFromCoords]);

  useEffect(() => {
    if (!user?.user_id || !user?.token) {
      setUserAvatarUri(null);
      return;
    }
    fetchUserDetails(user.user_id, user.token)
      .then((details) => {
        if (details?.avatar) setUserAvatarUri(`${baseAPI}${details.avatar}`);
      })
      .catch(() => setUserAvatarUri(null));
  }, [user?.user_id, user?.token]);

  useEffect(() => {
    initLocation();
  }, [initLocation]);

  const refreshQuote = useCallback(async () => {
    if (!quotePickupCoords || !destCoords || !selectedCategory) return;
    setValidationMessage(null);
    resetEstimate();
    resetNearby();

    try {
      await estimatePrice({
        pickup_latitude: quotePickupCoords.latitude,
        pickup_longitude: quotePickupCoords.longitude,
        destination_latitude: destCoords.latitude,
        destination_longitude: destCoords.longitude,
        ride_category_id: selectedCategory.id,
        country_code: countryCode,
        stops: resolvedStops.map((stop) => ({
          latitude: stop.latitude as number,
          longitude: stop.longitude as number,
        })),
      }).unwrap();

      void fetchNearby({
        pickup_latitude: quotePickupCoords.latitude,
        pickup_longitude: quotePickupCoords.longitude,
        ride_category_id: selectedCategory.id,
        country_code: countryCode,
      });

      const mapPoints = [
        quotePickupCoords,
        ...resolvedStops.map((stop) => ({
          latitude: stop.latitude as number,
          longitude: stop.longitude as number,
        })),
        destCoords,
      ];
      mapRef.current?.fitToCoordinates(mapPoints, {
        edgePadding: { top: 100, right: 48, bottom: 360, left: 48 },
        animated: true,
      });
    } catch {
      setValidationMessage(t('ride.estimate_error', 'Something went wrong. Please try again.'));
    }
  }, [
    quotePickupCoords,
    destCoords,
    selectedCategory,
    resolvedStops,
    estimatePrice,
    fetchNearby,
    resetEstimate,
    resetNearby,
    countryCode,
    t,
  ]);

  useEffect(() => {
    if (quotePickupCoords && destCoords && selectedCategory) {
      void refreshQuote();
    }
  }, [quotePickupCoords, destCoords, selectedCategory?.id, stopCoordsKey, countryCode, refreshQuote]);

  const resolvePickup = useCallback(
    async (address: string) => {
      const trimmed = address.trim();
      if (!trimmed) {
        setValidationMessage(t('ride.pickup_placeholder', 'Pickup location'));
        return false;
      }
      setGeocodingPickup(true);
      setValidationMessage(null);
      const coords = await geocodeAddress(trimmed, { near: geocodeNear(pickupCoords) });
      setGeocodingPickup(false);
      if (!coords) {
        setValidationMessage(t('ride.destination_not_found', 'Could not find that destination.'));
        return false;
      }
      const next = { latitude: coords.lat, longitude: coords.lng };
      applyPickupCoords(next, 'manual');
      setPickup(trimmed);
      setValidationMessage(null);
      mapRef.current?.animateToRegion({
        ...next,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      return true;
    },
    [applyPickupCoords, geocodeNear, pickupCoords, t],
  );

  const onPickupSubmit = async () => {
    await resolvePickup(pickup);
  };

  const onPickupChange = (value: string) => {
    setPickup(value);
    setPickupMode('manual');
    setPickupMapSelectActive(false);
    setQuotePickupCoords(null);
  };

  const applyPickupPlace = useCallback(
    (place: SelectedPlace) => {
      if (pickupGeocodeRef.current) clearTimeout(pickupGeocodeRef.current);
      setPickupMapSelectActive(false);
      applyPickupCoords({ latitude: place.latitude, longitude: place.longitude }, 'manual');
      setPickup(place.description);
      setValidationMessage(null);
      mapRef.current?.animateToRegion({
        latitude: place.latitude,
        longitude: place.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    },
    [applyPickupCoords],
  );

  const applyDestinationPlace = useCallback((place: SelectedPlace) => {
    if (destinationGeocodeRef.current) clearTimeout(destinationGeocodeRef.current);
    setDestCoords({ latitude: place.latitude, longitude: place.longitude });
    setDestination(place.description);
    setValidationMessage(null);
  }, []);

  const onUseCurrentLocation = async () => {
    setPickupMapSelectActive(false);
    setPickupMode('gps');
    setValidationMessage(null);
    await initLocation();
  };

  const onMapPress = useCallback(
    async (event: { nativeEvent: { coordinate: LatLng } }) => {
      if (!pickupMapSelectActive) return;
      const coords = {
        latitude: event.nativeEvent.coordinate.latitude,
        longitude: event.nativeEvent.coordinate.longitude,
      };
      setPickupMapSelectActive(false);
      applyPickupCoords(coords, 'manual');
      await syncPickupLabelFromCoords(coords);
      setValidationMessage(null);
    },
    [pickupMapSelectActive, applyPickupCoords, syncPickupLabelFromCoords],
  );

  useEffect(() => {
    if (pickupMode !== 'manual') return;
    if (pickupGeocodeRef.current) {
      clearTimeout(pickupGeocodeRef.current);
    }
    if (!pickup.trim()) {
      setQuotePickupCoords(null);
      return;
    }
    setQuotePickupCoords(null);
    pickupGeocodeRef.current = setTimeout(() => {
      void resolvePickup(pickup);
    }, 1400);
    return () => {
      if (pickupGeocodeRef.current) {
        clearTimeout(pickupGeocodeRef.current);
      }
    };
  }, [pickup, pickupMode, resolvePickup]);

  const resolveDestination = useCallback(
    async (address: string) => {
      const trimmed = address.trim();
      if (!trimmed) {
        setDestCoords(null);
        setValidationMessage(t('ride.enter_destination', 'Please enter your destination first.'));
        return false;
      }
      setGeocodingDestination(true);
      setValidationMessage(null);
      const coords = await geocodeAddress(trimmed, {
        near: geocodeNear(quotePickupCoords ?? pickupCoords),
      });
      setGeocodingDestination(false);
      if (!coords) {
        setDestCoords(null);
        setValidationMessage(t('ride.destination_not_found', 'Could not find that destination.'));
        return false;
      }
      setDestCoords({ latitude: coords.lat, longitude: coords.lng });
      setValidationMessage(null);
      return true;
    },
    [geocodeNear, pickupCoords, quotePickupCoords, t],
  );

  const onDestinationSubmit = async () => {
    await resolveDestination(destination);
  };

  useEffect(() => {
    if (destinationGeocodeRef.current) {
      clearTimeout(destinationGeocodeRef.current);
    }
    if (!destination.trim()) {
      setDestCoords(null);
      resetEstimate();
      resetNearby();
      return;
    }
    setDestCoords(null);
    resetEstimate();
    resetNearby();
    destinationGeocodeRef.current = setTimeout(() => {
      void resolveDestination(destination);
    }, 1400);
    return () => {
      if (destinationGeocodeRef.current) {
        clearTimeout(destinationGeocodeRef.current);
      }
    };
  }, [destination, resolveDestination, resetEstimate, resetNearby]);

  const maxStopsAllowed = estimate?.max_stops_allowed ?? 3;

  const onAddStop = () => {
    if (stops.length >= maxStopsAllowed) {
      setValidationMessage(
        t('ride.max_stops_reached', 'Maximum {count} stops allowed.', { count: maxStopsAllowed }),
      );
      return;
    }
    setStops((prev) => [...prev, { id: createStopId(), address: '', latitude: null, longitude: null }]);
  };

  const onRemoveStop = (id: string) => {
    setStops((prev) => prev.filter((stop) => stop.id !== id));
  };

  const onStopChange = (id: string, address: string) => {
    setStops((prev) =>
      prev.map((stop) =>
        stop.id === id ? { ...stop, address, latitude: null, longitude: null } : stop,
      ),
    );
  };

  const onStopSubmit = async (id: string) => {
    const stop = stops.find((item) => item.id === id);
    if (!stop?.address.trim()) {
      setValidationMessage(t('ride.enter_stop', 'Please enter a stop address.'));
      return;
    }
    const coords = await geocodeAddress(stop.address.trim(), {
      near: geocodeNear(quotePickupCoords ?? pickupCoords),
    });
    if (!coords) {
      setValidationMessage(t('ride.stop_not_found', 'Could not find that stop.'));
      return;
    }
    setStops((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, latitude: coords.lat, longitude: coords.lng }
          : item,
      ),
    );
    setValidationMessage(null);
  };

  const pendingStopCount = stops.filter(
    (stop) => stop.address.trim() && (stop.latitude == null || stop.longitude == null),
  ).length;

  const parsedOffer = parseFloat(priceOffer.replace(',', '.'));
  const minOfferAmount = estimate
    ? Math.max(
        estimate.minimum_offer ?? 0,
        estimate.minimum_fare,
        (estimate.default_fare ?? estimate.estimated_min_price) * 0.9,
      )
    : 0;
  const offerValid =
    !usePriceOffer ||
    (Number.isFinite(parsedOffer) && estimate != null && parsedOffer >= minOfferAmount);

  const onTogglePriceOffer = (value: boolean) => {
    setUsePriceOffer(value);
    if (value && estimate && !priceOffer.trim()) {
      const suggested = Math.ceil(
        Math.max(minOfferAmount, estimate.default_fare ?? estimate.estimated_min_price),
      );
      setPriceOffer(String(suggested));
    }
  };

  const pickupConfirmed = Boolean(
    quotePickupCoords &&
    !geocodingPickup &&
    (pickupMode === 'gps' || pickup.trim().length > 0),
  );

  const canRequest = Boolean(
    token &&
      quotePickupCoords &&
      pickupConfirmed &&
      destCoords &&
      selectedCategory &&
      estimate &&
      !estimateLoading &&
      !geocodingDestination &&
      !geocodingPickup &&
      pendingStopCount === 0 &&
      offerValid,
  );

  const requestBlockReason = useMemo(() => {
    if (!token) return t('ride.login_to_request', 'Sign in to request a ride');
    if (!quotePickupCoords) return t('ride.enable_location', 'Tap to enable location');
    if (geocodingPickup) return t('ride.geocoding_pickup', 'Finding pickup address…');
    if (!pickup.trim()) return t('ride.pickup_hint', 'We use your GPS pin for pickup. Edit the address or tap Confirm pickup.');
    if (!destination.trim()) return t('ride.enter_destination', 'Please enter your destination first.');
    if (geocodingDestination) return t('ride.geocoding_destination', 'Finding destination…');
    if (!destCoords) return t('ride.destination_hint', 'Press search on the keyboard or tap Confirm so we can calculate your fare.');
    if (estimateLoading) return t('ride.calculating_fare', 'Calculating fare...');
    if (!estimate) return t('ride.estimate_error', 'Something went wrong. Please try again.');
    if (pendingStopCount > 0) {
      return t('ride.confirm_stops', 'Confirm each stop by pressing search on the keyboard.');
    }
    if (usePriceOffer && !offerValid) {
      return t('ride.enter_offer_amount', 'Enter your offer (min. {min})', {
        min: minOfferAmount.toFixed(0),
      });
    }
    return null;
  }, [
    token,
    quotePickupCoords,
    pickup,
    geocodingPickup,
    destination,
    geocodingDestination,
    destCoords,
    estimateLoading,
    estimate,
    pendingStopCount,
    usePriceOffer,
    offerValid,
    minOfferAmount,
    t,
  ]);

  const onRequest = async () => {
    if (!token) {
      Alert.alert(t('loginRequired', 'Login required'), t('login', 'Login'));
      navigation.navigate('UserLogin');
      return;
    }
    if (!quotePickupCoords || !destCoords || !selectedCategory) {
      setValidationMessage(t('ride.missing_locations', 'Please set pickup and destination.'));
      return;
    }
    if (pendingStopCount > 0) {
      setValidationMessage(t('ride.confirm_stops', 'Confirm each stop by pressing search on the keyboard.'));
      return;
    }
    if (usePriceOffer && !offerValid) {
      setValidationMessage(
        t('ride.minimum_offer_hint', 'At least 90% of the estimated fare ({min})', {
          min: minOfferAmount.toFixed(2),
        }),
      );
      return;
    }

    let finalPickup = quotePickupCoords;
    let finalPickupAddress = pickup.trim();
    let finalDest = destCoords;
    let finalDestAddress = destination.trim();

    try {
      if (pickupMode === 'gps') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
          mayShowUserSettingsDialog: true,
        });
        finalPickup = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        const label = await reverseGeocodeLabel(finalPickup.latitude, finalPickup.longitude);
        finalPickupAddress = label || finalPickupAddress || t('ride.current_location', 'Current location');
      } else {
        const coords = await geocodeAddress(finalPickupAddress, {
          near: geocodeNear(finalPickup),
        });
        if (!coords) {
          setValidationMessage(t('ride.destination_not_found', 'Could not find that destination.'));
          return;
        }
        finalPickup = { latitude: coords.lat, longitude: coords.lng };
      }

      const destResolved = await geocodeAddress(finalDestAddress, {
        near: geocodeNear(finalPickup),
      });
      if (!destResolved) {
        setValidationMessage(t('ride.destination_not_found', 'Could not find that destination.'));
        return;
      }
      finalDest = { latitude: destResolved.lat, longitude: destResolved.lng };

      const ride = await requestRide({
        pickup_address: finalPickupAddress,
        pickup_lat: finalPickup.latitude,
        pickup_lng: finalPickup.longitude,
        destination_address: finalDestAddress,
        destination_lat: finalDest.latitude,
        destination_lng: finalDest.longitude,
        ride_type: selectedCategory.slug,
        payment_method: 'cash',
        country_code: countryCode,
        customer_price_offer: usePriceOffer ? parsedOffer : undefined,
        stops: resolvedStops.map((stop, index) => ({
          address: stop.address,
          latitude: stop.latitude as number,
          longitude: stop.longitude as number,
          sort_order: index,
        })),
      }).unwrap();

      Alert.alert(
        t('ride.request_sent_title', 'Ride request sent'),
        usePriceOffer
          ? t('ride.offer_sent_body', 'Your fare offer was sent to nearby drivers.')
          : t('ride.request_sent_body', 'Waiting for a driver to accept...'),
      );
      navigation.navigate('RideTracking', { rideId: ride.id });
    } catch (err: unknown) {
      const msg =
        (err as { data?: { customer_price_offer?: string[]; detail?: string } })?.data
          ?.customer_price_offer?.[0] ??
        (err as { data?: { detail?: string } })?.data?.detail;
      Alert.alert(t('error', 'Error'), msg ?? t('rideBookingFailed', 'Could not request ride'));
    }
  };

  const routeCoords = useMemo(() => {
    if (!pickupCoords || !destCoords) return [] as LatLng[];
    return [
      pickupCoords,
      ...resolvedStops.map((stop) => ({
        latitude: stop.latitude as number,
        longitude: stop.longitude as number,
      })),
      destCoords,
    ];
  }, [pickupCoords, destCoords, resolvedStops]);

  const mapRegion = pickupCoords
    ? { ...pickupCoords, latitudeDelta: 0.08, longitudeDelta: 0.08 }
    : DEFAULT_REGION;

  return (
    <View style={tw`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
      <LinearGradient
        colors={['transparent', isDark ? 'rgba(15,23,42,0.4)' : 'rgba(248,250,252,0.85)']}
        style={[styles.bottomFade, { zIndex: 1 }]}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.topOverlay} pointerEvents="box-none">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={tw`m-4 w-11 h-11 rounded-full items-center justify-center ${
            isDark ? 'bg-slate-900/95' : 'bg-white'
          }`}
          activeOpacity={0.85}
        >
          <Feather name="arrow-left" size={22} color={isDark ? '#F8FAFC' : '#0F172A'} />
        </TouchableOpacity>

        {locationState === 'loading' && (
          <View
            style={tw`mx-4 mt-2 self-start rounded-2xl px-4 py-2.5 flex-row items-center ${
              isDark ? 'bg-slate-900/95' : 'bg-white/95'
            }`}
          >
            <ActivityIndicator size="small" color="#2563EB" />
            <Text style={tw`ml-2 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {t('ride.locating', 'Finding your location...')}
            </Text>
          </View>
        )}

        {locationState === 'denied' && (
          <TouchableOpacity
            onPress={initLocation}
            style={tw`mx-4 mt-2 self-start rounded-2xl px-4 py-2.5 flex-row items-center ${
              isDark ? 'bg-amber-900/80' : 'bg-amber-50 border border-amber-200'
            }`}
          >
            <Feather name="map-pin" size={16} color="#D97706" />
            <Text style={tw`ml-2 text-sm font-medium text-amber-700`}>
              {t('ride.enable_location', 'Tap to enable location')}
            </Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>

      <RideRequestSheet
        pickup={pickup}
        destination={destination}
        onPickupChange={onPickupChange}
        onPickupSelectPlace={applyPickupPlace}
        onPickupSubmit={onPickupSubmit}
        pickupConfirmed={pickupConfirmed}
        geocodingPickup={geocodingPickup}
        onConfirmPickup={onPickupSubmit}
        onUseCurrentLocation={onUseCurrentLocation}
        onSetPickupOnMap={() => setPickupMapSelectActive((v) => !v)}
        pickupMapSelectActive={pickupMapSelectActive}
        pickupUsesGps={pickupMode === 'gps'}
        locationBias={quotePickupCoords ?? pickupCoords}
        onDestinationChange={setDestination}
        onDestinationSelectPlace={applyDestinationPlace}
        onDestinationSubmit={onDestinationSubmit}
        stops={stops}
        onAddStop={onAddStop}
        onRemoveStop={onRemoveStop}
        onStopChange={onStopChange}
        onStopSubmit={onStopSubmit}
        usePriceOffer={usePriceOffer}
        onTogglePriceOffer={onTogglePriceOffer}
        priceOffer={priceOffer}
        onPriceOfferChange={setPriceOffer}
        destinationConfirmed={Boolean(destCoords)}
        geocodingDestination={geocodingDestination}
        onConfirmDestination={onDestinationSubmit}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        estimate={estimate ?? null}
        nearby={nearby ?? null}
        estimateLoading={estimateLoading}
        driversLoading={driversLoading}
        requestLoading={requestLoading}
        canRequest={canRequest}
        requestBlockReason={requestBlockReason}
        validationMessage={validationMessage}
        maxStopsAllowed={maxStopsAllowed}
        minOfferAmount={minOfferAmount}
        onRequest={onRequest}
        isDark={isDark}
        t={t}
      />

      <RideMapView
        key={pickupCoords ? 'located' : 'default'}
        ref={mapRef}
        initialRegion={mapRegion}
        showsUserLocation
        showsMyLocationButton={false}
        loadingEnabled
        onPress={onMapPress}
      >
        {pickupCoords && (
          <Marker coordinate={pickupCoords} anchor={{ x: 0.5, y: 0.5 }} title={t('pickup', 'Pickup')}>
            <View style={tw`items-center`}>
              {userAvatarUri ? (
                <View style={tw`rounded-full border-2 border-emerald-500 p-0.5 bg-white shadow-lg`}>
                  <Image source={{ uri: userAvatarUri }} style={tw`w-11 h-11 rounded-full`} />
                </View>
              ) : (
                <View style={tw`w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow-md`} />
              )}
              <View style={tw`w-3 h-3 rounded-full bg-emerald-500/40 -mt-1`} />
            </View>
          </Marker>
        )}
        {resolvedStops.map((stop, index) => (
          <Marker
            key={stop.id}
            coordinate={{
              latitude: stop.latitude as number,
              longitude: stop.longitude as number,
            }}
            title={t('ride.stop_label', 'Stop {n}', { n: index + 1 })}
          >
            <View style={tw`w-7 h-7 rounded-full bg-amber-500 border-2 border-white items-center justify-center shadow-md`}>
              <Text style={tw`text-white text-xs font-bold`}>{index + 1}</Text>
            </View>
          </Marker>
        ))}
        {destCoords && (
          <Marker coordinate={destCoords} title={t('destination', 'Destination')}>
            <View style={tw`items-center`}>
              <View style={tw`w-6 h-6 rounded-lg bg-red-500 items-center justify-center border-2 border-white shadow-md`}>
                <Feather name="map-pin" size={12} color="#fff" />
              </View>
            </View>
          </Marker>
        )}
        {routeCoords.length >= 2 && (
          <Polyline coordinates={routeCoords} strokeColor="#2563EB" strokeWidth={5} />
        )}
      </RideMapView>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 192,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
});
