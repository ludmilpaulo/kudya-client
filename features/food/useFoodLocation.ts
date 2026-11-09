import { useEffect, useMemo, useState } from 'react';
import * as Location from 'expo-location';
import { useAppSelector } from '../../redux/store';
import { selectCheckoutDraft } from '../../redux/slices/checkoutDraftSlice';
import type { Coordinates } from './filters';

/**
 * Coordinates for distance sorting: the chosen delivery address first, otherwise the last known
 * device position when location permission was already granted. Never prompts for permission.
 */
export function useFoodLocation(): Coordinates | null {
  const draft = useAppSelector(selectCheckoutDraft).address;
  const draftLat = draft?.latitude ?? null;
  const draftLng = draft?.longitude ?? null;
  const [device, setDevice] = useState<Coordinates | null>(null);

  useEffect(() => {
    if (draftLat !== null && draftLng !== null) return;
    let active = true;
    (async () => {
      try {
        const permission = await Location.getForegroundPermissionsAsync();
        if (!permission.granted) return;
        const position = await Location.getLastKnownPositionAsync();
        if (active && position) {
          setDevice({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        }
      } catch {
        // Location is optional here; the list simply skips distance sorting.
      }
    })();
    return () => {
      active = false;
    };
  }, [draftLat, draftLng]);

  return useMemo(
    () => (draftLat !== null && draftLng !== null ? { latitude: draftLat, longitude: draftLng } : device),
    [draftLat, draftLng, device],
  );
}
