import { useEffect, useRef, useState, useCallback } from 'react';
import { rideTrackingWsUrl } from '../utils/websocket';
import type { Ride } from '../services/ridesApi';

interface RideWsMessage {
  type: string;
  ride?: Ride;
  latitude?: string;
  longitude?: string;
  driver_id?: number;
}

export function useRideWebSocket(rideId: number | null) {
  const [ride, setRide] = useState<Ride | null>(null);
  const [driverPosition, setDriverPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const applyMessage = useCallback((msg: RideWsMessage) => {
    if (msg.ride) {
      setRide(msg.ride);
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
    wsRef.current = ws;

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
      wsRef.current = null;
    };
  }, [rideId, applyMessage]);

  return { ride, driverPosition, connected, setRide };
}
