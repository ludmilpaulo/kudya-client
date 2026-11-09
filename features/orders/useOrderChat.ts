import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { fetchOrderChat, sendOrderChat, type OrderChatMessage } from '../commerce/api';
import { errorMessage } from '../../utils/notify';

const POLL_MS = 10000;

function mergeMessages(current: OrderChatMessage[], incoming: OrderChatMessage[]): OrderChatMessage[] {
  const byId = new Map<number, OrderChatMessage>();
  [...current, ...incoming].forEach((message) => byId.set(message.id, message));
  return [...byId.values()].sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id - b.id);
}

/** Order chat thread; `connected` = socket is delivering messages, otherwise poll every 10s. */
export function useOrderChat(orderId: number, { enabled, connected }: { enabled: boolean; connected: boolean }) {
  const [messages, setMessages] = useState<OrderChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const load = useCallback(
    async (silent: boolean) => {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      try {
        const data = await fetchOrderChat(orderId);
        setMessages((prev) => mergeMessages(prev, data));
        setError(null);
      } catch (err) {
        if (!silent) setError(errorMessage(err, 'We could not load the conversation.'));
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [orderId],
  );

  useFocusEffect(
    useCallback(() => {
      if (!enabled) return () => undefined;
      void load(false);
      return () => undefined;
    }, [enabled, load]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!enabled || connected) return () => undefined;
      const timer = setInterval(() => void load(true), POLL_MS);
      return () => clearInterval(timer);
    }, [connected, enabled, load]),
  );

  const receive = useCallback((message: OrderChatMessage) => {
    setMessages((prev) => mergeMessages(prev, [message]));
  }, []);

  const send = useCallback(
    async (text: string): Promise<boolean> => {
      const body = text.trim();
      if (!body) return false;
      setSending(true);
      try {
        const message = await sendOrderChat(orderId, body);
        setMessages((prev) => mergeMessages(prev, [message]));
        return true;
      } catch {
        return false;
      } finally {
        setSending(false);
      }
    },
    [orderId],
  );

  return { messages, loading, error, sending, reload: () => void load(false), receive, send };
}
