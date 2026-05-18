import axios from 'axios';
import { baseAPI } from './types';

const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

export async function estimatePackage(payload: Record<string, unknown>) {
  const { data } = await axios.post(`${baseAPI}/api/deliveries/estimate/`, payload);
  return data;
}

export async function requestPackage(token: string, payload: Record<string, unknown>) {
  const { data } = await axios.post(`${baseAPI}/api/deliveries/request/`, payload, { headers: auth(token) });
  return data;
}

export async function fetchPackageHistory(token: string) {
  const { data } = await axios.get(`${baseAPI}/api/deliveries/history/`, { headers: auth(token) });
  return data;
}
