import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  fetchOrder,
  orderSocketUrl,
  type OrderChatMessage,
  type OrderDetail,
  type OrderStatusKey,
  type OrderStep,
} from '../commerce/api';
import { errorMessage } from '../../utils/notify';
import { isActiveStep } from './steps';

const POLL_MS = 15000;

type OrderSocketEvent =
  | { type: 'order.status'; status: OrderStatusKey; status_label?: string; steps?: OrderStep[] }
  | { type: 'chat.message'; message: OrderChatMessage }
  | { type: 'driver.location'; latitude: number | string; longitude: number | string };

function parseEvent(raw: unknown): OrderSocketEvent | null {
  if (typeof raw !== 'string') return null;
  try {
    const data = JSON.parse(raw) as { type?: unknown };
    if (data && typeof data === 'object' && typeof data.type === 'string') return data as OrderSocketEvent;
  } catch {
    // ignore malformed frames
  }
  return null;
}

type Options = {
  token?: string | null;
  /** Open the socket / polling loop. Disable for screens that only need a one-off fetch. */
  live?: boolean;
  onChatMessage?: (message: OrderChatMessage) => void;
};

export type OrderLiveState = {
  order: OrderDetail | null;
  loading: boolean;
  error: string | null;
  /** True while the WebSocket is open; false means updates arrive via polling. */
  connected: boolean;
  reload: () => void;
  /** Apply a fresh payload returned by an action (e.g. cancel) without waiting for the next poll. */
  setOrder: (order: OrderDetail) => void;
};

/**
 * Loads an order and keeps it fresh: WebSocket events (status, steps, driver location, chat)
 * are merged in place; when the socket is unavailable or drops, the order is polled every 15s.
 * Everything is torn down on blur/unmount.
 */
export function useOrderLive(orderId: number, { token, live = true, onChatMessage }: Options = {}): OrderLiveState {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const chatRef = useRef(onChatMessage);
  const hasOrder = useRef(false);
  const statusRef = useRef<string | null>(null);

  useEffect(() => {
    chatRef.current = onChatMessage;
  }, [onChatMessage]);

  useEffect(() => {
    statusRef.current = order?.status ?? null;
  }, [order?.status]);

  const load = useCallback(
    async (silent: boolean) => {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      try {
        const data = await fetchOrder(orderId);
        hasOrder.current = true;
        setOrder(data);
        setError(null);
      } catch (err) {
        if (!silent || !hasOrder.current) setError(errorMessage(err, 'We could not load this order.'));
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [orderId],
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;
      let socket: WebSocket | null = null;
      let poll: ReturnType<typeof setInterval> | null = null;

      void load(hasOrder.current);
      if (!live) return () => undefined;

      const startPolling = () => {
        if (!active || poll) return;
        poll = setInterval(() => {
          // Delivered / cancelled orders no longer change; stop hitting the API for them.
          if (hasOrder.current && !isActiveStep(statusRef.current)) return;
          void load(true);
        }, POLL_MS);
      };
      const stopPolling = () => {
        if (poll) clearInterval(poll);
        poll = null;
      };

      const handle = (event: OrderSocketEvent) => {
        if (event.type === 'order.status') {
          setOrder((prev) =>
            prev
              ? {
                  ...prev,
                  status: event.status,
                  status_label: event.status_label ?? prev.status_label,
                  steps: event.steps?.length ? event.steps : prev.steps,
                }
              : prev,
          );
          // Driver, PIN and ETA may change with the status; refresh the full payload quietly.
          void load(true);
        } else if (event.type === 'driver.location') {
          const latitude = Number(event.latitude);
          const longitude = Number(event.longitude);
          if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
            setOrder((prev) => (prev ? { ...prev, driver_location: { latitude, longitude } } : prev));
          }
        } else if (event.type === 'chat.message' && event.message) {
          chatRef.current?.(event.message);
        }
      };

      if (token && typeof WebSocket !== 'undefined') {
        try {
          socket = new WebSocket(orderSocketUrl(orderId, token));
          socket.onopen = () => {
            if (!active) return;
            setConnected(true);
            stopPolling();
          };
          socket.onmessage = (message) => {
            const event = parseEvent(message.data);
            if (event && active) handle(event);
          };
          socket.onerror = () => startPolling();
          socket.onclose = () => {
            if (!active) return;
            setConnected(false);
            startPolling();
          };
        } catch {
          startPolling();
        }
      } else {
        startPolling();
      }

      return () => {
        active = false;
        stopPolling();
        setConnected(false);
        if (socket) {
          socket.onopen = null;
          socket.onmessage = null;
          socket.onerror = null;
          socket.onclose = null;
          socket.close();
        }
      };
    }, [live, load, orderId, token]),
  );

  const reload = useCallback(() => void load(false), [load]);

  return { order, loading, error, connected, reload, setOrder };
}
