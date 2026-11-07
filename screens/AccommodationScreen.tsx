import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  RefreshControl,
  Modal,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useAppNavigation } from "../navigation/hooks";
import { baseAPI } from "../services/types";
import { useTranslation } from "../hooks/useTranslation";
import {
  fetchCities,
  fetchCountries,
  fetchDistricts,
  fetchRegions,
  resolveLocation,
  type LocationCity,
  type LocationCountry,
  type LocationDistrict,
  type LocationRegion,
  type ResolvedLocation,
} from "../services/locationsApi";
import { formatStayNightPrice, stayCityName } from "../utils/stayPrice";
import colors from "../configs/colors";

type StaySettingsSummary = {
  price_per_night?: string | number;
};

type StayListing = {
  id: number;
  title: string;
  city?: string | { name?: string };
  city_name?: string;
  suburb?: string;
  price?: string | number;
  currency?: string;
  rating?: number | string;
  amenities?: string[];
  property_type?: string;
  stay_settings_summary?: StaySettingsSummary | null;
  location?: {
    city?: { name?: string };
    district?: { name?: string };
    country?: { name?: string };
  };
};

type CatalogOption = { value: string; label: string };
type DiscoveryMode = "nearby" | "search";
type LocationPermission = "unknown" | "granted" | "denied" | "unavailable";
type UserCoords = { latitude: number; longitude: number };

const KUDYA_BLUE = colors.primary;

function unwrapList(data: unknown): StayListing[] {
  if (Array.isArray(data)) return data as StayListing[];
  if (data && typeof data === "object" && "results" in data) {
    const results = (data as { results: unknown }).results;
    return Array.isArray(results) ? (results as StayListing[]) : [];
  }
  return [];
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
    >
      <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextIdle]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function StayCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.skelTitle} />
      <View style={styles.skelCity} />
      <View style={styles.skelPrice} />
    </View>
  );
}

