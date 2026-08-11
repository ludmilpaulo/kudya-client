import { Linking, Platform } from "react-native";

/** Open external maps with coordinate destinations only (no free-text geocoding). */

export type MapCoords = {
  latitude: number;
  longitude: number;
};

export function hasValidCoords(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): boolean {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  );
}

export function toMapCoords(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): MapCoords | null {
  if (!hasValidCoords(latitude, longitude)) return null;
  return { latitude: latitude as number, longitude: longitude as number };
}

export function getPropertyMapCoords(location: {
  latitude?: number | null;
  longitude?: number | null;
  approximate_latitude?: number | null;
  approximate_longitude?: number | null;
} | null | undefined): MapCoords | null {
  if (!location) return null;
  return (
    toMapCoords(location.latitude, location.longitude) ||
    toMapCoords(location.approximate_latitude, location.approximate_longitude)
  );
}

export function getDirectionsUrl(coords: MapCoords): string {
  const destination = `${coords.latitude},${coords.longitude}`;
  if (Platform.OS === "ios") {
    return `http://maps.apple.com/?daddr=${encodeURIComponent(destination)}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

export function getGeoUrl(coords: MapCoords): string {
  return `geo:${coords.latitude},${coords.longitude}?q=${coords.latitude},${coords.longitude}`;
}

export async function openPropertyDirections(coords: MapCoords): Promise<void> {
  const primary = getDirectionsUrl(coords);
  try {
    const supported = await Linking.canOpenURL(primary);
    if (supported) {
      await Linking.openURL(primary);
      return;
    }
  } catch {
    // fall through
  }
  if (Platform.OS === "android") {
    try {
      await Linking.openURL(getGeoUrl(coords));
      return;
    } catch {
      // fall through
    }
  }
  await Linking.openURL(
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      `${coords.latitude},${coords.longitude}`,
    )}`,
  );
}

export function formatDistanceKm(distanceKm: number | null | undefined): string | null {
  if (distanceKm == null || !Number.isFinite(distanceKm)) return null;
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)} km`;
}
