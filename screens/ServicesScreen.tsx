import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator } from "react-native";
import tw from "twrnc";
import { fetchServices } from "../redux/slices/servicesSlice";
import { useAppDispatch, RootState } from "../redux/store";
import { useAppNavigation } from "../navigation/hooks";
import { useSelector } from "react-redux";
import { useTranslation } from "../hooks/useTranslation";
import { getMyBookings, type ServiceBooking } from "../services/servicesApi";

export default function ServicesScreen() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigation = useAppNavigation();
  const { data, loading, error } = useSelector((s: RootState) => s.services);
  const token = useSelector((s: RootState) => s.auth.token);

  const [search, setSearch] = useState("");
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);

  useEffect(() => {
    dispatch(fetchServices(undefined));
  }, [dispatch]);

  useEffect(() => {
    if (!token) {
      setBookings([]);
      return;
    }
    getMyBookings()
      .then(setBookings)
      .catch(() => setBookings([]));
  }, [token]);

  const filtered = search.trim()
    ? data.filter((s) =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        (s.description || "").toLowerCase().includes(search.toLowerCase())
      )
    : data;

  return (
    <View style={tw`flex-1 bg-gray-50 p-4`}>
      <Text style={tw`text-2xl font-bold text-gray-800 mb-4`}>Services</Text>

      <TextInput
        style={tw`bg-white rounded-full px-4 py-3 mb-4 border border-gray-200`}
        placeholder={t("search")}
        value={search}
        onChangeText={setSearch}
      />

      {token && bookings.length > 0 ? (
        <View style={tw`mb-4`}>
          <Text style={tw`text-lg font-semibold text-gray-800 mb-2`}>
            {t("myBookings", "My bookings")}
          </Text>
          {bookings.slice(0, 8).map((booking) => (
            <View key={booking.id} style={tw`bg-white rounded-xl p-3 mb-2 border border-gray-100`}>
              <Text style={tw`font-semibold text-gray-800`}>
                {booking.service_title || booking.booking_number || `#${booking.id}`}
              </Text>
              <Text style={tw`text-sm text-gray-500`}>
                {booking.status} · {booking.booking_date}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {loading && <ActivityIndicator size="large" color="#3B82F6" />}
      {!loading && error && <Text style={tw`text-red-600 text-center`}>{error}</Text>}
      {!loading && !error && filtered.length === 0 && (
        <Text style={tw`text-gray-500 text-center mt-10`}>{t("noStores")}</Text>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={tw`bg-white rounded-2xl p-4 mb-3 shadow`}
            onPress={() => navigation.navigate("ServiceDetail", { serviceId: item.id })}
          >
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                style={tw`w-full h-32 rounded-xl mb-2`}
                resizeMode="cover"
              />
            ) : (
              <View style={tw`w-full h-32 rounded-xl bg-gray-200 mb-2 items-center justify-center`}>
                <Text style={tw`text-gray-400`}>No Image</Text>
              </View>
            )}
            <Text style={tw`font-bold text-gray-800`}>{item.title}</Text>
            <Text style={tw`text-sm text-gray-500`}>{item.parceiro_name}</Text>
            <View style={tw`flex-row justify-between items-center mt-2`}>
              <Text style={tw`text-blue-700 font-bold`}>
                {item.price.toFixed(2)} {item.currency}
              </Text>
              <Text style={tw`text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full`}>
                {item.duration_minutes}m
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

