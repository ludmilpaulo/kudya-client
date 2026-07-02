import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import tw from 'twrnc';
import RideCategorySelector from './RideCategorySelector';
import LocationAutocomplete, { type SelectedPlace } from './LocationAutocomplete';
import { formatCurrency } from '../../utils/currency';
import type {
  NearbyDriverResponse,
  RideCategory,
  RidePriceEstimate,
  RideStopDraft,
} from '../../services/rides/types';

type TranslateFn = (key: string, fallback?: string, params?: Record<string, string | number>) => string;

const DEFAULT_MAX_STOPS = 3;

type Props = {
  pickup: string;
  destination: string;
  onPickupChange: (value: string) => void;
  onPickupSelectPlace?: (place: SelectedPlace) => void;
  onPickupSubmit?: () => void;
  pickupConfirmed?: boolean;
  geocodingPickup?: boolean;
  onConfirmPickup?: () => void;
  onUseCurrentLocation?: () => void;
  onSetPickupOnMap?: () => void;
  pickupMapSelectActive?: boolean;
  pickupUsesGps?: boolean;
  locationBias?: { latitude: number; longitude: number } | null;
  onDestinationChange: (value: string) => void;
  onDestinationSelectPlace?: (place: SelectedPlace) => void;
  onDestinationSubmit: () => void;
  destinationConfirmed?: boolean;
  geocodingDestination?: boolean;
  onConfirmDestination?: () => void;
  stops: RideStopDraft[];
  onAddStop: () => void;
  onRemoveStop: (id: string) => void;
  onStopChange: (id: string, address: string) => void;
  onStopSubmit: (id: string) => void;
  usePriceOffer: boolean;
  onTogglePriceOffer: (value: boolean) => void;
  priceOffer: string;
  onPriceOfferChange: (value: string) => void;
  categories: RideCategory[];
  selectedCategory: RideCategory | null;
  onSelectCategory: (category: RideCategory) => void;
  estimate: RidePriceEstimate | null;
  nearby: NearbyDriverResponse | null;
  estimateLoading: boolean;
  driversLoading: boolean;
  requestLoading: boolean;
  canRequest: boolean;
  requestBlockReason?: string | null;
  validationMessage: string | null;
  maxStopsAllowed?: number;
  minOfferAmount?: number;
  onRequest: () => void;
  isDark: boolean;
  t: TranslateFn;
};

function LocationField({
  icon,
  iconBg,
  value,
  onChangeText,
  onSubmitEditing,
  placeholder,
  isDark,
  showConnector,
  trailing,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: string;
  onChangeText: (v: string) => void;
  onSubmitEditing?: () => void;
  placeholder: string;
  isDark: boolean;
  showConnector?: boolean;
  trailing?: React.ReactNode;
}) {
  return (
    <View style={tw`flex-row items-center`}>
      <View style={tw`items-center mr-3`}>
        <View style={[tw`w-9 h-9 rounded-full items-center justify-center`, { backgroundColor: iconBg }]}>
          {icon}
        </View>
        {showConnector && (
          <View style={tw`w-0.5 h-5 mt-1 ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`} />
        )}
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        placeholder={placeholder}
        placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
        returnKeyType="search"
        style={tw`flex-1 text-base py-3 ${isDark ? 'text-white' : 'text-slate-900'}`}
      />
      {trailing}
    </View>
  );
}

