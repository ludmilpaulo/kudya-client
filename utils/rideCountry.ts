import * as Location from 'expo-location';
import * as Localization from 'expo-localization';

/** Normalize to ISO 3166-1 alpha-2 (works for any country worldwide). */
export function normalizeCountryCode(code?: string | null): string | undefined {
  if (!code) return undefined;
  const trimmed = code.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(trimmed) ? trimmed : undefined;
}

/** Device locale region (e.g. US, GB, FR) — available before GPS. */
export function deviceCountryCode(): string | undefined {
  const locales = Localization.getLocales();
  for (const locale of locales) {
    const code = normalizeCountryCode(locale.regionCode);
    if (code) return code;
  }
  return undefined;
}

/** Resolve country from GPS coordinates via reverse geocoding. */
export async function countryCodeFromCoordinates(
  latitude: number,
  longitude: number,
): Promise<string | undefined> {
  try {
    const places = await Location.reverseGeocodeAsync({ latitude, longitude });
    for (const place of places) {
      const code = normalizeCountryCode(place.isoCountryCode);
      if (code) return code;
    }
  } catch {
    // ignore — caller falls back to device / profile region
  }
  return undefined;
}

/** Best available country for rides: GPS pin beats device locale. */
export function resolveRideCountryCode(
  gpsCountry?: string | null,
  profileRegion?: string | null,
): string | undefined {
  return (
    normalizeCountryCode(gpsCountry) ??
    deviceCountryCode() ??
    normalizeCountryCode(profileRegion)
  );
}