export default function AccommodationScreen() {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const [listings, setListings] = useState<StayListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [rating, setRating] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");
  const [amenities, setAmenities] = useState("");

  const [propertyTypes, setPropertyTypes] = useState<CatalogOption[]>([]);
  const [amenityOptions, setAmenityOptions] = useState<CatalogOption[]>([]);

  const [discoveryMode, setDiscoveryMode] = useState<DiscoveryMode>("search");
  const [coords, setCoords] = useState<UserCoords | null>(null);
  const [locationPermission, setLocationPermission] = useState<LocationPermission>("unknown");
  const [nearYou, setNearYou] = useState<ResolvedLocation | null>(null);
  const [locating, setLocating] = useState(false);

  const [countries, setCountries] = useState<LocationCountry[]>([]);
  const [regions, setRegions] = useState<LocationRegion[]>([]);
  const [cities, setCities] = useState<LocationCity[]>([]);
  const [districts, setDistricts] = useState<LocationDistrict[]>([]);
  const [countryCode, setCountryCode] = useState("");
  const [regionId, setRegionId] = useState("");
  const [cityId, setCityId] = useState("");
  const [districtId, setDistrictId] = useState("");

  useEffect(() => {
    void fetchCountries()
      .then(setCountries)
      .catch(() => setCountries([]));
    void fetch(`${baseAPI}/api/properties/property-types/`, { headers: { Accept: "application/json" } })
      .then((res) => res.json())
      .then((data: unknown) => {
        setPropertyTypes(Array.isArray(data) ? (data as CatalogOption[]) : []);
      })
      .catch(() => setPropertyTypes([]));
    void fetch(`${baseAPI}/api/properties/amenities/`, { headers: { Accept: "application/json" } })
      .then((res) => res.json())
      .then((data: unknown) => {
        if (!Array.isArray(data)) {
          setAmenityOptions([]);
          return;
        }
        setAmenityOptions(
          data
            .map((row) => {
              const item = row as { slug?: string; key?: string; name?: string; label?: string };
              return {
                value: String(item.slug ?? item.key ?? item.name ?? ""),
                label: String(item.label ?? item.name ?? item.slug ?? ""),
              };
            })
            .filter((item) => item.value),
        );
      })
      .catch(() => setAmenityOptions([]));
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

  useEffect(() => {
    if (!cityId || !/^\d+$/.test(cityId)) {
      setDistricts([]);
      return;
    }
    void fetchDistricts(Number(cityId))
      .then(setDistricts)
      .catch(() => setDistricts([]));
  }, [cityId]);

  const requestLocation = useCallback(async (): Promise<UserCoords | null> => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationPermission("denied");
        setCoords(null);
        setNearYou(null);
        setDiscoveryMode("search");
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
      setDiscoveryMode("search");
      return null;
    } finally {
      setLocating(false);
    }
  }, []);

  const load = useCallback(
    async (opts?: {
      silent?: boolean;
      forceCoords?: UserCoords | null;
      mode?: DiscoveryMode;
      reset?: boolean;
    }) => {
      const activeCoords = opts?.forceCoords !== undefined ? opts.forceCoords : coords;
      const mode = opts?.mode ?? discoveryMode;
      if (!opts?.silent) setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("purpose", "stay");
        params.set("page_size", "48");
        if (!opts?.reset) {
          if (search.trim()) params.set("search", search.trim());
          if (minPrice) params.set("min_price", minPrice);
          if (maxPrice) params.set("max_price", maxPrice);
          if (propertyType) params.set("property_type", propertyType);
          if (guests) params.set("guests", guests);
          if (checkIn) params.set("check_in", checkIn);
          if (checkOut) params.set("check_out", checkOut);
          if (amenities) params.set("amenities", amenities);
          if (countryCode) params.set("country", countryCode);
          if (regionId) params.set("province", regionId);
          if (cityId) params.set("city", cityId);
          if (districtId) params.set("district", districtId);
        }
        if (!opts?.reset && mode === "nearby" && activeCoords) {
          params.set("latitude", String(activeCoords.latitude));
          params.set("longitude", String(activeCoords.longitude));
          params.set("ordering", "distance");
        }

        const res = await fetch(`${baseAPI}/api/properties/search/?${params}`, {
          headers: { Accept: "application/json" },
        });
        const data: unknown = await res.json().catch(() => null);
        if (!res.ok) {
          const detail =
            data && typeof data === "object" && "detail" in data
              ? String((data as { detail: unknown }).detail)
              : t("stayLoadFailed", "Unable to load stays.");
          setListings([]);
          setError(detail);
          return;
        }
        const rows = unwrapList(data);
        const minRating = rating ? Number(rating) : 0;
        setListings(
          minRating
            ? rows.filter((row) => {
                const value = Number(row.rating ?? 0);
                return Number.isFinite(value) ? value >= minRating : true;
              })
            : rows,
        );
      } catch {
        setListings([]);
        setError(t("stayLoadFailed", "Unable to load stays."));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      search,
      minPrice,
      maxPrice,
      propertyType,
      guests,
      checkIn,
      checkOut,
      amenities,
      countryCode,
      regionId,
      cityId,
      districtId,
      discoveryMode,
      coords,
      rating,
      t,
    ],
  );

  useEffect(() => {
    void load();
    // Initial catalog load only; later refreshes go through Apply / Retry / pull-to-refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtersActive = useMemo(
    () =>
      Boolean(
        search ||
          minPrice ||
          maxPrice ||
          propertyType ||
          rating ||
          checkIn ||
          checkOut ||
          guests ||
          amenities ||
          countryCode ||
          regionId ||
          cityId ||
          districtId ||
          discoveryMode === "nearby",
      ),
    [
      search,
      minPrice,
      maxPrice,
      propertyType,
      rating,
      checkIn,
      checkOut,
      guests,
      amenities,
      countryCode,
      regionId,
      cityId,
      districtId,
      discoveryMode,
    ],
  );

  const clearFilters = useCallback(() => {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setPropertyType("");
    setRating("");
    setCheckIn("");
    setCheckOut("");
    setGuests("");
    setAmenities("");
    setCountryCode("");
    setRegionId("");
    setCityId("");
    setDistrictId("");
    setDiscoveryMode("search");
    setCoords(null);
    setNearYou(null);
  }, []);

  const applyFilters = useCallback(async () => {
    setShowFilters(false);
    let nextCoords = coords;
    let mode = discoveryMode;
    if (discoveryMode === "nearby") {
      nextCoords = await requestLocation();
      if (!nextCoords) {
        mode = "search";
      }
    }
    await load({ forceCoords: nextCoords, mode });
  }, [coords, discoveryMode, load, requestLocation]);

  const nearYouLabel = nearYou
    ? [nearYou.city?.name, nearYou.region?.name, nearYou.country?.name].filter(Boolean).join(", ")
    : "";

  const nightLabel = t("night", "night");

  const renderStay = ({ item }: { item: StayListing }) => {
    const cityName = stayCityName(item);
    const price = item.stay_settings_summary?.price_per_night ?? item.price ?? "";
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate("PropertyDetail", { propertyId: item.id })}
      >
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {cityName ? (
          <Text style={styles.cardCity} numberOfLines={1}>
            {cityName}
          </Text>
        ) : null}
        <Text style={styles.cardPrice}>{formatStayNightPrice(price, item.currency, nightLabel)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel={t("back", "Back")}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("accommodationTitle", "Book a Stay")}</Text>
        <TouchableOpacity
          onPress={() => setShowFilters(true)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel={t("filters", "Filters")}
          style={styles.filterBtn}
        >
          <Feather name="sliders" size={20} color={filtersActive ? KUDYA_BLUE : "#111827"} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.listPad}>
          <Text style={styles.loadingLabel}>{t("loadingStays", "Loading stays...")}</Text>
          <StayCardSkeleton />
          <StayCardSkeleton />
          <StayCardSkeleton />
          <StayCardSkeleton />
        </View>
      ) : error ? (
        <View style={styles.stateWrap}>
          <Text style={styles.stateTitle}>{error}</Text>
          <Text style={styles.stateHint}>
            {t("stayLoadFailedHint", "Please check your connection and try again.")}
          </Text>
          <TouchableOpacity onPress={() => void load()} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>{t("retry", "Retry")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={listings.length === 0 ? styles.emptyList : styles.listPad}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void load({ silent: true });
              }}
              tintColor={KUDYA_BLUE}
            />
          }
          ListEmptyComponent={
            <View style={styles.stateWrap}>
              <Text style={styles.stateTitle}>{t("noStaysFound", "No stays found")}</Text>
              <Text style={styles.stateHint}>
                {t("noStaysHint", "Try changing your location or filters.")}
              </Text>
              <TouchableOpacity
                onPress={() => setShowFilters(true)}
                style={styles.primaryBtn}
              >
                <Text style={styles.primaryBtnText}>{t("changeFilters", "Change filters")}</Text>
              </TouchableOpacity>
              {filtersActive ? (
                <TouchableOpacity
                  onPress={() => {
                    clearFilters();
                    void load({ forceCoords: null, mode: "search", reset: true });
                  }}
                  style={styles.secondaryBtn}
                >
                  <Text style={styles.secondaryBtnText}>{t("clearFilters", "Clear filters")}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          }
          renderItem={renderStay}
        />
      )}

      <Modal visible={showFilters} animationType="slide" onRequestClose={() => setShowFilters(false)}>
        <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => setShowFilters(false)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.backBtn}
            >
              <Feather name="x" size={22} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t("filters", "Filters")}</Text>
            <TouchableOpacity onPress={clearFilters} style={styles.filterBtn}>
              <Text style={styles.clearText}>{t("clearFilters", "Clear")}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.filterBody} keyboardShouldPersistTaps="handled">
            <Text style={styles.sectionLabel}>{t("location", "Location")}</Text>
            <View style={styles.chipRow}>
              <Chip
                label={locating ? t("locating", "Locating…") : t("nearMe", "Near me")}
                active={discoveryMode === "nearby"}
                onPress={() => setDiscoveryMode("nearby")}
              />
              <Chip
                label={t("searchManually", "Country / city")}
                active={discoveryMode === "search"}
                onPress={() => setDiscoveryMode("search")}
              />
            </View>
            {discoveryMode === "nearby" && nearYouLabel ? (
              <Text style={styles.hint}>{t("nearYou", "Near you")}: {nearYouLabel}</Text>
            ) : null}
            {locationPermission === "denied" || locationPermission === "unavailable" ? (
              <Text style={styles.warn}>
                {t(
                  "locationDeniedHint",
                  "Location is unavailable. Choose a country, province, and city instead.",
                )}
              </Text>
            ) : null}

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
              <Chip
                label={t("anyCountry", "Any country")}
                active={!countryCode}
                onPress={() => {
                  setCountryCode("");
                  setRegionId("");
                  setCityId("");
                  setDistrictId("");
                  setDiscoveryMode("search");
                }}
              />
              {countries.map((item) => (
                <Chip
                  key={item.id}
                  label={item.name}
                  active={countryCode === item.iso_alpha_2}
                  onPress={() => {
                    setCountryCode(item.iso_alpha_2);
                    setRegionId("");
                    setCityId("");
                    setDistrictId("");
                    setDiscoveryMode("search");
                  }}
                />
              ))}
            </ScrollView>

            {regions.length > 0 ? (
              <>
                <Text style={styles.sectionLabel}>{t("province", "Province / State")}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
                  {regions.map((item) => (
                    <Chip
                      key={item.id}
                      label={item.name}
                      active={regionId === String(item.id)}
                      onPress={() => {
                        setRegionId(String(item.id));
                        setCityId("");
                        setDistrictId("");
                      }}
                    />
                  ))}
                </ScrollView>
              </>
            ) : null}

            {cities.length > 0 ? (
              <>
                <Text style={styles.sectionLabel}>{t("city", "City")}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
                  {cities.map((item) => (
                    <Chip
                      key={item.id}
                      label={item.name}
                      active={cityId === String(item.id)}
                      onPress={() => {
                        setCityId(String(item.id));
                        setDistrictId("");
                      }}
                    />
                  ))}
                </ScrollView>
              </>
            ) : null}

            {districts.length > 0 ? (
              <>
                <Text style={styles.sectionLabel}>{t("area", "Area")}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
                  {districts.map((item) => (
                    <Chip
                      key={item.id}
                      label={item.name}
                      active={districtId === String(item.id)}
                      onPress={() => setDistrictId(String(item.id))}
                    />
                  ))}
                </ScrollView>
              </>
            ) : null}

            <Text style={styles.sectionLabel}>{t("searchStays", "Search stays")}</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={t("search", "Search")}
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />

            <Text style={styles.sectionLabel}>{t("priceRange", "Price range")}</Text>
            <View style={styles.row}>
              <TextInput
                value={minPrice}
                onChangeText={setMinPrice}
                placeholder={t("minPrice", "Min price")}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                style={[styles.input, styles.inputHalf]}
              />
              <TextInput
                value={maxPrice}
                onChangeText={setMaxPrice}
                placeholder={t("maxPrice", "Max price")}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                style={[styles.input, styles.inputHalf]}
              />
            </View>

            <Text style={styles.sectionLabel}>{t("accommodationType", "Accommodation type")}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
              <Chip
                label={t("anyType", "Any type")}
                active={propertyType === ""}
                onPress={() => setPropertyType("")}
              />
              {propertyTypes.map((item) => (
                <Chip
                  key={item.value}
                  label={item.label}
                  active={propertyType === item.value}
                  onPress={() => setPropertyType(item.value)}
                />
              ))}
            </ScrollView>

            <Text style={styles.sectionLabel}>{t("rating", "Rating")}</Text>
            <View style={styles.chipRow}>
              {["", "3", "4", "4.5"].map((value) => (
                <Chip
                  key={value || "any"}
                  label={value ? `${value}+` : t("anyRating", "Any")}
                  active={rating === value}
                  onPress={() => setRating(value)}
                />
              ))}
            </View>

            <Text style={styles.sectionLabel}>{t("availability", "Availability")}</Text>
            <View style={styles.row}>
              <TextInput
                value={checkIn}
                onChangeText={setCheckIn}
                placeholder={t("checkIn", "Check-in YYYY-MM-DD")}
                placeholderTextColor="#9CA3AF"
                style={[styles.input, styles.inputHalf]}
              />
              <TextInput
                value={checkOut}
                onChangeText={setCheckOut}
                placeholder={t("checkOut", "Check-out YYYY-MM-DD")}
                placeholderTextColor="#9CA3AF"
                style={[styles.input, styles.inputHalf]}
              />
            </View>
            <TextInput
              value={guests}
              onChangeText={setGuests}
              placeholder={t("guests", "Guests")}
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              style={styles.input}
            />

            {amenityOptions.length > 0 ? (
              <>
                <Text style={styles.sectionLabel}>{t("amenities", "Amenities")}</Text>
                <View style={styles.chipWrap}>
                  {amenityOptions.map((item) => {
                    const selected = amenities.split(",").includes(item.value);
                    return (
                      <Chip
                        key={item.value}
                        label={item.label}
                        active={selected}
                        onPress={() => {
                          const current = amenities.split(",").filter(Boolean);
                          const next = selected
                            ? current.filter((value) => value !== item.value)
                            : [...current, item.value];
                          setAmenities(next.join(","));
                        }}
                      />
                    );
                  })}
                </View>
              </>
            ) : null}
          </ScrollView>

          <View style={styles.applyBar}>
            <TouchableOpacity onPress={() => void applyFilters()} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>{t("showStays", "Show stays")}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F3F3F3",
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    backgroundColor: "#FAFAFA",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 2,
  },
  filterBtn: {
    minWidth: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  listPad: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 32,
  },
  emptyList: {
    flexGrow: 1,
    paddingHorizontal: 14,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  cardCity: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: KUDYA_BLUE,
    marginTop: 12,
  },
  loadingLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  skelTitle: {
    height: 14,
    width: "78%",
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  skelCity: {
    height: 14,
    width: "38%",
    borderRadius: 4,
    backgroundColor: "#EDEDED",
    marginTop: 8,
  },
  skelPrice: {
    height: 14,
    width: "46%",
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginTop: 14,
  },
  stateWrap: {
    paddingHorizontal: 24,
    paddingTop: 48,
    alignItems: "center",
  },
  stateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
  stateHint: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  primaryBtn: {
    backgroundColor: KUDYA_BLUE,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    alignSelf: "stretch",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  secondaryBtn: {
    marginTop: 12,
    paddingVertical: 10,
  },
  secondaryBtnText: {
    color: KUDYA_BLUE,
    fontSize: 14,
    fontWeight: "600",
  },
  filterBody: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: KUDYA_BLUE,
    borderColor: KUDYA_BLUE,
  },
  chipIdle: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
  },
  chipText: {
    fontSize: 13,
  },
  chipTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  chipTextIdle: {
    color: "#374151",
  },
  hScroll: {
    flexGrow: 0,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  inputHalf: {
    flex: 1,
  },
  hint: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
  },
  warn: {
    fontSize: 13,
    color: "#B45309",
    marginBottom: 8,
  },
  clearText: {
    fontSize: 13,
    fontWeight: "600",
    color: KUDYA_BLUE,
  },
  applyBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FAFAFA",
  },
});
