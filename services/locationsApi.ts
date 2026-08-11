import { baseAPI } from "./types";

export type LocationCountry = {
  id: number;
  name: string;
  iso_alpha_2: string;
  flag_url: string;
  flag_icon: string;
};

export type LocationRegion = {
  id: number;
  name: string;
  country_id: number;
};

export type LocationCity = {
  id: number;
  name: string;
  country_id: number;
  region_id: number | null;
  latitude: number | null;
  longitude: number | null;
};

export type NamedRef = {
  id: number | null;
  name: string;
  iso_alpha_2?: string;
  iso_code?: string;
  flag_url?: string;
  flag_icon?: string;
};

export type ResolvedLocation = {
  country: NamedRef;
  region: NamedRef;
  city: NamedRef;
  distance_km?: number;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asNamedRef(value: unknown): NamedRef {
  const row = asRecord(value);
  return {
    id: typeof row.id === "number" ? row.id : null,
    name: typeof row.name === "string" ? row.name : "",
    iso_alpha_2: typeof row.iso_alpha_2 === "string" ? row.iso_alpha_2 : undefined,
    iso_code: typeof row.iso_code === "string" ? row.iso_code : undefined,
    flag_url: typeof row.flag_url === "string" ? row.flag_url : undefined,
    flag_icon: typeof row.flag_icon === "string" ? row.flag_icon : undefined,
  };
}

async function locationsFetch(path: string): Promise<unknown> {
  const response = await fetch(`${baseAPI}/api/locations${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Location request failed (${response.status})`);
  }
  return response.json();
}

export async function fetchCountries(): Promise<LocationCountry[]> {
  const data = await locationsFetch("/countries/");
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const row = asRecord(item);
    return {
      id: Number(row.id) || 0,
      name: typeof row.name === "string" ? row.name : "",
      iso_alpha_2: typeof row.iso_alpha_2 === "string" ? row.iso_alpha_2 : "",
      flag_url: typeof row.flag_url === "string" ? row.flag_url : "",
      flag_icon: typeof row.flag_icon === "string" ? row.flag_icon : "",
    };
  });
}

export async function fetchRegions(countryId: number): Promise<LocationRegion[]> {
  const data = await locationsFetch(`/countries/${countryId}/regions/`);
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const row = asRecord(item);
    return {
      id: Number(row.id) || 0,
      name: typeof row.name === "string" ? row.name : "",
      country_id: Number(row.country_id) || countryId,
    };
  });
}

export async function fetchCities(regionId: number): Promise<LocationCity[]> {
  const data = await locationsFetch(`/regions/${regionId}/cities/`);
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const row = asRecord(item);
    return {
      id: Number(row.id) || 0,
      name: typeof row.name === "string" ? row.name : "",
      country_id: Number(row.country_id) || 0,
      region_id: typeof row.region_id === "number" ? row.region_id : null,
      latitude: typeof row.latitude === "number" ? row.latitude : null,
      longitude: typeof row.longitude === "number" ? row.longitude : null,
    };
  });
}

export async function resolveLocation(latitude: number, longitude: number): Promise<ResolvedLocation> {
  const data = await locationsFetch(
    `/resolve/?lat=${encodeURIComponent(String(latitude))}&lng=${encodeURIComponent(String(longitude))}`,
  );
  const row = asRecord(data);
  return {
    country: asNamedRef(row.country),
    region: asNamedRef(row.region),
    city: asNamedRef(row.city),
    distance_km:
      typeof row.distance_km === "number"
        ? row.distance_km
        : row.distance_km != null
          ? Number(row.distance_km) || undefined
          : undefined,
  };
}
