import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  RefreshControl,
  ScrollView,
} from "react-native";
import * as Location from "expo-location";
import { useAppNavigation } from "../navigation/hooks";
import { baseAPI } from "../services/types";
import { formatCurrency, getCurrencyForCountry, type CurrencyCode } from "../utils/currency";
import { useUserRegion } from "../hooks/useUserRegion";
import { MaterialIcons } from "@expo/vector-icons";
import tw from "twrnc";
import { useTranslation } from "../hooks/useTranslation";
import {
  fetchCities,
  fetchCountries,
  fetchRegions,
  resolveLocation,
  type LocationCity,
  type LocationCountry,
  type LocationRegion,
  type ResolvedLocation,
} from "../services/locationsApi";
import { formatDistanceKm } from "../utils/propertyDirections";

type Purpose = "rent" | "sale";
type DiscoveryMode = "nearby" | "search";
type LocationPermission = "unknown" | "granted" | "denied" | "unavailable";

type PropertyLocationCountry = {
  flag_url?: string;
  flag_icon?: string;
  name?: string;
};

type Property = {
  id: number;
  title: string;
  city: string;
  suburb?: string;
  listing_type: string;
  listing_type_display?: string;
  purpose_display?: string;
  property_type_display?: string;
  price: string;
  price_label?: string;
  currency?: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number | null;
  image_urls: string[];
  distance_km?: number | null;
  location?: {
    country?: PropertyLocationCountry;
    city?: { name?: string };
    district?: { name?: string };
  };
};

type UserCoords = { latitude: number; longitude: number };

function mediaUrl(path?: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    try {
      const parsed = new URL(path);
      if (
        parsed.pathname.startsWith("/media/") ||
        /localhost|127\.0\.0\.1|10\.0\.2\.2|192\.168\.\d+\.\d+/.test(parsed.hostname)
      ) {
        const api = new URL(baseAPI);
        return `${api.origin}${parsed.pathname}${parsed.search}`;
      }
    } catch {
      return path;
    }
    return path;
  }
  return `${baseAPI}${path.startsWith("/") ? path : `/${path}`}`;
}

function unwrapList(data: unknown): Property[] {
  if (Array.isArray(data)) return data as Property[];
  if (data && typeof data === "object" && "results" in data) {
    const results = (data as { results: unknown }).results;
    return Array.isArray(results) ? (results as Property[]) : [];
  }
  return [];
}

