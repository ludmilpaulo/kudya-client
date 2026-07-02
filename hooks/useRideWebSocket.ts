import { useEffect, useState, useCallback } from 'react';
import { rideTrackingWsUrl } from '../utils/websocket';
import type { Ride } from '../services/ridesApi';
import type { RideSearchStatus } from '../services/rides/types';

interface RideWsMessage {
  type: string;
  ride?: Ride;
  search?: RideSearchStatus;
  latitude?: string;
  longitude?: string;
  driver_id?: number;
  message?: string;
}

export function useRideWebSocket(rideId: number | null) {
  const [ride, setRide] = useState<Ride | null>(null);
  const [searchStatus, setSearchStatus] = useState<RideSearchStatus | null>(null);
  const [driverPosition, setDriverPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [connected, setConnected] = useState(false);
  const [searchTimedOut, setSearchTimedOut] = useState(false);

  const applyMessage = useCallback((msg: RideWsMessage) => {
    if (msg.ride) {
      setRide(msg.ride);
    }
    if (msg.search) {
      setSearchStatus(msg.search);
    }
    if (msg.type === 'search_timeout') {
      setSearchTimedOut(true);
    }
    if (msg.type === 'driver_location' && msg.latitude && msg.longitude) {
      setDriverPosition({
        latitude: parseFloat(msg.latitude),
        longitude: parseFloat(msg.longitude),
      });
    }
  }, []);

  useEffect(() => {
    if (!rideId) return;

    const url = rideTrackingWsUrl(rideId);
    const ws = new WebSocket(url);

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as RideWsMessage;
        applyMessage(data);
      } catch {
        // ignore malformed frames
      }
    };

    return () => {
      ws.close();
    };
  }, [rideId, applyMessage]);

  return { ride, searchStatus, driverPosition, connected, searchTimedOut, setRide, setSearchStatus };
}
