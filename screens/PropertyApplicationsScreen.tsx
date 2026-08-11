import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { MaterialIcons } from "@expo/vector-icons";
import tw from "twrnc";
import { useAppNavigation } from "../navigation/hooks";
import { useTranslation } from "../hooks/useTranslation";
import type { RootState } from "../redux/store";
import { baseAPI } from "../services/types";
import type { PropertyApplicationListItem } from "../services/propertyApplications";

export default function PropertyApplicationsScreen() {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const token = useSelector((state: RootState) => state.auth.token);
  const [applications, setApplications] = useState<PropertyApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) { setApplications([]); setLoading(false); setRefreshing(false); return; }
    try {
      const res = await fetch(`${baseAPI}/properties/applications/`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
      const data: unknown = await res.json().catch(() => []);
      setApplications(Array.isArray(data) ? data as PropertyApplicationListItem[] : []);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <View style={tw`flex-1 items-center justify-center bg-slate-100`}><ActivityIndicator size="large" color="#f59e0b" /></View>;
  return (
    <View style={tw`flex-1 bg-slate-100`}>
      <View style={tw`bg-slate-900 px-4 pt-12 pb-5`}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={tw`flex-row items-center self-start mb-3`}>
          <MaterialIcons name="arrow-back" size={22} color="#e2e8f0" /><Text style={tw`text-slate-300 ml-1`}>{t("back")}</Text>
        </TouchableOpacity>
        <Text style={tw`text-2xl font-bold text-white`}>{t("propertyApplications")}</Text>
      </View>
      <FlatList
        data={applications}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={tw`p-4 pb-10 ${applications.length === 0 ? "flex-grow justify-center" : ""}`}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} tintColor="#f59e0b" />}
        ListEmptyComponent={<View style={tw`items-center px-8`}><MaterialIcons name="home-work" size={72} color="#cbd5e1" /><Text style={tw`text-slate-600 text-center mt-4`}>{t("noApplications")}</Text></View>}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate("PropertyApplicationDetail", { applicationId: item.id })} style={tw`bg-white border border-slate-200 rounded-2xl p-4 mb-3`}>
            <View style={tw`flex-row justify-between gap-3`}><Text style={tw`font-bold text-slate-900 flex-1`} numberOfLines={1}>{item.property_title}</Text><Text style={tw`text-xs font-bold uppercase text-amber-700`}>{item.status.replace(/_/g, " ")}</Text></View>
            <Text style={tw`text-slate-500 mt-1`}>{item.property_city}</Text>
            <Text style={tw`text-slate-400 text-xs mt-3`}>{t("submittedOn")}: {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : t("pending")}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
