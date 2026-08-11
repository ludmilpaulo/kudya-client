import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useSelector } from "react-redux";
import { useAppNavigation, useAppRoute } from "../navigation/hooks";
import { baseAPI } from "../services/types";
import { formatCurrency, getCurrencyForCountry } from "../utils/currency";
import { useUserRegion } from "../hooks/useUserRegion";
import { MaterialIcons } from "@expo/vector-icons";
import tw from "twrnc";
import { useTranslation } from "../hooks/useTranslation";
import type { RootState } from "../redux/store";
import {
  getPropertyMapCoords,
  openPropertyDirections,
  toMapCoords,
} from "../utils/propertyDirections";
import StayBookingSheet from "../components/properties/StayBookingSheet";
import {
  resolvePropertyPurpose,
  type PropertyPurpose,
  type StayBooking,
} from "../services/stayBookings";

type AmenityDetail = { key: string; name: string; icon?: string };

type PropertyLocation = {
  country?: {
    name?: string;
    flag_url?: string;
    flag_icon?: string;
  };
  region?: { name?: string };
  city?: { name?: string };
  district?: { name?: string };
  latitude?: number | null;
  longitude?: number | null;
  approximate_latitude?: number | null;
  approximate_longitude?: number | null;
  show_exact_address?: boolean;
};

type Property = {
  id: number;
  title: string;
  description: string;
  address: string;
  public_address?: string;
  city: string;
  suburb?: string;
  listing_type: string;
  listing_type_display?: string;
  purpose?: PropertyPurpose | string;
  purpose_display?: string;
  property_type_display?: string;
  price: string;
  price_label?: string;
  currency?: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number | null;
  amenities: string[];
  amenity_details?: AmenityDetail[];
  image_urls: string[];
  is_favorited?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  can_get_directions?: boolean;
  location?: PropertyLocation;
};

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

