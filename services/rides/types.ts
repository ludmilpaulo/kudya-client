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
  base_fare: number;
  price_per_km: number;
  price_per_minute: number;
  service_fee: number;
  surge_multiplier: number;
  minimum_fare: number;
};

export type NearbyDriverResponse = {
  search_radius_km: number;
  drivers_available: boolean;
  nearby_driver_count: number;
  estimated_pickup_time_minutes: number | null;
  message: string;
  search_steps: number[];
};

export type Ride = {
  id: number;
  ride_number: string;
  status: string;
  pickup_address: string;
  destination_address: string;
  estimated_price: string;
  currency: string;
  payment_method: string;
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
};
