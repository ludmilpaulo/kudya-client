import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSelector } from "react-redux";
import tw from "twrnc";
import { useAppNavigation } from "../navigation/hooks";
import { useTranslation } from "../hooks/useTranslation";
import type { RootState } from "../redux/store";
import { baseAPI } from "../services/types";

type ActiveRental = {
  application_id: number;
  lease_id: number;
  property_title: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  monthly_rent: string | null;
  currency: string;
  next_payment_placeholder: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  pdf_download_path: string | null;
};

export default function PropertyActiveRentalsScreen() {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const token = useSelector((state: RootState) => state.auth.token);
  const [items, setItems] = useState<ActiveRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) {
      setItems([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${baseAPI}/properties/me/services/`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok || !data || typeof data !== "object") {
        setItems([]);
        return;
      }
      const rentals = (data as { active_rentals?: ActiveRental[] }).active_rentals;
      setItems(Array.isArray(rentals) ? rentals : []);
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
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-slate-100`}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.lease_id)}
        contentContainerStyle={tw`p-4 pb-10`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load();
            }}
          />
        }
        ListHeaderComponent={
          <View style={tw`mb-4`}>
            <Text style={tw`text-2xl font-bold text-slate-900`}>{t("activeRental")}</Text>
            <Text style={tw`text-slate-500 mt-1`}>
              {t("activeRentalSubtitle", "Signed leases and active rentals.")}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={tw`bg-white rounded-2xl border border-slate-200 p-6`}>
            <Text style={tw`text-slate-600`}>{t("noApplications")}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={tw`bg-white rounded-2xl border border-slate-200 p-4 mb-3`}
            onPress={() =>
              navigation.navigate("PropertyApplicationDetail", {
                applicationId: item.application_id,
              })
            }
          >
            <Text style={tw`font-bold text-slate-900`}>{item.property_title}</Text>
            <Text style={tw`text-xs uppercase text-emerald-700 mt-1`}>
              {item.status.replace(/_/g, " ")}
            </Text>
            <Text style={tw`text-sm text-slate-600 mt-2`}>
              {t("rentalPeriod")}: {item.start_date || "—"} → {item.end_date || "—"}
            </Text>
            <Text style={tw`text-sm text-teal-700 mt-1`}>
              {t("monthlyRent", "Monthly rent")}: {item.currency} {item.monthly_rent || "—"}
            </Text>
            <Text style={tw`text-sm text-slate-600 mt-1`}>
              {t("nextPayment", "Next payment")}: {t("nextPaymentDay", "Day")}{" "}
              {item.next_payment_placeholder} ({t("comingSoon", "coming soon")})
            </Text>
            <Text style={tw`text-sm text-slate-600 mt-1`}>
              {t("contactOwner", "Contact owner")}: {item.owner_name || "—"}
              {item.owner_phone ? ` · ${item.owner_phone}` : ""}
            </Text>
            {item.owner_email ? (
              <TouchableOpacity
                onPress={() => void Linking.openURL(`mailto:${item.owner_email}`)}
                style={tw`mt-2`}
              >
                <Text style={tw`text-sm font-semibold text-teal-700`}>{item.owner_email}</Text>
              </TouchableOpacity>
            ) : null}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
