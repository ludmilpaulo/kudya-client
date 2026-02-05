import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { baseAPI } from "../services/types";
import { formatCurrency, getCurrencyForCountry } from "../utils/currency";
import { useUserRegion } from "../hooks/useUserRegion";
import { MaterialIcons } from "@expo/vector-icons";
import tw from "twrnc";

type ListingType = "rent_daily" | "rent_monthly" | "buy";
type Property = {
  id: number;
  title: string;
  city: string;
  listing_type: string;
  listing_type_display: string;
  property_type_display: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number | null;
  image_urls: string[];
};

const LISTING_OPTIONS: { value: ListingType; label: string }[] = [
  { value: "rent_daily", label: "Per Day" },
  { value: "rent_monthly", label: "Per Month" },
  { value: "buy", label: "For Sale" },
];

export default function PropertiesScreen() {
  const navigation = useNavigation<any>();
  const { region: regionCode } = useUserRegion();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingType, setListingType] = useState<ListingType | "">("");
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (listingType) params.set("listing_type", listingType);
    if (search) params.set("search", search);
    if (city) params.set("city", city);

    setLoading(true);
    fetch(`${baseAPI}/properties/search/?${params}`)
      .then((res) => res.json())
      .then((data) => setProperties(Array.isArray(data) ? data : []))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, [listingType, search, city]);

  const currencyCode = getCurrencyForCountry(regionCode);

  const renderProperty = ({ item }: { item: Property }) => (
    <TouchableOpacity
      style={tw`bg-white rounded-2xl shadow-lg overflow-hidden mb-4`}
      onPress={() => navigation.navigate("PropertyDetail", { propertyId: item.id })}
      activeOpacity={0.9}
    >
      <View style={tw`aspect-video bg-teal-100`}>
        {item.image_urls?.[0] ? (
          <Image
            source={{ uri: `${baseAPI}${item.image_urls[0]}` }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : (
          <View style={tw`flex-1 items-center justify-center`}>
            <MaterialIcons name="home" size={64} color="#5eead4" />
          </View>
        )}
        <View style={tw`absolute top-2 left-2 px-2 py-1 bg-teal-600 rounded-lg`}>
          <Text style={tw`text-white text-xs font-medium`}>{item.listing_type_display}</Text>
        </View>
      </View>
      <View style={tw`p-4`}>
        <Text style={tw`font-semibold text-teal-900 text-base`} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={tw`text-sm text-gray-500`}>{item.city}</Text>
        <View style={tw`flex-row gap-2 mt-2`}>
          {item.bedrooms > 0 && <Text style={tw`text-sm text-gray-600`}>{item.bedrooms} bed</Text>}
          {item.bathrooms > 0 && <Text style={tw`text-sm text-gray-600`}>{item.bathrooms} bath</Text>}
          {item.area_sqm && <Text style={tw`text-sm text-gray-600`}>{item.area_sqm} m²</Text>}
        </View>
        <Text style={tw`mt-2 font-bold text-teal-600`}>
          {formatCurrency(parseFloat(item.price), currencyCode)}
          <Text style={tw`text-xs font-normal text-gray-500`}>
            {item.listing_type === "rent_daily" && " / day"}
            {item.listing_type === "rent_monthly" && " / month"}
          </Text>
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={tw`flex-1 bg-slate-50`}>
      <View style={tw`bg-teal-600 px-4 pt-12 pb-4`}>
        <Text style={tw`text-2xl font-bold text-white`}>Properties</Text>
        <Text style={tw`text-teal-100 mt-1`}>Rent or buy</Text>

        <View style={tw`flex-row gap-2 mt-4`}>
          {LISTING_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setListingType(listingType === opt.value ? "" : opt.value)}
              style={[
                tw`px-4 py-2 rounded-xl`,
                listingType === opt.value ? tw`bg-white` : tw`bg-teal-500/50`,
              ]}
            >
              <Text
                style={[
                  tw`font-medium`,
                  listingType === opt.value ? tw`text-teal-600` : tw`text-white`,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={tw`mt-3 bg-white rounded-xl px-4 py-3 text-gray-800`}
          placeholder="Search by title, city..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
        <TextInput
          style={tw`mt-2 bg-white rounded-xl px-4 py-3 text-gray-800`}
          placeholder="City"
          placeholderTextColor="#94a3b8"
          value={city}
          onChangeText={setCity}
        />
      </View>

      {loading ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#0d9488" />
          <Text style={tw`text-teal-600 mt-3`}>Loading properties...</Text>
        </View>
      ) : properties.length === 0 ? (
        <View style={tw`flex-1 items-center justify-center px-8`}>
          <MaterialIcons name="home" size={80} color="#99f6e4" />
          <Text style={tw`text-teal-600 text-center mt-4`}>No properties found</Text>
        </View>
      ) : (
        <FlatList
          data={properties}
          renderItem={renderProperty}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={tw`p-4 pb-24`}
        />
      )}
    </View>
  );
}
