export type RideCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  iconUrl: string | null;
  baseFare: string;
  pricePerKm: string;
  pricePerMinute: string;
  minimumFare: string;
  capacity: number;
  isActive: boolean;
  sortOrder: number;
};

export type RidePriceEstimate = {
  distance_km: number;
  duration_minutes: number;
  currency: string;
  estimated_min_price: number;
  estimated_max_price: number;
  default_fare?: number;
  distance_fare?: number;
  extra_stop_fee?: number;
  extra_stop_fee_per_stop?: number;
  max_stops_allowed?: number;
  base_fare: number;
  price_per_km: number;
  price_per_minute: number;
  service_fee: number;
    surge_multiplier: number;
    minimum_fare: number;
    minimum_offer?: number;
    stop_count?: number;
};

export type RideStopInput = {
  address: string;
  latitude: number;
  longitude: number;
  sort_order: number;
};

export type RideStopDraft = {
  id: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
};

export type NearbyDriverResponse = {
  search_radius_km: number;
  drivers_available: boolean;
  nearby_driver_count: number;
  estimated_pickup_time_minutes: number | null;
  message: string;
  search_steps: number[];
  radius_expansion_interval_seconds?: number;
  ride_request_timeout_seconds?: number;
};

export type RideSearchStatus = {
  search_started_at: string | null;
  search_expires_at: string | null;
  current_search_radius_km: number;
  search_cycle_index: number;
  search_radius_ladder_km: number[];
  radius_expansion_interval_seconds: number;
  ride_request_timeout_seconds: number;
  drivers_found?: number;
  drivers_notified?: number;
  search_cycle?: number;
};

export type ActiveRideDriverContact = {
  driverId: string;
  driverName: string;
  driverAvatarUrl: string | null;
  driverRating: number;
  vehicleModel: string;
  vehicleColor: string;
  vehiclePlateNumber: string;
  canChat: boolean;
  canCall: boolean;
  maskedPhoneNumber: string | null;
};

export type RideChatMessage = {
  id: string;
  rideId: string;
  senderId: string;
  senderType: 'client' | 'driver';
  message: string;
  createdAt: string;
  status: 'sent' | 'delivered' | 'read';
};

export type Ride = {
  id: number;
  ride_number: string;
  status: string;
  pickup_address: string;
  pickup_lat?: number | string;
  pickup_lng?: number | string;
  destination_address: string;
  destination_lat?: number | string;
  destination_lng?: number | string;
  estimated_price: string;
  default_calculated_price?: string;
  client_extra_amount?: string;
  customer_price_offer?: string | null;
  driver_counter_offer?: string | null;
  agreed_price?: string | null;
  negotiation_status?: string;
  final_price?: string | null;
  currency: string;
  payment_method: string;
  driver_name?: string | null;
  driver_phone?: string | null;
  driver_rating?: number | null;
  driver_avatar_url?: string | null;
  driver_lat?: number | string | null;
  driver_lng?: number | string | null;
  driver_contact?: ActiveRideDriverContact | null;
  distance_km?: number | string;
  duration_minutes?: number;
  share_trip_token?: string;
  stops?: RideStop[];
  search_started_at?: string | null;
  search_expires_at?: string | null;
  current_search_radius_km?: number | string | null;
  search_cycle_index?: number;
};

export type RideStop = {
  id: number;
  sort_order: number;
  address: string;
  latitude: number | string;
  longitude: number | string;
};

export type RideRequestPayload = {
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  destination_address: string;
  destination_lat: number;
  destination_lng: number;
  ride_type: string;
  payment_method: string;
  country_code?: string;
  customer_price_offer?: number;
  stops?: RideStopInput[];
};
