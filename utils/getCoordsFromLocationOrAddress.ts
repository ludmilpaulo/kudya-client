import axios from "axios"

export interface Coords {
  lat: number
  lng: number
}

export function parseLocationString(location: string): Coords | null {
  if (!location) return null
  const [lat, lng] = location.split(',').map(Number)
  if (isNaN(lat) || isNaN(lng)) return null
  return { lat, lng }
}

export async function geocodeAddress(address: string): Promise<Coords | null> {
  try {
    const url = "https://nominatim.openstreetmap.org/search"
    const params = { q: address, format: "json", limit: 1 }
    const resp = await axios.get(url, { params, headers: { "User-Agent": "KudyaApp/1.0" } })
    if (resp.data?.[0]) {
      return {
        lat: parseFloat(resp.data[0].lat),
        lng: parseFloat(resp.data[0].lon),
      }
    }
    return null
  } catch (e) {
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
