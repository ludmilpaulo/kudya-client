import { useEffect, useMemo, useState } from 'react';
import {
  countryCodeFromCoordinates,
  deviceCountryCode,
  normalizeCountryCode,
  resolveRideCountryCode,
} from '../utils/rideCountry';
import { useUserRegion } from './useUserRegion';

type LatLng = { latitude: number; longitude: number };

/**
 * Country code for ride pricing, categories, and geocoding bias.
 * Uses GPS country when available, then device locale, then saved user region.
 */
export function useRideCountryCode(pickupCoords: LatLng | null) {
  const { region: userRegion, isLoading: regionLoading } = useUserRegion();
  const [gpsCountry, setGpsCountry] = useState<string | undefined>(() => deviceCountryCode());

  useEffect(() => {
    if (!pickupCoords) return;
    let cancelled = false;
    void countryCodeFromCoordinates(pickupCoords.latitude, pickupCoords.longitude).then((code) => {
      if (!cancelled && code) setGpsCountry(code);
    });
    return () => {
      cancelled = true;
    };
  }, [pickupCoords?.latitude, pickupCoords?.longitude]);

  const countryCode = useMemo(
    () => resolveRideCountryCode(gpsCountry, userRegion) ?? deviceCountryCode() ?? 'ZA',
    [gpsCountry, userRegion],
  );

  return {
    countryCode,
    gpsCountry: normalizeCountryCode(gpsCountry),
    userRegion: normalizeCountryCode(userRegion),
    isLoading: regionLoading && !gpsCountry,
  };
}