export default function RideRequestSheet({
  pickup,
  destination,
  onPickupChange,
  onPickupSelectPlace,
  onPickupSubmit,
  pickupConfirmed = false,
  geocodingPickup = false,
  onConfirmPickup,
  onUseCurrentLocation,
  onSetPickupOnMap,
  pickupMapSelectActive = false,
  pickupUsesGps = true,
  locationBias = null,
  onDestinationChange,
  onDestinationSelectPlace,
  onDestinationSubmit,
  destinationConfirmed = false,
  geocodingDestination = false,
  onConfirmDestination,
  stops,
  onAddStop,
  onRemoveStop,
  onStopChange,
  onStopSubmit,
  usePriceOffer,
  onTogglePriceOffer,
  priceOffer,
  onPriceOfferChange,
  categories,
  selectedCategory,
  onSelectCategory,
  estimate,
  nearby,
  estimateLoading,
  driversLoading,
  requestLoading,
  canRequest,
  requestBlockReason = null,
  validationMessage,
  maxStopsAllowed = DEFAULT_MAX_STOPS,
  minOfferAmount = 0,
  onRequest,
  isDark,
  t,
}: Props) {
  const sheetShadow = Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
    },
    android: { elevation: 16 },
  });

  const fareLabel =
    estimate &&
    `${formatCurrency(estimate.estimated_min_price, estimate.currency as never)} – ${formatCurrency(estimate.estimated_max_price, estimate.currency as never)}`;

  const canAddStop = stops.length < maxStopsAllowed;

  const routeParts = [
    t('ride.pickup_short', 'Pickup'),
    ...stops.map((_, index) => `${t('ride.stop_label', 'Stop')} ${index + 1}`),
    t('ride.destination_short', 'Destination'),
  ];

  return (
    <View
      style={[
        tw`absolute left-0 right-0 bottom-0 rounded-t-[28px] ${
          isDark ? 'bg-slate-900' : 'bg-white'
        }`,
        { zIndex: 2 },
        sheetShadow,
      ]}
    >
      <View style={tw`items-center pt-3 pb-1`}>
        <View style={tw`w-10 h-1 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`px-5 pt-2 pb-10`}
      >
        <Text style={tw`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {t('ride.request_title', 'Where are you going?')}
        </Text>
        <Text style={tw`text-sm mt-1 mb-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {t('ride.request_subtitle', 'Book a safe ride in minutes')}
        </Text>

        <View
          style={tw`rounded-2xl px-4 py-3 mb-3 border ${
            isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-100'
          }`}
        >
          <View style={tw`flex-row items-start`}>
            <View style={tw`items-center mr-3 pt-2`}>
              <View style={[tw`w-9 h-9 rounded-full items-center justify-center`, { backgroundColor: isDark ? '#064E3B' : '#D1FAE5' }]}>
                <View style={tw`w-2.5 h-2.5 rounded-full bg-emerald-400`} />
              </View>
              <View style={tw`w-0.5 h-5 mt-1 ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`} />
            </View>
            <View style={tw`flex-1 z-10`}>
              <LocationAutocomplete
                value={pickup}
                onChangeText={onPickupChange}
                onSelectPlace={(place) => onPickupSelectPlace?.(place)}
                placeholder={t('ride.pickup_placeholder', 'Pickup location')}
                isDark={isDark}
                near={locationBias}
                trailing={
                  geocodingPickup ? (
                    <ActivityIndicator size="small" color="#2563EB" />
                  ) : pickupConfirmed ? (
                    <Feather name="check-circle" size={20} color="#10B981" />
                  ) : null
                }
              />
            </View>
          </View>
          <View style={tw`flex-row flex-wrap ml-12 mb-1 gap-2`}>
            {onUseCurrentLocation && (
              <TouchableOpacity
                onPress={onUseCurrentLocation}
                style={tw`flex-row items-center rounded-full px-3 py-1 ${
                  pickupUsesGps
                    ? isDark
                      ? 'bg-emerald-900/40'
                      : 'bg-emerald-50'
                    : isDark
                      ? 'bg-slate-800'
                      : 'bg-slate-100'
                }`}
              >
                <Feather name="navigation" size={12} color="#10B981" />
                <Text style={tw`ml-1.5 text-xs font-semibold text-emerald-600`}>
                  {t('ride.use_current_location', 'Use my location')}
                </Text>
              </TouchableOpacity>
            )}
            {onSetPickupOnMap && (
              <TouchableOpacity
                onPress={onSetPickupOnMap}
                style={tw`flex-row items-center rounded-full px-3 py-1 ${
                  pickupMapSelectActive
                    ? 'bg-blue-600'
                    : isDark
                      ? 'bg-slate-800'
                      : 'bg-slate-100'
                }`}
              >
                <Feather name="map" size={12} color={pickupMapSelectActive ? '#fff' : '#2563EB'} />
                <Text
                  style={tw`ml-1.5 text-xs font-semibold ${
                    pickupMapSelectActive ? 'text-white' : 'text-blue-600'
                  }`}
                >
                  {t('ride.set_pickup_on_map', 'Set on map')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {pickupMapSelectActive && (
            <Text style={tw`ml-12 mb-2 text-xs text-blue-600`}>
              {t('ride.tap_map_pickup', 'Tap the map to choose your pickup point')}
            </Text>
          )}

          {stops.map((stop, index) => (
            <View key={stop.id}>
              <View style={tw`h-px my-1 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
              <LocationField
                icon={<Text style={tw`text-xs font-bold ${isDark ? 'text-amber-200' : 'text-amber-700'}`}>{index + 1}</Text>}
                iconBg={isDark ? '#78350F' : '#FEF3C7'}
                value={stop.address}
                onChangeText={(text) => onStopChange(stop.id, text)}
                onSubmitEditing={() => onStopSubmit(stop.id)}
                placeholder={t('ride.stop_label', 'Stop') + ` ${index + 1}`}
                isDark={isDark}
                showConnector
                trailing={
                  <TouchableOpacity onPress={() => onRemoveStop(stop.id)} style={tw`p-2`}>
                    <Feather name="x" size={18} color={isDark ? '#94A3B8' : '#64748B'} />
                  </TouchableOpacity>
                }
              />
              {stop.latitude != null && stop.longitude != null && (
                <Text style={tw`ml-12 -mt-1 mb-1 text-xs text-emerald-600`}>
                  {t('ride.stop_confirmed', 'Stop confirmed')}
                </Text>
              )}
            </View>
          ))}

          <View style={tw`h-px my-1 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
          <View style={tw`flex-row items-start`}>
            <View style={tw`items-center mr-3 pt-2`}>
              <View style={[tw`w-9 h-9 rounded-full items-center justify-center`, { backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2' }]}>
                <Feather name="map-pin" size={16} color={isDark ? '#FCA5A5' : '#EF4444'} />
              </View>
            </View>
            <View style={tw`flex-1 z-10`}>
              <LocationAutocomplete
                value={destination}
                onChangeText={onDestinationChange}
                onSelectPlace={(place) => onDestinationSelectPlace?.(place)}
                placeholder={t('ride.destination_placeholder', 'Where to?')}
                isDark={isDark}
                near={locationBias}
                trailing={
                  destination.trim() && !destinationConfirmed ? (
                    geocodingDestination ? (
                      <ActivityIndicator size="small" color="#2563EB" />
                    ) : (
                      <TouchableOpacity
                        onPress={onConfirmDestination ?? onDestinationSubmit}
                        style={tw`rounded-lg px-3 py-1.5 bg-blue-600`}
                      >
                        <Text style={tw`text-white text-xs font-bold`}>
                          {t('ride.confirm_destination', 'Confirm')}
                        </Text>
                      </TouchableOpacity>
                    )
                  ) : destinationConfirmed ? (
                    <Feather name="check-circle" size={20} color="#10B981" />
                  ) : null
                }
              />
            </View>
          </View>
        </View>

        {destination.trim() && !destinationConfirmed && !geocodingDestination && (
          <Text style={tw`text-xs mb-3 -mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {t(
              'ride.destination_hint',
              'Press search on the keyboard or tap Confirm so we can calculate your fare.',
            )}
          </Text>
        )}

        {canAddStop && (
          <TouchableOpacity
            onPress={onAddStop}
            style={tw`flex-row items-center justify-center rounded-xl py-2.5 mb-4 border border-dashed ${
              isDark ? 'border-slate-600 bg-slate-800/50' : 'border-slate-300 bg-slate-50'
            }`}
          >
            <Feather name="plus" size={16} color="#2563EB" />
            <Text style={tw`ml-2 text-sm font-semibold text-blue-600`}>
              {t('ride.add_stop', '+ Add stop')}
            </Text>
          </TouchableOpacity>
        )}

        {(stops.length > 0 || destination.trim()) && (
          <Text style={tw`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {routeParts.join(' → ')}
          </Text>
        )}

        {categories.length > 0 && (
          <RideCategorySelector
            categories={categories}
            selectedId={selectedCategory?.id ?? null}
            onSelect={onSelectCategory}
            estimate={estimate}
            estimateLoading={estimateLoading}
            isDark={isDark}
            t={t}
          />
        )}

        {estimate && (
          <View
            style={tw`mt-4 rounded-2xl p-4 border ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-blue-50 border-blue-100'
            }`}
          >
            <View style={tw`flex-row items-center justify-between mb-3`}>
              <View style={tw`flex-1`}>
                <Text style={tw`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {usePriceOffer
                    ? t('ride.your_offer', 'Your offer to driver')
                    : t('ride.estimated_fare', 'Estimated fare')}
                </Text>
                <Text style={tw`text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {usePriceOffer && priceOffer
                    ? formatCurrency(parseFloat(priceOffer) || 0, estimate.currency as never)
                    : fareLabel}
                </Text>
              </View>
              <View style={tw`items-end`}>
                <Text style={tw`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {estimate.duration_minutes.toFixed(0)} min · {estimate.distance_km.toFixed(1)} km
                  {(estimate.stop_count ?? stops.filter((s) => s.latitude != null).length) > 0
                    ? ` · ${estimate.stop_count ?? stops.filter((s) => s.latitude != null).length} ${t('ride.stops', 'stops')}`
                    : ''}
                </Text>
                {(estimate.extra_stop_fee ?? 0) > 0 && (
                  <Text style={tw`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {t('ride.distance_fare', 'Distance fare')}:{' '}
                    {formatCurrency(estimate.distance_fare ?? estimate.default_fare ?? 0, estimate.currency as never)}
                    {' · '}
                    {t('ride.extra_stop_fee', 'Stop fee')}:{' '}
                    {formatCurrency(estimate.extra_stop_fee ?? 0, estimate.currency as never)}
                  </Text>
                )}
                {nearby?.drivers_available && (
                  <View style={tw`flex-row items-center mt-2 bg-emerald-500/15 rounded-full px-3 py-1`}>
                    <Feather name="users" size={12} color="#10B981" />
                    <Text style={tw`text-xs font-semibold text-emerald-600 ml-1`}>
                      {nearby.nearby_driver_count} {t('ride.drivers_nearby', 'drivers nearby')}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View
              style={tw`flex-row items-center justify-between rounded-xl px-3 py-2.5 ${
                isDark ? 'bg-slate-900/60' : 'bg-white/80'
              }`}
            >
              <View style={tw`flex-1 pr-3`}>
                <Text style={tw`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t('ride.offer_your_price', 'Offer your price')}
                </Text>
                <Text style={tw`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t('ride.offer_hint', 'Drivers can accept or counter your fare')}
                </Text>
              </View>
              <Switch
                value={usePriceOffer}
                onValueChange={onTogglePriceOffer}
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={usePriceOffer ? '#2563EB' : '#F8FAFC'}
              />
            </View>

            {usePriceOffer && (
              <View style={tw`mt-3`}>
                <TextInput
                  value={priceOffer}
                  onChangeText={onPriceOfferChange}
                  keyboardType="decimal-pad"
                  placeholder={t('ride.offer_amount_placeholder', 'Enter amount')}
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  style={tw`rounded-xl px-4 py-3 text-lg font-bold border ${
                    isDark ? 'border-slate-600 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900'
                  }`}
                />
                <Text style={tw`text-xs mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t('ride.minimum_offer_hint', 'At least 90% of the estimated fare ({min})', {
                    min: formatCurrency(minOfferAmount || estimate.minimum_fare, estimate.currency as never),
                  })}
                </Text>
              </View>
            )}
          </View>
        )}

        {(estimateLoading || driversLoading) && !estimate && (
          <View style={tw`flex-row items-center justify-center py-4`}>
            <ActivityIndicator size="small" color="#2563EB" />
            <Text style={tw`ml-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('ride.calculating_fare', 'Calculating fare...')}
            </Text>
          </View>
        )}

        {nearby && !nearby.drivers_available && !driversLoading && (
          <View style={tw`mt-3 flex-row items-center rounded-xl px-3 py-2 ${isDark ? 'bg-amber-900/30' : 'bg-amber-50'}`}>
            <Feather name="alert-circle" size={16} color="#D97706" />
            <Text style={tw`ml-2 text-sm flex-1 ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
              {nearby.message}
            </Text>
          </View>
        )}

        {validationMessage ? (
          <View style={tw`mt-3 flex-row items-center rounded-xl px-3 py-2 ${isDark ? 'bg-amber-900/30' : 'bg-amber-50'}`}>
            <Feather name="info" size={16} color="#D97706" />
            <Text style={tw`ml-2 text-sm flex-1 ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
              {validationMessage}
            </Text>
          </View>
        ) : null}

        {!canRequest && !requestLoading && requestBlockReason ? (
          <View style={tw`mt-3 flex-row items-center rounded-xl px-3 py-2 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <Feather name="info" size={16} color={isDark ? '#94A3B8' : '#64748B'} />
            <Text style={tw`ml-2 text-sm flex-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {requestBlockReason}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          onPress={onRequest}
          disabled={!canRequest || requestLoading}
          activeOpacity={0.88}
          style={tw`mt-5 rounded-2xl overflow-hidden ${!canRequest && !requestLoading ? 'opacity-60' : ''}`}
        >
          {canRequest && !requestLoading ? (
            <LinearGradient
              colors={['#2563EB', '#1D4ED8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={tw`py-4 flex-row items-center justify-center`}
            >
              <Feather name="navigation" size={20} color="#fff" style={tw`mr-2`} />
              <Text style={tw`text-white font-bold text-base`}>
                {usePriceOffer
                  ? t('ride.send_offer', 'Send offer to drivers')
                  : t('ride.request_button', 'Request Ride')}
              </Text>
            </LinearGradient>
          ) : (
            <View style={tw`py-4 flex-row items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`}>
              {requestLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Feather name="navigation" size={20} color="#fff" style={tw`mr-2`} />
                  <Text style={tw`text-white font-bold text-base`}>
                    {t('ride.request_button', 'Request Ride')}
                  </Text>
                </>
              )}
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
