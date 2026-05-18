import { baseAPI } from '../services/types';

export function getWebSocketBaseUrl(): string {
  const http = baseAPI.replace(/\/$/, '');
  if (http.startsWith('https://')) {
    return http.replace('https://', 'wss://');
  }
  if (http.startsWith('http://')) {
    return http.replace('http://', 'ws://');
  }
  return `wss://${http}`;
}

export function rideTrackingWsUrl(rideId: number): string {
  return `${getWebSocketBaseUrl()}/ws/rides/${rideId}/`;
}
