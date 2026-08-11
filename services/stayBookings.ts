import type { CurrencyCode } from "../utils/currency";

export type PropertyPurpose = "stay" | "rent" | "sale";

export type StayDayStatus = "available" | "blocked" | "booked" | "pending";

export type StayAvailabilityDay = {
  date: string;
  status: StayDayStatus;
  price: string | null;
  currency?: string;
};

export type StayAvailabilityResponse = {
  property_id: number;
  currency: string;
  min_nights: number;
  max_nights: number;
  max_guests: number;
  hold_minutes: number;
  from: string;
  to: string;
  days: StayAvailabilityDay[];
};

export type StayPriceLineItem = {
  key: string;
  label: string;
  amount: string;
};

export type StayPriceQuote = {
  available: boolean;
  check_in: string;
  check_out: string;
  nights: number;
  adults: number;
  children: number;
  infants: number;
  currency: string;
  nightly_subtotal: string;
  cleaning_fee: string;
  service_fee: string;
  tax_amount: string;
  total: string;
  line_items: StayPriceLineItem[];
  hold_minutes?: number;
};

export type StayBookingTimelineStep = {
  key: string;
  label: string;
  done: boolean;
};

export type StayBooking = {
  id: number;
  property_id: number;
  property_title: string;
  property_city: string;
  booking_code: string;
  check_in: string;
  check_out: string;
  nights: number;
  adults: number;
  children: number;
  infants: number;
  status: string;
  currency: string;
  nightly_subtotal: string;
  cleaning_fee: string;
  service_fee: string;
  tax_amount: string;
  total_amount: string;
  line_items?: StayPriceLineItem[];
  hold_expires_at?: string | null;
  guest_notes?: string;
  guest_name?: string;
  confirmed_at?: string | null;
  cancelled_at?: string | null;
  created_at?: string;
  timeline?: StayBookingTimelineStep[];
};

export type StaySettingsSummary = {
  price_per_night: string;
  weekend_price?: string | null;
  cleaning_fee?: string;
  min_nights: number;
  max_nights: number;
  max_guests: number;
  hold_minutes?: number;
};

export function resolvePropertyPurpose(
  purpose?: string | null,
  listingType?: string | null,
): PropertyPurpose {
  if (purpose === "stay" || purpose === "rent" || purpose === "sale") {
    return purpose;
  }
  if (listingType === "buy") return "sale";
  if (listingType === "rent_daily") return "stay";
  return "rent";
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseIsoDate(value: string): Date {
  const [y, m, d] = value.split("-").map((part) => Number(part));
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function monthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const start = parseIsoDate(checkIn);
  const end = parseIsoDate(checkOut);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function isCurrencyCode(value: string | undefined | null): value is CurrencyCode {
  if (!value) return false;
  return [
    "ZAR",
    "AOA",
    "MZN",
    "CVE",
    "EUR",
    "BRL",
    "XOF",
    "STN",
    "USD",
    "XAF",
    "ZWL",
    "BWP",
    "NAD",
    "ZMW",
    "NGN",
    "GBP",
    "KES",
    "GHS",
    "EGP",
  ].includes(value);
}

export function formatStayMoney(
  amount: string | number | null | undefined,
  currency: string | undefined,
  fallbackCode: CurrencyCode,
  formatCurrency: (amount: number, code?: CurrencyCode) => string,
): string {
  const value = typeof amount === "number" ? amount : parseFloat(String(amount ?? ""));
  if (Number.isNaN(value)) return "—";
  const code = isCurrencyCode(currency) ? currency : fallbackCode;
  return formatCurrency(value, code);
}
