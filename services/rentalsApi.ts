import axios from 'axios';
import { baseAPI } from './types';

export interface RentalVehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  seats: number;
  transmission: string;
  fuel_type: string;
  daily_price: number;
  deposit_amount: number;
  currency: string;
  images: { image: string }[];
}

const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

export async function fetchRentalVehicles(params?: Record<string, string | number>) {
  const { data } = await axios.get(`${baseAPI}/api/rentals/vehicles/`, { params });
  return (data.results ?? data) as RentalVehicle[];
}

export async function bookRental(token: string, payload: Record<string, unknown>) {
  const { data } = await axios.post(`${baseAPI}/api/rentals/bookings/book/`, payload, { headers: auth(token) });
  return data;
}

export async function fetchRentalHistory(token: string) {
  const { data } = await axios.get(`${baseAPI}/api/rentals/bookings/history/`, { headers: auth(token) });
  return data;
}
