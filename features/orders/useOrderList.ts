import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchOrders, type OrderListItem, type Vertical } from '../commerce/api';
import { errorMessage } from '../../utils/notify';

export type OrderTab = 'all' | 'active' | 'completed' | 'cancelled';

/** Paginated order list for one status tab. */
export function useOrderList({ tab, vertical, enabled }: { tab: OrderTab; vertical?: Vertical; enabled: boolean }) {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const request = useRef(0);

  const load = useCallback(
    async (nextPage: number, mode: 'initial' | 'more' | 'refresh') => {
      const id = ++request.current;
      if (mode === 'initial') setLoading(true);
      if (mode === 'more') setLoadingMore(true);
      if (mode === 'refresh') setRefreshing(true);
      if (mode !== 'more') setError(null);
      try {
        const data = await fetchOrders({ status: tab === 'all' ? undefined : tab, vertical, page: nextPage });
        if (id !== request.current) return;
        setOrders((prev) => (nextPage === 1 ? data.results : [...prev, ...data.results.filter((o) => !prev.some((p) => p.id === o.id))]));
        setPage(nextPage);
        setHasMore(!!data.next);
      } catch (err) {
        if (id !== request.current) return;
        setError(errorMessage(err, 'We could not load your orders.'));
      } finally {
        if (id === request.current) {
          setLoading(false);
          setLoadingMore(false);
          setRefreshing(false);
        }
      }
    },
    [tab, vertical],
  );

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setOrders([]);
    void load(1, 'initial');
  }, [enabled, load]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading) return;
    void load(page + 1, 'more');
  }, [hasMore, load, loading, loadingMore, page]);

  return {
    orders,
    loading,
    loadingMore,
    refreshing,
    error,
    hasMore,
    loadMore,
    refresh: () => void load(1, 'refresh'),
    retry: () => void load(1, 'initial'),
  };
}
