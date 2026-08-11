import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useSelector } from "react-redux";
import tw from "twrnc";
import { useAppNavigation, useAppRoute } from "../navigation/hooks";
import { useTranslation } from "../hooks/useTranslation";
import { useUserRegion } from "../hooks/useUserRegion";
import type { RootState } from "../redux/store";
import { baseAPI } from "../services/types";
import {
  formatStayMoney,
  type StayBooking,
} from "../services/stayBookings";
import { formatCurrency, getCurrencyForCountry } from "../utils/currency";

export default function StayBookingConfirmScreen() {
  const route = useAppRoute<"StayBookingConfirm">();
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const { region: regionCode } = useUserRegion();
  const token = useSelector((state: RootState) => state.auth.token);
  const [booking, setBooking] = useState<StayBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const bookingId = route.params.bookingId;
  const currencyFallback = getCurrencyForCountry(regionCode);

  const load = useCallback(async () => {
    if (!token) {
      setBooking(null);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const res = await fetch(`${baseAPI}/properties/bookings/${bookingId}/`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok || !data || typeof data !== "object") {
        setBooking(null);
        return;
      }
      setBooking(data as StayBooking);
    } catch {
      setBooking(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [bookingId, token]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void load();
    }, [load]),
  );

  const money = (amount: string | number | null | undefined) =>
    formatStayMoney(amount, booking?.currency, currencyFallback, formatCurrency);

  if (loading) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-slate-100`}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-slate-100 px-6`}>
        <Text style={tw`text-slate-600 text-center`}>{t("stayBookingNotFound", "Booking not found.")}</Text>
        <TouchableOpacity
          style={tw`mt-4 bg-slate-900 px-5 py-3 rounded-xl`}
          onPress={() => navigation.goBack()}
        >
          <Text style={tw`text-white font-semibold`}>{t("back")}</Text>
        </TouchableOpacity>
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
        <Text style={tw`text-2xl font-bold text-white`}>{t("stayConfirmed", "Stay reserved")}</Text>
        <Text style={tw`text-slate-300 mt-1`}>{booking.booking_code}</Text>
      </View>

      <ScrollView
        contentContainerStyle={tw`p-4 pb-10`}
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
      >
        <View style={tw`bg-white rounded-2xl border border-slate-200 p-4 mb-3`}>
          <Text style={tw`text-xs uppercase text-amber-700 font-bold`}>{booking.status.replace(/_/g, " ")}</Text>
          <Text style={tw`text-xl font-bold text-slate-900 mt-1`}>{booking.property_title}</Text>
          <Text style={tw`text-slate-500 mt-1`}>{booking.property_city}</Text>
        </View>

        <View style={tw`bg-white rounded-2xl border border-slate-200 p-4 mb-3`}>
          <Row label={t("checkIn", "Check-in")} value={booking.check_in} />
          <Row label={t("checkOut", "Check-out")} value={booking.check_out} />
          <Row label={t("nights", "Nights")} value={String(booking.nights)} />
          <Row
            label={t("guests", "Guests")}
            value={t("guestsSummary", "{adults} adults · {children} children · {infants} infants", {
              adults: booking.adults,
              children: booking.children,
              infants: booking.infants,
            })}
          />
        </View>

        <View style={tw`bg-white rounded-2xl border border-slate-200 p-4 mb-3`}>
          <Text style={tw`font-semibold text-slate-900 mb-3`}>{t("priceBreakdown", "Price breakdown")}</Text>
          <Row label={t("nightlySubtotal", "Nights subtotal")} value={money(booking.nightly_subtotal)} />
          <Row label={t("cleaningFee", "Cleaning fee")} value={money(booking.cleaning_fee)} />
          <Row label={t("serviceFee", "Service fee")} value={money(booking.service_fee)} />
          <View style={tw`flex-row justify-between pt-2 border-t border-slate-100 mt-1`}>
            <Text style={tw`font-bold text-slate-900`}>{t("total", "Total")}</Text>
            <Text style={tw`font-bold text-slate-900`}>{money(booking.total_amount)}</Text>
          </View>
        </View>

        {booking.timeline && booking.timeline.length > 0 ? (
          <View style={tw`bg-white rounded-2xl border border-slate-200 p-4 mb-3`}>
            <Text style={tw`font-semibold text-slate-900 mb-3`}>{t("bookingTimeline", "Timeline")}</Text>
            {booking.timeline.map((step) => (
              <View key={step.key} style={tw`flex-row items-center mb-2`}>
                <MaterialIcons
                  name={step.done ? "check-circle" : "radio-button-unchecked"}
                  size={18}
                  color={step.done ? "#059669" : "#94a3b8"}
                />
                <Text style={tw`ml-2 ${step.done ? "text-slate-800" : "text-slate-400"}`}>
                  {step.label}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <TouchableOpacity
          style={tw`bg-slate-900 rounded-2xl py-4 items-center`}
          onPress={() => navigation.navigate("StayBookings")}
        >
          <Text style={tw`text-white font-bold`}>{t("viewUpcomingStays", "View my stays")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={tw`flex-row justify-between mb-2 gap-3`}>
      <Text style={tw`text-slate-500`}>{label}</Text>
      <Text style={tw`text-slate-800 font-medium flex-1 text-right`}>{value}</Text>
    </View>
  );
}
