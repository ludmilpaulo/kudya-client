import { useCallback, useState } from 'react';
import * as Location from 'expo-location';

export type ResolvedLocation = { latitude: number; longitude: number; address: string };

function describe(place: Location.LocationGeocodedAddress | undefined): string {
  if (!place) return '';
  const street = [place.streetNumber, place.street].filter(Boolean).join(' ') || place.name || '';
  return [street, place.district, place.city, place.region].filter((part, index, all) => !!part && all.indexOf(part) === index).join(', ');
}

/** GPS fix (browser geolocation on web) plus best-effort reverse geocoding. */
export function useCurrentLocation() {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locate = useCallback(async (messages: { denied: string; failed: string }): Promise<ResolvedLocation | null> => {
    setLocating(true);
    setError(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setError(messages.denied);
        return null;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = position.coords;
      let address = '';
      try {
        const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
        address = describe(place);
      } catch {
        // Reverse geocoding is unavailable on some platforms (e.g. web); coordinates are enough.
      }
      return { latitude, longitude, address: address || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` };
    } catch {
      setError(messages.failed);
      return null;
    } finally {
      setLocating(false);
    }
  }, []);

  return { locate, locating, error };
}

/** Forward geocode a typed address; null when the platform cannot resolve it. */
export async function geocodeAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const [match] = await Location.geocodeAsync(address);
    return match ? { latitude: match.latitude, longitude: match.longitude } : null;
  } catch {
    return null;
  }
}
