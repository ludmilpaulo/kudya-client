import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useSelector } from "react-redux";
import tw from "twrnc";
import { useAppNavigation } from "../navigation/hooks";
import { useTranslation } from "../hooks/useTranslation";
import { useUserRegion } from "../hooks/useUserRegion";
import type { RootState } from "../redux/store";
import { baseAPI } from "../services/types";
import { formatStayMoney, type StayBooking } from "../services/stayBookings";
import { formatCurrency, getCurrencyForCountry } from "../utils/currency";

export default function StayBookingsScreen() {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const { region: regionCode } = useUserRegion();
  const token = useSelector((state: RootState) => state.auth.token);
  const [items, setItems] = useState<StayBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const currencyFallback = getCurrencyForCountry(regionCode);

  const load = useCallback(async () => {
    if (!token) {
      setItems([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const res = await fetch(`${baseAPI}/properties/me/bookings/`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data: unknown = await res.json().catch(() => []);
      setItems(Array.isArray(data) ? (data as StayBooking[]) : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void load();
    }, [load]),
  );

  if (loading) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-slate-100`}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-slate-100`}>
      <View style={tw`bg-slate-900 px-4 pt-12 pb-5`}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={tw`flex-row items-center self-start mb-3`}
        >
          <MaterialIcons name="arrow-back" size={22} color="#e2e8f0" />
          <Text style={tw`text-slate-300 ml-1`}>{t("back")}</Text>
        </TouchableOpacity>
        <Text style={tw`text-2xl font-bold text-white`}>{t("upcomingStays", "Upcoming stays")}</Text>
        <Text style={tw`text-slate-300 mt-1`}>
          {t("upcomingStaysSubtitle", "Your short-stay reservations.")}
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={tw`p-4 pb-10 ${items.length === 0 ? "flex-grow justify-center" : ""}`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load();
            }}
            tintColor="#f59e0b"
          />
        }
        ListEmptyComponent={
          <View style={tw`items-center px-8`}>
            <MaterialIcons name="hotel" size={72} color="#cbd5e1" />
            <Text style={tw`text-slate-600 text-center mt-4`}>
              {token
                ? t("noStayBookings", "You have no stay bookings yet.")
                : t("stayLoginRequired", "Sign in to reserve a stay.")}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate("StayBookingConfirm", { bookingId: item.id })}
            style={tw`bg-white border border-slate-200 rounded-2xl p-4 mb-3`}
          >
            <View style={tw`flex-row justify-between gap-3`}>
              <Text style={tw`font-bold text-slate-900 flex-1`} numberOfLines={1}>
                {item.property_title}
              </Text>
              <Text style={tw`text-xs font-bold uppercase text-amber-700`}>
                {item.status.replace(/_/g, " ")}
              </Text>
            </View>
            <Text style={tw`text-slate-500 mt-1`}>{item.property_city}</Text>
            <Text style={tw`text-slate-700 mt-3`}>
              {t("checkIn", "Check-in")}: {item.check_in} → {t("checkOut", "Check-out")}:{" "}
              {item.check_out}
            </Text>
            <Text style={tw`text-slate-500 text-sm mt-1`}>
              {t("nightsCount", "{n} nights", { n: item.nights })} ·{" "}
              {formatStayMoney(item.total_amount, item.currency, currencyFallback, formatCurrency)}
            </Text>
            {item.booking_code ? (
              <Text style={tw`text-slate-400 text-xs mt-2`}>{item.booking_code}</Text>
            ) : null}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