export function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export default function PropertyDetailScreen() {
  const route = useAppRoute<"PropertyDetail">();
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const { region: regionCode } = useUserRegion();
  const token = useSelector((state: RootState) => state.auth.token);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [staySheetOpen, setStaySheetOpen] = useState(false);

  const propertyId = route.params?.propertyId;

  useEffect(() => {
    if (!propertyId) {
      setLoading(false);
      setProperty(null);
      return;
    }
    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    fetch(`${baseAPI}/properties/${propertyId}/`, { headers, signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Property | null) => {
        setProperty(data);
        setFavorited(Boolean(data?.is_favorited));
        setActiveImage(0);
        if (data) {
          const purpose = resolvePropertyPurpose(data.purpose, data.listing_type);
          setMessage(
            purpose === "sale"
              ? `I'm interested in making an offer on "${data.title}".`
              : "",
          );
        }
      })
      .catch(() => setProperty(null))
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [propertyId, token]);

  const currencyCode = getCurrencyForCountry(regionCode);

  const toggleFavorite = async () => {
    if (!property) return;
    if (!token) {
      Alert.alert(t("loginRequired") || "Sign in", t("loginToEnquire") || "Please sign in to save listings.");
      return;
    }
    try {
      const res = await fetch(`${baseAPI}/properties/${property.id}/favorite/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setFavorited(Boolean(data.favorited));
    } catch {
      Alert.alert(t("error") || "Error");
    }
  };

  const submitEnquiry = async () => {
    if (!property) return;
    if (!token) {
      Alert.alert(t("loginRequired") || "Sign in", t("loginToEnquire") || "Please sign in to send an enquiry.");
      return;
    }
    if (message.trim().length < 10) {
      Alert.alert(t("enquiryMessageTooShort") || "Please write a short message.");
      return;
    }
    setSubmitting(true);
    try {
      const purpose = resolvePropertyPurpose(property.purpose, property.listing_type);
      const enquiryType = purpose === "sale" ? "offer" : "rental_application";
      const res = await fetch(`${baseAPI}/properties/${property.id}/enquiry/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enquiry_type: enquiryType, message: message.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(String((data as { detail?: unknown }).detail || t("enquiryFailed") || "Failed"));
      }
      Alert.alert(t("enquirySent") || "Sent", t("enquirySentMessage") || "Your enquiry was sent to the partner.");
    } catch (err) {
      Alert.alert(t("enquiryFailed") || "Failed", err instanceof Error ? err.message : "");
    } finally {
      setSubmitting(false);
    }
  };

  const openStayBooking = () => {
    if (!token) {
      Alert.alert(t("loginRequired"), t("stayLoginRequired", "Sign in to reserve a stay."));
      return;
    }
    setStaySheetOpen(true);
  };

  const onStayReserved = (booking: StayBooking) => {
    navigation.navigate("StayBookingConfirm", { bookingId: booking.id });
  };

  if (loading) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-slate-100`}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }
  if (!property) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-slate-100`}>
        <Text style={tw`text-slate-600`}>{t("propertyNotFound")}</Text>
      </View>
    );
  }

  const images = property.image_urls || [];
  const cover = mediaUrl(images[activeImage] || images[0]);
  const location =
    property.public_address ||
    [
      property.location?.district?.name || property.suburb,
      property.location?.city?.name || property.city,
      property.location?.country?.name,
    ]
      .filter(Boolean)
      .join(", ") ||
    property.city;
  const amenities =
    property.amenity_details?.length
      ? property.amenity_details
      : (property.amenities || []).map((key) => ({ key, name: key.replace(/_/g, " ") }));
  const mapCoords =
    getPropertyMapCoords(property.location) ||
    toMapCoords(property.latitude, property.longitude);
  const exactCoords =
    toMapCoords(property.location?.latitude, property.location?.longitude) ||
    toMapCoords(property.latitude, property.longitude);
  const canGetDirections = Boolean(property.can_get_directions && exactCoords);
  const isApproximateMap = Boolean(mapCoords && !exactCoords);
  const flagUrl = property.location?.country?.flag_url
    ? mediaUrl(property.location.country.flag_url)
    : "";
  const flagIcon = property.location?.country?.flag_icon;
  const purpose = resolvePropertyPurpose(property.purpose, property.listing_type);
  const purposeBadge =
    purpose === "sale"
      ? t("forSale")
      : purpose === "stay"
        ? t("forStay", "Stay")
        : t("forRent");
  const priceSuffix =
    purpose === "stay" || property.listing_type === "rent_daily"
      ? ` ${t("perNight", "per night")}`
      : purpose === "rent" || property.listing_type === "rent_monthly"
        ? ` ${t("perMonth")}`
        : property.price_label
          ? ` ${property.price_label}`
          : "";

  return (
    <View style={tw`flex-1 bg-slate-100`}>
      <ScrollView>
        <View style={tw`aspect-video bg-slate-200`}>
          {cover ? (
            <Image source={{ uri: cover }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <View style={tw`flex-1 items-center justify-center`}>
              <MaterialIcons name="home" size={96} color="#cbd5e1" />
            </View>
          )}
          <View style={tw`absolute top-4 left-4 px-3 py-1.5 bg-slate-900/90 rounded-lg`}>
            <Text style={tw`text-white text-xs font-bold uppercase`}>
              {purposeBadge}
            </Text>
          </View>
          <TouchableOpacity
            style={tw`absolute top-4 right-4 bg-white rounded-full p-2`}
            onPress={() => void toggleFavorite()}
          >
            <MaterialIcons
              name={favorited ? "favorite" : "favorite-border"}
              size={22}
              color={favorited ? "#e11d48" : "#475569"}
            />
          </TouchableOpacity>
        </View>

        {images.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`bg-white px-3 py-2`}>
            {images.map((url, idx) => (
              <TouchableOpacity key={`${url}-${idx}`} onPress={() => setActiveImage(idx)} style={tw`mr-2`}>
                <Image
                  source={{ uri: mediaUrl(url) }}
                  style={[
                    tw`w-20 h-14 rounded-lg`,
                    idx === activeImage ? tw`border-2 border-amber-500` : tw`border border-slate-200`,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={tw`p-4`}>
          <Text style={tw`text-sm font-medium text-amber-700`}>
            {property.property_type_display || t("Properties")}
          </Text>
          <Text style={tw`text-2xl font-bold text-slate-900 mt-1`}>{property.title}</Text>
          <View style={tw`flex-row items-center mt-1`}>
            {flagUrl ? (
              <Image source={{ uri: flagUrl }} style={tw`w-5 h-3 rounded-sm mr-1.5`} />
            ) : flagIcon ? (
              <Text style={tw`mr-1`}>{flagIcon}</Text>
            ) : (
              <MaterialIcons name="place" size={16} color="#94a3b8" style={tw`mr-1`} />
            )}
            <Text style={tw`text-slate-600 flex-1`}>{location}</Text>
          </View>

          <View style={tw`flex-row flex-wrap gap-3 mt-4`}>
            {property.bedrooms > 0 && (
              <View style={tw`bg-white px-3 py-2 rounded-xl border border-slate-200`}>
                <Text style={tw`text-slate-700 text-sm`}>
                  {property.bedrooms} {t("bedShort")}
                </Text>
              </View>
            )}
            {property.bathrooms > 0 && (
              <View style={tw`bg-white px-3 py-2 rounded-xl border border-slate-200`}>
                <Text style={tw`text-slate-700 text-sm`}>
                  {property.bathrooms} {t("bathShort")}
                </Text>
              </View>
            )}
            {property.area_sqm ? (
              <View style={tw`bg-white px-3 py-2 rounded-xl border border-slate-200`}>
                <Text style={tw`text-slate-700 text-sm`}>{property.area_sqm} m²</Text>
              </View>
            ) : null}
          </View>

          <Text style={tw`text-3xl font-bold text-slate-900 mt-4`}>
            {formatCurrency(parseFloat(property.price), currencyCode)}
            <Text style={tw`text-base font-normal text-slate-500`}>
              {priceSuffix}
            </Text>
          </Text>

          {property.description ? (
            <View style={tw`mt-6`}>
              <Text style={tw`font-semibold text-slate-900 mb-2`}>{t("descriptionLabel")}</Text>
              <Text style={tw`text-slate-600 leading-6`}>{stripTags(property.description)}</Text>
            </View>
          ) : null}

          {amenities.length > 0 ? (
            <View style={tw`mt-6`}>
              <Text style={tw`font-semibold text-slate-900 mb-2`}>{t("amenitiesLabel")}</Text>
              <View style={tw`flex-row flex-wrap gap-2`}>
                {amenities.map((a) => (
                  <View key={a.key} style={tw`px-3 py-1.5 bg-white rounded-lg border border-slate-200`}>
                    <Text style={tw`text-slate-700 text-sm`}>{a.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {mapCoords ? (
            <View style={tw`mt-6`}>
              <View style={tw`flex-row items-center justify-between mb-2`}>
                <Text style={tw`font-semibold text-slate-900`}>{t("location", "Location")}</Text>
                {canGetDirections && exactCoords ? (
                  <TouchableOpacity
                    onPress={() => void openPropertyDirections(exactCoords)}
                    style={tw`flex-row items-center bg-slate-900 px-3 py-2 rounded-xl`}
                    accessibilityRole="button"
                  >
                    <MaterialIcons name="directions" size={18} color="#fff" />
                    <Text style={tw`text-white font-semibold text-sm ml-1`}>
                      {t("getDirections", "Get Directions")}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              <View style={tw`h-56 rounded-2xl overflow-hidden border border-slate-200`}>
                <MapView
                  style={StyleSheet.absoluteFill}
                  initialRegion={{
                    latitude: mapCoords.latitude,
                    longitude: mapCoords.longitude,
                    latitudeDelta: isApproximateMap ? 0.08 : 0.02,
                    longitudeDelta: isApproximateMap ? 0.08 : 0.02,
                  }}
                  pointerEvents="none"
                >
                  <Marker
                    coordinate={{
                      latitude: mapCoords.latitude,
                      longitude: mapCoords.longitude,
                    }}
                    title={property.title}
                  />
                </MapView>
              </View>
              {isApproximateMap ? (
                <Text style={tw`text-xs text-slate-500 mt-2`}>
                  {t(
                    "approximateAreaNote",
                    "Approximate area — exact address is hidden until a viewing is confirmed.",
                  )}
                </Text>
              ) : null}
            </View>
          ) : null}

          {purpose === "stay" ? (
            <TouchableOpacity
              style={tw`mt-8 bg-slate-900 rounded-2xl py-4 items-center`}
              onPress={openStayBooking}
            >
              <Text style={tw`text-white font-bold text-base`}>{t("bookStay", "Book stay")}</Text>
            </TouchableOpacity>
          ) : purpose === "rent" ? (
            <TouchableOpacity
              style={tw`mt-8 bg-slate-900 rounded-2xl py-4 items-center`}
              onPress={() => navigation.navigate("PropertyApplicationWizard", { propertyId: property.id })}
            >
              <Text style={tw`text-white font-bold text-base`}>{t("applyToRent")}</Text>
            </TouchableOpacity>
          ) : (
            <View style={tw`mt-8 bg-white rounded-2xl border border-slate-200 p-4`}>
              <Text style={tw`font-semibold text-slate-900 mb-2`}>{t("makeOffer") || "Make an offer"}</Text>
              <TextInput style={tw`border border-slate-200 rounded-xl px-3 py-3 text-slate-800 min-h-24`} multiline value={message} onChangeText={setMessage} textAlignVertical="top" />
              <TouchableOpacity style={tw`mt-3 bg-slate-900 rounded-xl py-3.5 items-center ${submitting ? "opacity-60" : ""}`} disabled={submitting} onPress={() => void submitEnquiry()}>
                <Text style={tw`text-white font-bold`}>{submitting ? "…" : t("sendEnquiry")}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {purpose === "stay" ? (
        <StayBookingSheet
          visible={staySheetOpen}
          propertyId={property.id}
          propertyTitle={property.title}
          currencyFallback={currencyCode}
          onClose={() => setStaySheetOpen(false)}
          onReserved={onStayReserved}
        />
      ) : null}
    </View>
  );
}
