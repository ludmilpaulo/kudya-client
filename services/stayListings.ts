export type StayListing = {
  id: number;
  title: string;
  city?: { name?: string } | string;
  city_name?: string;
  suburb?: string;
  country_code?: string;
  country_name?: string;
  price?: string | number;
  price_per_night?: string | number;
  currency?: string;
  price_label?: string;
  property_type?: string;
  property_type_display?: string;
  rating?: number | string;
  distance_km?: number | null;
  amenities?: string[];
  latitude?: number | null;
  longitude?: number | null;
  image_urls?: string[];
  stay_settings_summary?: {
    price_per_night?: string | number;
  } | null;
  location?: {
    city?: { name?: string };
    district?: { name?: string };
    region?: { name?: string };
    country?: { name?: string };
  };
};

export type StaySearchParams = {
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  propertyType?: string;
  guests?: string;
  checkIn?: string;
  checkOut?: string;
  amenities?: string;
  countryCode?: string;
  regionId?: string;
  cityId?: string;
  districtId?: string;
  latitude?: number;
  longitude?: number;
};

export function unwrapStayList(data: unknown): StayListing[] {
  if (Array.isArray(data)) return data as StayListing[];
  if (data && typeof data === "object") {
    const record = data as { results?: unknown; stays?: unknown };
    if (Array.isArray(record.results)) return record.results as StayListing[];
    if (Array.isArray(record.stays)) return record.stays as StayListing[];
  }
  return [];
}

export function stayCityLabel(item: StayListing): string {
  if (typeof item.city === "string" && item.city.trim()) return item.city.trim();
  if (item.city && typeof item.city === "object" && item.city.name) return item.city.name;
  if (item.city_name?.trim()) return item.city_name.trim();
  if (item.location?.city?.name) return item.location.city.name;
  if (item.suburb?.trim()) return item.suburb.trim();
  if (item.location?.district?.name) return item.location.district.name;
  return "";
}

export function stayNightAmount(item: StayListing): string | number | undefined {
  return item.stay_settings_summary?.price_per_night ?? item.price_per_night ?? item.price;
}

export function formatStayNightPrice(
  price: string | number | undefined,
  currency: string | undefined,
  nightLabel = "night",
): string {
  const value = typeof price === "number" ? price : parseFloat(String(price ?? ""));
  if (!Number.isFinite(value)) return "";
  const code = (currency || "").trim().toUpperCase();
  return `${value.toFixed(2)}${code ? ` ${code}` : ""} / ${nightLabel}`;
}

export function buildStaySearchQuery(params: StaySearchParams): URLSearchParams {
  const query = new URLSearchParams();
  query.set("purpose", "stay");
  query.set("page_size", "48");
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.minPrice) query.set("min_price", params.minPrice);
  if (params.maxPrice) query.set("max_price", params.maxPrice);
  if (params.propertyType) query.set("property_type", params.propertyType);
  if (params.guests) query.set("guests", params.guests);
  if (params.checkIn) query.set("check_in", params.checkIn);
  if (params.checkOut) query.set("check_out", params.checkOut);
  if (params.amenities) query.set("amenities", params.amenities);
  if (params.countryCode) query.set("country", params.countryCode);
  if (params.regionId) query.set("province", params.regionId);
  if (params.cityId) query.set("city", params.cityId);
  if (params.districtId) query.set("district", params.districtId);
  if (params.latitude != null && params.longitude != null) {
    query.set("latitude", String(params.latitude));
    query.set("longitude", String(params.longitude));
    query.set("ordering", "distance");
  }
  return query;
}

export async function fetchStayListings(
  baseUrl: string,
  params: StaySearchParams,
): Promise<StayListing[]> {
  const query = buildStaySearchQuery(params);
  const response = await fetch(`${baseUrl}/api/properties/search/?${query}`, {
    headers: { Accept: "application/json" },
  });
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const detail =
      data && typeof data === "object" && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : "Could not load stays.";
    throw new Error(detail);
  }
  return unwrapStayList(data);
}
