import axios from "axios"
import * as Location from "expo-location"

export interface Coords {
  lat: number
  lng: number
}

export function formatGeocodedAddress(place: Location.LocationGeocodedAddress): string {
  const parts = [
    place.name,
    place.streetNumber,
    place.street,
    place.district,
    place.subregion,
    place.city,
    place.region,
    place.postalCode,
  ].filter((part, index, arr) => Boolean(part) && arr.indexOf(part) === index)
  return parts.join(", ")
}

export async function reverseGeocodeLabel(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  try {
    const places = await Location.reverseGeocodeAsync({ latitude, longitude })
    if (!places[0]) return null
    const label = formatGeocodedAddress(places[0])
    return label || null
  } catch {
    return null
  }
}

export function parseLocationString(location: string): Coords | null {
  if (!location) return null
  const [lat, lng] = location.split(',').map(Number)
  if (isNaN(lat) || isNaN(lng)) return null
  return { lat, lng }
}

type GeocodeOptions = {
  near?: Coords
  /** ISO country hint — only restricts search when restrictToCountry is true */
  countryCode?: string
  restrictToCountry?: boolean
}

export async function geocodeAddress(
  address: string,
  options?: GeocodeOptions,
): Promise<Coords | null> {
  try {
    const url = "https://nominatim.openstreetmap.org/search"
    const params: Record<string, string | number> = {
      q: address,
      format: "json",
      limit: 1,
      addressdetails: 1,
    }
    if (options?.countryCode && options.restrictToCountry) {
      params.countrycodes = options.countryCode.toLowerCase()
    }
    if (options?.near) {
      const delta = 0.35
      const { lat, lng } = options.near
      params.viewbox = `${lng - delta},${lat + delta},${lng + delta},${lat - delta}`
      params.bounded = 0
    }
    const resp = await axios.get(url, {
      params,
      headers: { "User-Agent": "KudyaApp/1.0" },
      timeout: 12000,
    })
    if (resp.data?.[0]) {
      return {
        lat: parseFloat(resp.data[0].lat),
        lng: parseFloat(resp.data[0].lon),
      }
    }
    return null
  } catch {
    return null
  }
}

export async function getCoordsFromLocationOrAddress(
  location?: string,
  address?: string
): Promise<Coords | null> {
  const coords = location ? parseLocationString(location) : null
  if (coords) return coords
  if (address) return await geocodeAddress(address)
  return null
}