export default function PropertiesScreen() {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const { region: regionCode } = useUserRegion();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purpose, setPurpose] = useState<Purpose>("rent");
  const [search, setSearch] = useState("");
  const [cityText, setCityText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedCity, setDebouncedCity] = useState("");
  const [discoveryMode, setDiscoveryMode] = useState<DiscoveryMode>("nearby");
  const [coords, setCoords] = useState<UserCoords | null>(null);
  const [locationPermission, setLocationPermission] = useState<LocationPermission>("unknown");
  const [nearYou, setNearYou] = useState<ResolvedLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [countries, setCountries] = useState<LocationCountry[]>([]);
  const [regions, setRegions] = useState<LocationRegion[]>([]);
  const [cities, setCities] = useState<LocationCity[]>([]);
  const [countryCode, setCountryCode] = useState("");
  const [regionId, setRegionId] = useState("");
  const [cityId, setCityId] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedCity(cityText.trim()), 350);
    return () => clearTimeout(id);
  }, [cityText]);

  useEffect(() => {
    void fetchCountries()
      .then(setCountries)
      .catch(() => setCountries([]));
  }, []);

  useEffect(() => {
    const selected = countries.find(
      (c) => c.iso_alpha_2.toUpperCase() === countryCode.toUpperCase() || String(c.id) === countryCode,
    );
    if (!selected) {
      setRegions([]);
      return;
    }
    void fetchRegions(selected.id)
      .then(setRegions)
      .catch(() => setRegions([]));
  }, [countries, countryCode]);

  useEffect(() => {
    if (!regionId || !/^\d+$/.test(regionId)) {
      setCities([]);
      return;
    }
    void fetchCities(Number(regionId))
      .then(setCities)
      .catch(() => setCities([]));
  }, [regionId]);

  const requestLocation = useCallback(async (): Promise<UserCoords | null> => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationPermission("denied");
        setCoords(null);
        setNearYou(null);
        return null;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const next = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setCoords(next);
      setLocationPermission("granted");
      try {
        setNearYou(await resolveLocation(next.latitude, next.longitude));
      } catch {
        setNearYou(null);
      }
      return next;
    } catch {
      setLocationPermission("unavailable");
      setCoords(null);
      setNearYou(null);
      return null;
    } finally {
      setLocating(false);
    }
  }, []);

  useEffect(() => {
    if (discoveryMode === "nearby") {
      void requestLocation();
    }
  }, [discoveryMode, requestLocation]);

  const load = useCallback(
    async (opts?: { silent?: boolean; forceCoords?: UserCoords | null }) => {
      const activeCoords = opts?.forceCoords !== undefined ? opts.forceCoords : coords;
      if (!opts?.silent) setLoading(true);
      setError(null);

      try {
        let url: string;
        if (discoveryMode === "nearby") {
          if (!activeCoords) {
            setProperties([]);
            return;
          }
          const nearby = new URLSearchParams();
          nearby.set("latitude", String(activeCoords.latitude));
          nearby.set("longitude", String(activeCoords.longitude));
          nearby.set("purpose", purpose);
          nearby.set("page_size", "48");
          url = `${baseAPI}/api/properties/nearby/?${nearby}`;
        } else {
          const params = new URLSearchParams();
          params.set("purpose", purpose);
          if (debouncedSearch) params.set("search", debouncedSearch);
          if (countryCode) params.set("country", countryCode);
          if (regionId) params.set("region", regionId);
          if (cityId) params.set("city", cityId);
          else if (debouncedCity) params.set("city", debouncedCity);
          if (activeCoords) {
            params.set("latitude", String(activeCoords.latitude));
            params.set("longitude", String(activeCoords.longitude));
            params.set("ordering", "distance");
          }
          params.set("page_size", "48");
          url = `${baseAPI}/api/properties/search/?${params}`;
        }

        const res = await fetch(url, { headers: { Accept: "application/json" } });
        const data: unknown = await res.json().catch(() => null);
        if (!res.ok) {
          const detail =
            data && typeof data === "object" && "detail" in data
              ? String((data as { detail: unknown }).detail)
              : t("propertiesLoadFailed", "Could not load properties.");
          setProperties([]);
          setError(detail);
          return;
        }
        setProperties(unwrapList(data));
      } catch {
        setProperties([]);
        setError(t("propertiesLoadFailed", "Could not load properties. Check your connection."));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      purpose,
      debouncedSearch,
      debouncedCity,
      countryCode,
      regionId,
      cityId,
      discoveryMode,
      coords,
      t,
    ],
  );

  useEffect(() => {
    if (discoveryMode === "nearby" && locationPermission === "unknown") return;
    if (discoveryMode === "nearby" && locating) return;
    void load();
  }, [load, discoveryMode, locationPermission, locating]);

  const currencyCode = getCurrencyForCountry(regionCode);
  const nearYouLabel = nearYou
    ? [nearYou.city?.name, nearYou.region?.name, nearYou.country?.name].filter(Boolean).join(", ")
    : "";
  const resultLabel = useMemo(() => {
    if (loading || locating) return "";
    if (error) return "";
    const n = properties.length;
    return n === 1
      ? t("onePropertyFound")
      : t("nPropertiesFound", undefined, { count: n });
  }, [loading, locating, error, properties.length, t]);

  const showLocationFallback =
    discoveryMode === "nearby" &&
    (locationPermission === "denied" || locationPermission === "unavailable") &&
    !coords;

  const renderProperty = ({ item }: { item: Property }) => {
    const cover = mediaUrl(item.image_urls?.[0]);
    const location = [
      item.location?.district?.name || item.suburb,
      item.location?.city?.name || item.city,
    ]
      .filter(Boolean)
      .join(", ");
    const displayCurrency = (item.currency || currencyCode) as CurrencyCode;
    const flagUrl = item.location?.country?.flag_url
      ? mediaUrl(item.location.country.flag_url)
      : "";
    const flagIcon = item.location?.country?.flag_icon;
    const distanceLabel = formatDistanceKm(item.distance_km);
    return (
      <TouchableOpacity
        style={tw`bg-white rounded-2xl overflow-hidden mb-4 border border-slate-200`}
        onPress={() => navigation.navigate("PropertyDetail", { propertyId: item.id })}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={item.title}
      >
        <View style={tw`aspect-video bg-slate-100`}>
          {cover ? (
            <Image source={{ uri: cover }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <View style={tw`flex-1 items-center justify-center`}>
              <MaterialIcons name="home" size={56} color="#cbd5e1" />
            </View>
          )}
          <View style={tw`absolute bottom-0 left-0 right-0 px-3 py-2 bg-black/55`}>
            <Text style={tw`text-white text-lg font-bold`}>
              {formatCurrency(parseFloat(item.price), displayCurrency)}
              <Text style={tw`text-xs font-normal text-slate-200`}>
                {item.listing_type === "rent_daily"
                  ? ` / ${t("perDay")}`
                  : item.listing_type === "rent_monthly"
                    ? ` / ${t("perMonth")}`
                    : item.listing_type === "buy"
                      ? ""
                      : item.price_label
                        ? ` / ${item.price_label.replace(/^per\s+/i, "")}`
                        : ""}
              </Text>
            </Text>
          </View>
          <View style={tw`absolute top-2 left-2 px-2 py-1 bg-white rounded-md`}>
            <Text style={tw`text-slate-800 text-xs font-bold uppercase`}>
              {item.listing_type === "buy" ? t("forSale") : t("forRent")}
            </Text>
          </View>
          {distanceLabel ? (
            <View style={tw`absolute top-2 right-2 px-2 py-1 bg-slate-900/85 rounded-md`}>
              <Text style={tw`text-white text-xs font-bold`}>{distanceLabel}</Text>
            </View>
          ) : null}
        </View>
        <View style={tw`p-4`}>
          <Text style={tw`font-semibold text-slate-900 text-base`} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={tw`flex-row items-center mt-0.5`}>
            {flagUrl ? (
              <Image source={{ uri: flagUrl }} style={tw`w-5 h-3 rounded-sm mr-1.5`} />
            ) : flagIcon ? (
              <Text style={tw`mr-1`}>{flagIcon}</Text>
            ) : null}
            <Text style={tw`text-sm text-slate-500 flex-1`} numberOfLines={1}>
              {location}
            </Text>
          </View>
          <View style={tw`flex-row gap-3 mt-2 flex-wrap`}>
            {item.bedrooms > 0 && (
              <Text style={tw`text-sm text-slate-600`}>
                {item.bedrooms} {t("bedShort")}
              </Text>
            )}
            {item.bathrooms > 0 && (
              <Text style={tw`text-sm text-slate-600`}>
                {item.bathrooms} {t("bathShort")}
              </Text>
            )}
            {item.area_sqm ? <Text style={tw`text-sm text-slate-600`}>{item.area_sqm} m²</Text> : null}
            {item.property_type_display ? (
              <Text style={tw`text-sm text-slate-400 ml-auto`}>{item.property_type_display}</Text>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={tw`flex-1 bg-slate-100`}>
      <View style={tw`bg-slate-900 px-4 pt-12 pb-5`}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={tw`mb-3 flex-row items-center self-start`}
          accessibilityRole="button"
          accessibilityLabel={t("back", "Back")}
        >
          <MaterialIcons name="arrow-back" size={22} color="#e2e8f0" />
          <Text style={tw`text-slate-300 ml-1 text-sm`}>{t("back", "Back")}</Text>
        </TouchableOpacity>
        <Text style={tw`text-xs font-bold uppercase tracking-widest text-amber-400`}>
          {t("kudyaPropertiesBrand")}
        </Text>
        <Text style={tw`text-2xl font-bold text-white mt-1`}>{t("Properties")}</Text>
        <Text style={tw`text-slate-300 mt-1 text-sm`}>{t("rentOrBuy")}</Text>
        {discoveryMode === "nearby" && nearYouLabel ? (
          <View style={tw`flex-row items-center mt-2`}>
            {nearYou?.country?.flag_url ? (
              <Image
                source={{ uri: mediaUrl(nearYou.country.flag_url) }}
                style={tw`w-5 h-3 rounded-sm mr-2`}
              />
            ) : null}
            <Text style={tw`text-amber-100 text-sm`}>
              {t("nearYou", "Near you")}: {nearYouLabel}
            </Text>
          </View>
        ) : null}

        <View style={tw`flex-row gap-2 mt-4`}>
          <TouchableOpacity
            onPress={() => {
              setDiscoveryMode("nearby");
              void requestLocation().then((next) => {
                if (next) void load({ forceCoords: next });
              });
            }}
            style={[
              tw`flex-row items-center px-3 py-2 rounded-lg`,
              discoveryMode === "nearby" ? tw`bg-amber-500` : tw`bg-white/10`,
            ]}
          >
            <MaterialIcons
              name="my-location"
              size={16}
              color={discoveryMode === "nearby" ? "#0f172a" : "#fff"}
            />
            <Text
              style={[
                tw`ml-1 text-sm font-semibold`,
                discoveryMode === "nearby" ? tw`text-slate-900` : tw`text-white`,
              ]}
            >
              {locating ? t("locating", "Locating…") : t("nearby", "Nearby")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setDiscoveryMode("search");
              setShowFilters(true);
            }}
            style={[
              tw`px-3 py-2 rounded-lg`,
              discoveryMode === "search" ? tw`bg-amber-500` : tw`bg-white/10`,
            ]}
          >
            <Text
              style={[
                tw`text-sm font-semibold`,
                discoveryMode === "search" ? tw`text-slate-900` : tw`text-white`,
              ]}
            >
              {t("searchManually", "Search manually")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={tw`flex-row bg-white/10 rounded-xl p-1 mt-4`}>
          {(
            [
              { value: "rent" as Purpose, label: t("forRent") },
              { value: "sale" as Purpose, label: t("forSale") },
            ] as const
          ).map((tab) => (
            <TouchableOpacity
              key={tab.value}
              onPress={() => setPurpose(tab.value)}
              style={[
                tw`flex-1 py-2.5 rounded-lg items-center`,
                purpose === tab.value ? tw`bg-amber-500` : undefined,
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: purpose === tab.value }}
            >
              <Text
                style={[
                  tw`font-semibold text-sm`,
                  purpose === tab.value ? tw`text-slate-900` : tw`text-white`,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={tw`mt-3 bg-white rounded-xl px-4 py-3 text-slate-800`}
          placeholder={t("searchPropertiesPlaceholder")}
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={(value) => {
            setSearch(value);
            setDiscoveryMode("search");
          }}
          returnKeyType="search"
        />
        <TouchableOpacity
          onPress={() => setShowFilters((v) => !v)}
          style={tw`mt-2 flex-row items-center self-start`}
        >
          <MaterialIcons name="tune" size={18} color="#cbd5e1" />
          <Text style={tw`text-slate-300 ml-1 text-sm`}>
            {showFilters ? t("hideFilters", "Hide filters") : t("filters", "Filters")}
          </Text>
        </TouchableOpacity>

        {showFilters ? (
          <View style={tw`mt-3`}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`mb-2`}>
              <TouchableOpacity
                onPress={() => {
                  setCountryCode("");
                  setRegionId("");
                  setCityId("");
                  setDiscoveryMode("search");
                }}
                style={[
                  tw`mr-2 px-3 py-2 rounded-full border`,
                  !countryCode ? tw`bg-amber-500 border-amber-500` : tw`bg-white/10 border-white/20`,
                ]}
              >
                <Text style={!countryCode ? tw`text-slate-900 text-xs font-semibold` : tw`text-white text-xs`}>
                  {t("anyCountry", "Any country")}
                </Text>
              </TouchableOpacity>
              {countries.map((c) => {
                const code = c.iso_alpha_2 || String(c.id);
                const active = countryCode === code;
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => {
                      setCountryCode(code);
                      setRegionId("");
                      setCityId("");
                      setDiscoveryMode("search");
                    }}
                    style={[
                      tw`mr-2 px-3 py-2 rounded-full border flex-row items-center`,
                      active ? tw`bg-amber-500 border-amber-500` : tw`bg-white/10 border-white/20`,
                    ]}
                  >
                    {c.flag_url ? (
                      <Image source={{ uri: mediaUrl(c.flag_url) }} style={tw`w-4 h-3 rounded-sm mr-1`} />
                    ) : c.flag_icon ? (
                      <Text style={tw`mr-1`}>{c.flag_icon}</Text>
                    ) : null}
                    <Text style={active ? tw`text-slate-900 text-xs font-semibold` : tw`text-white text-xs`}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {regions.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`mb-2`}>
                <TouchableOpacity
                  onPress={() => {
                    setRegionId("");
                    setCityId("");
                  }}
                  style={[
                    tw`mr-2 px-3 py-2 rounded-full border`,
                    !regionId ? tw`bg-white border-white` : tw`bg-white/10 border-white/20`,
                  ]}
                >
                  <Text style={!regionId ? tw`text-slate-900 text-xs` : tw`text-white text-xs`}>
                    {t("anyRegion", "Any region")}
                  </Text>
                </TouchableOpacity>
                {regions.map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    onPress={() => {
                      setRegionId(String(r.id));
                      setCityId("");
                      setDiscoveryMode("search");
                    }}
                    style={[
                      tw`mr-2 px-3 py-2 rounded-full border`,
                      regionId === String(r.id)
                        ? tw`bg-white border-white`
                        : tw`bg-white/10 border-white/20`,
                    ]}
                  >
                    <Text
                      style={
                        regionId === String(r.id) ? tw`text-slate-900 text-xs` : tw`text-white text-xs`
                      }
                    >
                      {r.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : null}
            {cities.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`mb-2`}>
                <TouchableOpacity
                  onPress={() => setCityId("")}
                  style={[
                    tw`mr-2 px-3 py-2 rounded-full border`,
                    !cityId ? tw`bg-white border-white` : tw`bg-white/10 border-white/20`,
                  ]}
                >
                  <Text style={!cityId ? tw`text-slate-900 text-xs` : tw`text-white text-xs`}>
                    {t("anyCity", "Any city")}
                  </Text>
                </TouchableOpacity>
                {cities.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => {
                      setCityId(String(c.id));
                      setCityText("");
                      setDiscoveryMode("search");
                    }}
                    style={[
                      tw`mr-2 px-3 py-2 rounded-full border`,
                      cityId === String(c.id)
                        ? tw`bg-white border-white`
                        : tw`bg-white/10 border-white/20`,
                    ]}
                  >
                    <Text
                      style={
                        cityId === String(c.id) ? tw`text-slate-900 text-xs` : tw`text-white text-xs`
                      }
                    >
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : null}
            <TextInput
              style={tw`bg-white rounded-xl px-4 py-3 text-slate-800`}
              placeholder={t("cityPlaceholder")}
              placeholderTextColor="#94a3b8"
              value={cityText}
              onChangeText={(value) => {
                setCityText(value);
                setCityId("");
                setDiscoveryMode("search");
              }}
              returnKeyType="search"
            />
          </View>
        ) : null}

        {resultLabel ? <Text style={tw`text-slate-400 text-xs mt-3`}>{resultLabel}</Text> : null}
      </View>

      {showLocationFallback ? (
        <View style={tw`flex-1 items-center justify-center px-8`}>
          <MaterialIcons name="location-off" size={64} color="#f59e0b" />
          <Text style={tw`text-slate-800 text-center mt-4 font-semibold text-lg`}>
            {t("locationNeeded", "Enable location to see homes near you")}
          </Text>
          <Text style={tw`text-slate-500 text-center mt-2 text-sm`}>
            {t(
              "locationPermissionDenied",
              "Location permission was denied. Enable it, or search by country and city.",
            )}
          </Text>
          <TouchableOpacity
            onPress={() => {
              void requestLocation().then((next) => {
                if (next) {
                  setDiscoveryMode("nearby");
                  void load({ forceCoords: next });
                }
              });
            }}
            style={tw`mt-5 bg-slate-900 px-5 py-3 rounded-xl`}
          >
            <Text style={tw`text-white font-semibold`}>{t("enableLocation", "Enable location")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setDiscoveryMode("search");
              setShowFilters(true);
            }}
            style={tw`mt-3 border border-slate-300 bg-white px-5 py-3 rounded-xl`}
          >
            <Text style={tw`text-slate-800 font-semibold`}>
              {t("searchManually", "Search manually")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : loading && properties.length === 0 ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={tw`text-slate-600 mt-3`}>{t("loadingProperties")}</Text>
        </View>
      ) : error ? (
        <View style={tw`flex-1 items-center justify-center px-8`}>
          <MaterialIcons name="wifi-off" size={64} color="#cbd5e1" />
          <Text style={tw`text-slate-700 text-center mt-4 font-semibold`}>
            {t("propertiesUnavailable", "Properties unavailable")}
          </Text>
          <Text style={tw`text-slate-500 text-center mt-2 text-sm`}>{error}</Text>
          <TouchableOpacity
            onPress={() => void load()}
            style={tw`mt-5 bg-amber-500 px-5 py-3 rounded-xl`}
            accessibilityRole="button"
          >
            <Text style={tw`text-slate-900 font-semibold`}>{t("retry", "Retry")}</Text>
          </TouchableOpacity>
        </View>
      ) : properties.length === 0 ? (
        <View style={tw`flex-1 items-center justify-center px-8`}>
          <MaterialIcons name="home" size={80} color="#cbd5e1" />
          <Text style={tw`text-slate-700 text-center mt-4 font-semibold`}>
            {t("noPropertiesFound")}
          </Text>
          <Text style={tw`text-slate-500 text-center mt-2 text-sm`}>
            {purpose === "sale" ? t("tryRentTab") : t("trySaleTab")}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setSearch("");
              setCityText("");
              setCountryCode("");
              setRegionId("");
              setCityId("");
              setPurpose(purpose === "rent" ? "sale" : "rent");
            }}
            style={tw`mt-5 bg-slate-900 px-5 py-3 rounded-xl`}
          >
            <Text style={tw`text-white font-semibold`}>
              {purpose === "rent" ? t("forSale") : t("forRent")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          style={tw`flex-1`}
          data={properties}
          renderItem={renderProperty}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={tw`p-4 pb-24`}
          initialNumToRender={8}
          windowSize={7}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                if (discoveryMode === "nearby") {
                  void requestLocation().then((next) => void load({ silent: true, forceCoords: next }));
                } else {
                  void load({ silent: true });
                }
              }}
              tintColor="#f59e0b"
            />
          }
        />
      )}
    </View>
  );
}
