/** Format a stay nightly price using the currency returned by Django. */
export function formatStayNightPrice(
  price: string | number | null | undefined,
  currency: string | null | undefined,
  period = "night",
): string {
  const numeric = Number(price);
  const amount = Number.isFinite(numeric) ? numeric.toFixed(2) : String(price ?? "").trim();
  const code = (currency ?? "").trim().toUpperCase();
  const suffix = period.trim() || "night";
  if (!amount) {
    return code ? `${code} / ${suffix}` : "";
  }
  return code ? `${amount} ${code} / ${suffix}` : `${amount} / ${suffix}`;
}

export function stayCityName(listing: {
  city?: string | { name?: string } | null;
  city_name?: string | null;
  suburb?: string | null;
  location?: { city?: { name?: string } | null; district?: { name?: string } | null } | null;
}): string {
  if (typeof listing.city === "string" && listing.city.trim()) return listing.city.trim();
  if (listing.city && typeof listing.city === "object" && listing.city.name) {
    return listing.city.name;
  }
  if (listing.city_name?.trim()) return listing.city_name.trim();
  if (listing.location?.city?.name) return listing.location.city.name;
  if (listing.suburb?.trim()) return listing.suburb.trim();
  if (listing.location?.district?.name) return listing.location.district.name;
  return "";
}
