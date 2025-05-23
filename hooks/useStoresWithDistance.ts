import { useState, useEffect } from 'react';
import { getCoordsFromLocationOrAddress } from '../utils/getCoordsFromLocationOrAddress';
import { haversineDistance } from '../utils/calculateDistance';
import { useUserLocation } from './useUserLocation';
import { Store } from '../services/types';

interface StoreWithDistance extends Store {
  distance: number | null; // km
  coords: { lat: number; lng: number } | null;
}

export function useStoresWithDistance(stores: Store[]) {
  const userLoc = useUserLocation();
  const [storesWithDistance, setStoresWithDistance] = useState<StoreWithDistance[]>([]);

  useEffect(() => {
    if (!userLoc) return;
    (async () => {
      const results: StoreWithDistance[] = [];
      for (const store of stores) {
        const coords = await getCoordsFromLocationOrAddress(store.location, store.address);
        const distance =
          coords && userLoc
            ? haversineDistance(userLoc.lat, userLoc.lng, coords.lat, coords.lng)
            : null;
        results.push({ ...store, distance, coords });
      }
      // Sort nearest first
      setStoresWithDistance(results.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity)));
    })();
  }, [stores, userLoc]);

  return storesWithDistance;
}
