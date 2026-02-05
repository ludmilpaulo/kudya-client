import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { baseAPI } from "../services/types";
import { formatCurrency, getCurrencyForCountry } from "../utils/currency";
import { useUserRegion } from "../hooks/useUserRegion";
import { MaterialIcons } from "@expo/vector-icons";
import tw from "twrnc";

type Property = {
  id: number;
  title: string;
  description: string;
  address: string;
  city: string;
  listing_type: string;
  listing_type_display: string;
  property_type_display: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number | null;
  amenities: string[];
  image_urls: string[];
};

export default function PropertyDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { region: regionCode } = useUserRegion();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  const propertyId = route.params?.propertyId;

  useEffect(() => {
    if (!propertyId) return;
    fetch(`${baseAPI}/properties/${propertyId}/`)
      .then((res) => res.json())
      .then(setProperty)
      .catch(() => setProperty(null))
      .finally(() => setLoading(false));
  }, [propertyId]);

  const currencyCode = getCurrencyForCountry(regionCode);

  if (loading) {
    return (
      <View style={tw`flex-1 items-center justify-center`}>
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }
  if (!property) {
    return (
      <View style={tw`flex-1 items-center justify-center`}>
        <Text style={tw`text-gray-600`}>Property not found</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-slate-50`}>
      <ScrollView>
        <View style={tw`aspect-video bg-teal-100`}>
          {property.image_urls?.[0] ? (
            <Image
              source={{ uri: `${baseAPI}${property.image_urls[0]}` }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          ) : (
            <View style={tw`flex-1 items-center justify-center`}>
              <MaterialIcons name="home" size={120} color="#99f6e4" />
            </View>
          )}
          <View style={tw`absolute top-4 left-4 px-3 py-1 bg-teal-600 rounded-lg`}>
            <Text style={tw`text-white font-medium`}>{property.listing_type_display}</Text>
          </View>
        </View>

        <View style={tw`p-4`}>
          <Text style={tw`text-2xl font-bold text-teal-900`}>{property.title}</Text>
          <Text style={tw`text-teal-600 mt-1`}>
            {property.city} • {property.property_type_display}
          </Text>

          <View style={tw`flex-row gap-4 mt-4`}>
            {property.bedrooms > 0 && <Text style={tw`text-gray-600`}>{property.bedrooms} bed</Text>}
            {property.bathrooms > 0 && <Text style={tw`text-gray-600`}>{property.bathrooms} bath</Text>}
            {property.area_sqm && <Text style={tw`text-gray-600`}>{property.area_sqm} m²</Text>}
          </View>

          <Text style={tw`text-2xl font-bold text-teal-600 mt-4`}>
            {formatCurrency(parseFloat(property.price), currencyCode)}
            <Text style={tw`text-base font-normal text-gray-500`}>
              {property.listing_type === "rent_daily" && " per day"}
              {property.listing_type === "rent_monthly" && " per month"}
            </Text>
          </Text>

          {property.address && (
            <Text style={tw`mt-4 text-gray-600`}>
              <Text style={tw`font-semibold`}>Address: </Text>
              {property.address}
            </Text>
          )}

          {property.description ? (
            <View style={tw`mt-6`}>
              <Text style={tw`font-semibold text-teal-900 mb-2`}>Description</Text>
              <Text style={tw`text-gray-600`}>{property.description}</Text>
            </View>
          ) : null}

          {property.amenities?.length > 0 ? (
            <View style={tw`mt-6`}>
              <Text style={tw`font-semibold text-teal-900 mb-2`}>Amenities</Text>
              <View style={tw`flex-row flex-wrap gap-2`}>
                {property.amenities.map((a) => (
                  <View key={a} style={tw`px-3 py-1 bg-teal-50 rounded-lg`}>
                    <Text style={tw`text-teal-700 text-sm`}>{a}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
