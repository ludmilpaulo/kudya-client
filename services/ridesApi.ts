import axios from 'axios';
import { baseAPI } from './types';
import type { Ride } from './rides/types';

export type { Ride, RideCategory, RidePriceEstimate, NearbyDriverResponse } from './rides/types';

const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

/** @deprecated Prefer RTK Query hooks from redux/api/ridesApi */
export async function fetchRide(id: number, token: string): Promise<Ride> {
  const { data } = await axios.get(`${baseAPI}/api/rides/${id}/`, { headers: auth(token) });
  return data;
}

/** @deprecated Prefer RTK Query hooks from redux/api/ridesApi */
export async function fetchRideHistory(token: string): Promise<Ride[]> {
  const { data } = await axios.get(`${baseAPI}/api/rides/history/`, { headers: auth(token) });
  return data;
}

/** @deprecated Prefer RTK Query hooks from redux/api/ridesApi */
export async function cancelRide(id: number, token: string, reason?: string): Promise<Ride> {
  const { data } = await axios.post(`${baseAPI}/api/rides/${id}/cancel/`, { reason }, { headers: auth(token) });
  return data;
}
