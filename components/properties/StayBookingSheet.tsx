import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import tw from "twrnc";
import { useTranslation } from "../../hooks/useTranslation";
import type { RootState } from "../../redux/store";
import { baseAPI } from "../../services/types";
import {
  addMonths,
  daysInMonth,
  formatStayMoney,
  monthStart,
  parseIsoDate,
  toIsoDate,
  type StayAvailabilityDay,
  type StayAvailabilityResponse,
  type StayBooking,
  type StayPriceQuote,
} from "../../services/stayBookings";
import { formatCurrency, type CurrencyCode } from "../../utils/currency";

type Props = {
  visible: boolean;
  propertyId: number;
  propertyTitle: string;
  currencyFallback: CurrencyCode;
  onClose: () => void;
  onReserved: (booking: StayBooking) => void;
};

type GuestCounts = {
  adults: number;
  children: number;
  infants: number;
};

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function authHeaders(token: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function GuestStepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <View style={tw`flex-row items-center justify-between py-3 border-b border-slate-100`}>
      <Text style={tw`text-slate-800 font-medium`}>{label}</Text>
      <View style={tw`flex-row items-center`}>
        <TouchableOpacity
          accessibilityRole="button"
          disabled={value <= min}
          onPress={() => onChange(Math.max(min, value - 1))}
          style={tw`w-9 h-9 rounded-full border border-slate-300 items-center justify-center ${
            value <= min ? "opacity-40" : ""
          }`}
        >
          <MaterialIcons name="remove" size={18} color="#334155" />
        </TouchableOpacity>
        <Text style={tw`w-10 text-center font-bold text-slate-900`}>{value}</Text>
        <TouchableOpacity
          accessibilityRole="button"
          disabled={value >= max}
          onPress={() => onChange(Math.min(max, value + 1))}
          style={tw`w-9 h-9 rounded-full border border-slate-300 items-center justify-center ${
            value >= max ? "opacity-40" : ""
          }`}
        >
          <MaterialIcons name="add" size={18} color="#334155" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function StayBookingSheet({
  visible,
  propertyId,
  propertyTitle,
  currencyFallback,
  onClose,
  onReserved,
}: Props) {
  const { t } = useTranslation();
  const token = useSelector((state: RootState) => state.auth.token);
  const [month, setMonth] = useState(() => monthStart(new Date()));
  const [availability, setAvailability] = useState<StayAvailabilityResponse | null>(null);
  const [dayMap, setDayMap] = useState<Record<string, StayAvailabilityDay>>({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [guests, setGuests] = useState<GuestCounts>({ adults: 1, children: 0, infants: 0 });
  const [quote, setQuote] = useState<StayPriceQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [reserving, setReserving] = useState(false);

  const minNights = availability?.min_nights ?? 1;
  const maxNights = availability?.max_nights ?? 30;
  const maxGuests = availability?.max_guests ?? 4;

  const resetSelection = useCallback(() => {
    setCheckIn(null);
    setCheckOut(null);
    setQuote(null);
    setQuoteError(null);
    setGuests({ adults: 1, children: 0, infants: 0 });
    setMonth(monthStart(new Date()));
  }, []);

  useEffect(() => {
    if (!visible) return;
    resetSelection();
  }, [visible, propertyId, resetSelection]);

  const loadAvailability = useCallback(async () => {
    if (!visible) return;
    setLoadingAvailability(true);
    const from = toIsoDate(monthStart(month));
    const toDate = new Date(month.getFullYear(), month.getMonth() + 2, 0);
    const to = toIsoDate(toDate);
    try {
      const res = await fetch(
        `${baseAPI}/properties/${propertyId}/availability/?from=${from}&to=${to}`,
        { headers: authHeaders(token) },
      );
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok || !data || typeof data !== "object") {
        setAvailability(null);
        setDayMap({});
        return;
      }
      const payload = data as StayAvailabilityResponse;
      setAvailability(payload);
      const nextMap: Record<string, StayAvailabilityDay> = {};
      for (const day of payload.days || []) {
        nextMap[day.date] = day;
      }
      setDayMap(nextMap);
    } catch {
      setAvailability(null);
      setDayMap({});
    } finally {
      setLoadingAvailability(false);
    }
  }, [month, propertyId, token, visible]);

  useEffect(() => {
    void loadAvailability();
  }, [loadAvailability]);

  useEffect(() => {
    if (!checkIn || !checkOut) {
      setQuote(null);
      setQuoteError(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setQuoting(true);
      setQuoteError(null);
      try {
        const res = await fetch(`${baseAPI}/properties/${propertyId}/calculate-price/`, {
          method: "POST",
          headers: authHeaders(token),
          body: JSON.stringify({
            check_in: checkIn,
            check_out: checkOut,
            adults: guests.adults,
            children: guests.children,
            infants: guests.infants,
          }),
        });
        const data: unknown = await res.json().catch(() => null);
        if (cancelled) return;
        if (!res.ok || !data || typeof data !== "object") {
          const detail =
            data && typeof data === "object" && "detail" in data
              ? String((data as { detail?: unknown }).detail || "")
              : "";
          setQuote(null);
          setQuoteError(detail || t("stayQuoteFailed", "Could not calculate price."));
          return;
        }
        setQuote(data as StayPriceQuote);
      } catch {
        if (!cancelled) {
          setQuote(null);
          setQuoteError(t("stayQuoteFailed", "Could not calculate price."));
        }
      } finally {
        if (!cancelled) setQuoting(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [checkIn, checkOut, guests, propertyId, t, token]);

  const calendarCells = useMemo(() => {
    const start = monthStart(month);
    const totalDays = daysInMonth(month);
    const lead = start.getDay();
    const cells: Array<{ key: string; date: string | null; label: number | null }> = [];
    for (let i = 0; i < lead; i += 1) {
      cells.push({ key: `pad-${i}`, date: null, label: null });
    }
    for (let day = 1; day <= totalDays; day += 1) {
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      const iso = toIsoDate(date);
      cells.push({ key: iso, date: iso, label: day });
    }
    return cells;
  }, [month]);

  const rangeIncludesUnavailable = useCallback(
    (startIso: string, endIso: string): boolean => {
      const start = parseIsoDate(startIso);
      const end = parseIsoDate(endIso);
      for (let cursor = new Date(start); cursor < end; cursor.setDate(cursor.getDate() + 1)) {
        const iso = toIsoDate(cursor);
        const day = dayMap[iso];
        if (!day || day.status !== "available") return true;
      }
      return false;
    },
    [dayMap],
  );

  const onSelectDay = (iso: string) => {
    const day = dayMap[iso];
    if (!day || day.status !== "available") return;
    const today = toIsoDate(new Date());
    if (iso < today) return;

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(iso);
      setCheckOut(null);
      setQuote(null);
      setQuoteError(null);
      return;
    }

    if (iso <= checkIn) {
      setCheckIn(iso);
      setCheckOut(null);
      return;
    }

    const nights = Math.round(
      (parseIsoDate(iso).getTime() - parseIsoDate(checkIn).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (nights < minNights) {
      Alert.alert(t("minNights", "Minimum nights"), t("minNightsHint", "Minimum stay is {n} nights.", { n: minNights }));
      return;
    }
    if (maxNights && nights > maxNights) {
      Alert.alert(t("maxNights", "Maximum nights"), t("maxNightsHint", "Maximum stay is {n} nights.", { n: maxNights }));
      return;
    }
    if (rangeIncludesUnavailable(checkIn, iso)) {
      Alert.alert(t("datesUnavailable", "Unavailable"), t("datesUnavailableHint", "Those dates include unavailable nights."));
      return;
    }
    setCheckOut(iso);
  };

  const money = (amount: string | number | null | undefined) =>
    formatStayMoney(amount, quote?.currency || availability?.currency, currencyFallback, formatCurrency);

  const reserve = async () => {
    if (!checkIn || !checkOut || !quote) return;
    if (!token) {
      Alert.alert(t("loginRequired"), t("stayLoginRequired", "Sign in to reserve a stay."));
      return;
    }
    setReserving(true);
    try {
      const res = await fetch(`${baseAPI}/properties/${propertyId}/bookings/`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({
          check_in: checkIn,
          check_out: checkOut,
          adults: guests.adults,
          children: guests.children,
          infants: guests.infants,
          confirm: true,
        }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok || !data || typeof data !== "object") {
        const detail =
          data && typeof data === "object" && "detail" in data
            ? String((data as { detail?: unknown }).detail || "")
            : "";
        throw new Error(detail || t("stayReserveFailed", "Could not complete reservation."));
      }
      onReserved(data as StayBooking);
      onClose();
    } catch (err) {
      Alert.alert(
        t("stayReserveFailed", "Could not complete reservation."),
        err instanceof Error ? err.message : "",
      );
    } finally {
      setReserving(false);
    }
  };

  const monthLabel = month.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const maxAdults = Math.max(1, maxGuests - guests.children);
  const maxChildren = Math.max(0, maxGuests - guests.adults);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={tw`flex-1 bg-black/40 justify-end`} onPress={onClose}>
        <Pressable
          style={tw`bg-white rounded-t-3xl max-h-[92%]`}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={tw`px-4 pt-3 pb-2 border-b border-slate-100`}>
            <View style={tw`w-10 h-1 rounded-full bg-slate-300 self-center mb-3`} />
            <View style={tw`flex-row items-start justify-between`}>
              <View style={tw`flex-1 pr-3`}>
                <Text style={tw`text-lg font-bold text-slate-900`}>{t("bookStay", "Book stay")}</Text>
                <Text style={tw`text-slate-500 mt-0.5`} numberOfLines={1}>
                  {propertyTitle}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} accessibilityRole="button" style={tw`p-1`}>
                <MaterialIcons name="close" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={tw`px-4 pb-28 pt-3`}>
            <View style={tw`flex-row items-center justify-between mb-3`}>
              <TouchableOpacity
                onPress={() => setMonth((prev) => addMonths(prev, -1))}
                style={tw`p-2`}
                accessibilityRole="button"
              >
                <MaterialIcons name="chevron-left" size={26} color="#0f172a" />
              </TouchableOpacity>
              <Text style={tw`font-bold text-slate-900`}>{monthLabel}</Text>
              <TouchableOpacity
                onPress={() => setMonth((prev) => addMonths(prev, 1))}
                style={tw`p-2`}
                accessibilityRole="button"
              >
                <MaterialIcons name="chevron-right" size={26} color="#0f172a" />
              </TouchableOpacity>
            </View>

            <View style={tw`flex-row mb-1`}>
              {WEEKDAY_LABELS.map((label) => (
                <Text key={label} style={tw`flex-1 text-center text-xs text-slate-400 font-semibold`}>
                  {label}
                </Text>
              ))}
            </View>

            {loadingAvailability ? (
              <View style={tw`py-10 items-center`}>
                <ActivityIndicator color="#f59e0b" />
              </View>
            ) : (
              <View style={tw`flex-row flex-wrap`}>
                {calendarCells.map((cell) => {
                  if (!cell.date || cell.label == null) {
                    return <View key={cell.key} style={tw`w-[14.28%] aspect-square p-0.5`} />;
                  }
                  const day = dayMap[cell.date];
                  const available = day?.status === "available" && cell.date >= toIsoDate(new Date());
                  const isCheckIn = checkIn === cell.date;
                  const isCheckOut = checkOut === cell.date;
                  const inRange =
                    Boolean(checkIn && checkOut) &&
                    cell.date > (checkIn || "") &&
                    cell.date < (checkOut || "");
                  const selected = isCheckIn || isCheckOut;
                  return (
                    <View key={cell.key} style={tw`w-[14.28%] aspect-square p-0.5`}>
                      <TouchableOpacity
                        disabled={!available}
                        onPress={() => onSelectDay(cell.date!)}
                        style={[
                          tw`flex-1 rounded-xl items-center justify-center`,
                          selected
                            ? tw`bg-slate-900`
                            : inRange
                              ? tw`bg-amber-100`
                              : available
                                ? tw`bg-slate-50`
                                : tw`bg-slate-100`,
                        ]}
                      >
                        <Text
                          style={tw`${
                            selected
                              ? "text-white font-bold"
                              : available
                                ? "text-slate-800"
                                : "text-slate-300"
                          } text-sm`}
                        >
                          {cell.label}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}

            <View style={tw`flex-row mt-4 gap-3`}>
              <View style={tw`flex-1 bg-slate-50 rounded-xl p-3 border border-slate-200`}>
                <Text style={tw`text-xs uppercase text-slate-500`}>{t("checkIn", "Check-in")}</Text>
                <Text style={tw`font-semibold text-slate-900 mt-1`}>{checkIn || "—"}</Text>
              </View>
              <View style={tw`flex-1 bg-slate-50 rounded-xl p-3 border border-slate-200`}>
                <Text style={tw`text-xs uppercase text-slate-500`}>{t("checkOut", "Check-out")}</Text>
                <Text style={tw`font-semibold text-slate-900 mt-1`}>{checkOut || "—"}</Text>
              </View>
            </View>

            <Text style={tw`text-slate-500 text-sm mt-2`}>
              {checkIn && checkOut
                ? t("nightsCount", "{n} nights", {
                    n: Math.round(
                      (parseIsoDate(checkOut).getTime() - parseIsoDate(checkIn).getTime()) /
                        (1000 * 60 * 60 * 24),
                    ),
                  })
                : t("selectDates", "Select check-in and check-out dates")}
            </Text>

            <Text style={tw`font-semibold text-slate-900 mt-5 mb-1`}>{t("guests", "Guests")}</Text>
            <GuestStepper
              label={t("adults", "Adults")}
              value={guests.adults}
              min={1}
              max={maxAdults}
              onChange={(adults) => setGuests((prev) => ({ ...prev, adults }))}
            />
            <GuestStepper
              label={t("children", "Children")}
              value={guests.children}
              min={0}
              max={maxChildren}
              onChange={(children) => setGuests((prev) => ({ ...prev, children }))}
            />
            <GuestStepper
              label={t("infants", "Infants")}
              value={guests.infants}
              min={0}
              max={5}
              onChange={(infants) => setGuests((prev) => ({ ...prev, infants }))}
            />

            <View style={tw`mt-5 bg-slate-50 rounded-2xl border border-slate-200 p-4`}>
              <Text style={tw`font-semibold text-slate-900 mb-3`}>
                {t("priceBreakdown", "Price breakdown")}
              </Text>
              {quoting ? (
                <ActivityIndicator color="#f59e0b" />
              ) : quoteError ? (
                <Text style={tw`text-rose-600 text-sm`}>{quoteError}</Text>
              ) : quote ? (
                <>
                  {(quote.line_items || []).map((item) => (
                    <View key={item.key} style={tw`flex-row justify-between mb-2`}>
                      <Text style={tw`text-slate-600`}>{item.label}</Text>
                      <Text style={tw`text-slate-800 font-medium`}>{money(item.amount)}</Text>
                    </View>
                  ))}
                  <View style={tw`flex-row justify-between pt-2 border-t border-slate-200 mt-1`}>
                    <Text style={tw`font-bold text-slate-900`}>{t("total", "Total")}</Text>
                    <Text style={tw`font-bold text-slate-900`}>{money(quote.total)}</Text>
                  </View>
                </>
              ) : (
                <Text style={tw`text-slate-500 text-sm`}>
                  {t("selectDatesForPrice", "Select dates to see the total.")}
                </Text>
              )}
            </View>
          </ScrollView>

          <View style={tw`absolute left-0 right-0 bottom-0 bg-white border-t border-slate-200 px-4 py-3 pb-6`}>
            <TouchableOpacity
              disabled={!quote || reserving || quoting}
              onPress={() => void reserve()}
              style={tw`bg-slate-900 rounded-2xl py-4 items-center ${
                !quote || reserving || quoting ? "opacity-50" : ""
              }`}
            >
              {reserving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={tw`text-white font-bold text-base`}>
                  {quote
                    ? t("reserveWithTotal", "Reserve — {total}", { total: money(quote.total) })
                    : t("reserve", "Reserve")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
