import axios from 'axios';
import { baseAPI } from './types';

export interface RideEstimate {
  estimated_price: string;
  distance_km: string;
  duration_minutes: number;
  currency: string;
}

export interface Ride {
  id: number;
  ride_number: string;
  status: string;
  pickup_address: string;
  pickup_lat: number | string;
  pickup_lng: number | string;
  destination_address: string;
  destination_lat: number | string;
  destination_lng: number | string;
  estimated_price: number | string;
  final_price: number | null;
  currency: string;
  distance_km: number;
  duration_minutes: number;
  driver_name: string | null;
  driver_lat: number | null;
  driver_lng: number | null;
  share_trip_token: string;
}

const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

export async function estimateRide(payload: Record<string, unknown>): Promise<RideEstimate> {
  const { data } = await axios.post(`${baseAPI}/api/rides/estimate/`, payload);
  return data;
}

export async function requestRide(token: string, payload: Record<string, unknown>): Promise<Ride> {
  const { data } = await axios.post(`${baseAPI}/api/rides/request/`, payload, { headers: auth(token) });
  return data;
}

export async function fetchRideHistory(token: string): Promise<Ride[]> {
  const { data } = await axios.get(`${baseAPI}/api/rides/history/`, { headers: auth(token) });
  return data;
}

export async function fetchRide(id: number, token: string): Promise<Ride> {
  const { data } = await axios.get(`${baseAPI}/api/rides/${id}/`, { headers: auth(token) });
  return data;
}

export async function cancelRide(id: number, token: string, reason?: string): Promise<Ride> {
  const { data } = await axios.post(`${baseAPI}/api/rides/${id}/cancel/`, { reason }, { headers: auth(token) });
  return data;
}
