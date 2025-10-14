import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator } from "react-native";
import tw from "twrnc";
import { useDispatch, useSelector } from "react-redux";
import { fetchServices } from "../redux/slices/servicesSlice";
import { useNavigation } from "@react-navigation/native";
import { RootState } from "../redux/store";
import { useTranslation } from "../hooks/useTranslation";

export default function ServicesScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const { data, loading, error } = useSelector((s: RootState) => s.services);

  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchServices(undefined) as any);
  }, [dispatch]);

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

