import { googleAPi } from '../configs/variable';
export type PlaceSuggestion = {
  id: string;
  description: string;
  latitude?: number;
  longitude?: number;
};

export type ResolvedPlace = {
  description: string;
  latitude: number;
  longitude: number;
};

export function getGoogleMapsApiKey(): string {
  return (process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? googleAPi ?? '').trim();
}

type Bias = { latitude: number; longitude: number };

async function fetchGoogleSuggestions(
  input: string,
  near?: Bias,
): Promise<PlaceSuggestion[]> {
  const key = getGoogleMapsApiKey();
  if (!key || input.trim().length < 2) return [];

  const params = new URLSearchParams({
    input: input.trim(),
    key,
    language: 'en',
  });
  if (near) {
    params.set('location', `${near.latitude},${near.longitude}`);
    params.set('radius', '80000');
  }

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`,
  );
  const data = await response.json();
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    return [];
  }
  return (data.predictions ?? []).map((item: { place_id: string; description: string }) => ({
    id: item.place_id,
    description: item.description,
  }));
}

async function resolveGooglePlace(placeId: string): Promise<ResolvedPlace | null> {
  const key = getGoogleMapsApiKey();
  if (!key) return null;

  const params = new URLSearchParams({
    place_id: placeId,
    key,
    fields: 'formatted_address,geometry',
  });
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`,
  );
  const data = await response.json();
  if (data.status !== 'OK' || !data.result?.geometry?.location) return null;

  return {
    description: data.result.formatted_address as string,
    latitude: data.result.geometry.location.lat as number,
    longitude: data.result.geometry.location.lng as number,
  };
}

async function fetchNominatimSuggestions(
  input: string,
  near?: Bias,
): Promise<PlaceSuggestion[]> {
  const trimmed = input.trim();
  if (trimmed.length < 3) return [];

  const params: Record<string, string | number> = {
    q: trimmed,
    format: 'json',
    limit: 6,
    addressdetails: 0,
  };
  if (near) {
    const delta = 0.35;
    params.viewbox = `${near.longitude - delta},${near.latitude + delta},${near.longitude + delta},${near.latitude - delta}`;
    params.bounded = 0;
  }

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)]),
    ).toString()}`,
    { headers: { 'User-Agent': 'KudyaApp/1.0' } },
  );
  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) return [];

  return data.map((item: { place_id: number; display_name: string; lat: string; lon: string }) => ({
    id: `nominatim-${item.place_id}`,
    description: item.display_name,
    latitude: parseFloat(item.lat),
    longitude: parseFloat(item.lon),
  }));
}

export async function searchPlaces(
  input: string,
  near?: Bias,
): Promise<PlaceSuggestion[]> {
  const trimmed = input.trim();
  if (trimmed.length < 2) return [];

  try {
    const google = await fetchGoogleSuggestions(trimmed, near);
    if (google.length > 0) return google.slice(0, 6);
  } catch {
    // fall through to Nominatim
  }

  try {
    return await fetchNominatimSuggestions(trimmed, near);
  } catch {
    return [];
  }
}

export async function resolvePlaceSuggestion(
  suggestion: PlaceSuggestion,
): Promise<ResolvedPlace | null> {
  if (suggestion.latitude != null && suggestion.longitude != null) {
    return {
      description: suggestion.description,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    };
  }
  if (suggestion.id.startsWith('nominatim-')) {
    return null;
  }
  return resolveGooglePlace(suggestion.id);
}
