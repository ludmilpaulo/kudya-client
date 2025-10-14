// utils/currency.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

export type RegionCode =
  | "ZA" | "AO" | "MZ" | "CV" | "PT" | "BR" | "GW" | "ST" | "TL" | "GQ"
  | "SN" | "ZW" | "BW" | "NA" | "ZM" | "BF" | "NG" | "US" | "GB" | "KE" | "GH" | "EG";

export type CurrencyCode =
  | "ZAR" | "AOA" | "MZN" | "CVE" | "EUR" | "BRL" | "XOF" | "STN" | "USD"
  | "XAF" | "ZWL" | "BWP" | "NAD" | "ZMW" | "NGN" | "GBP" | "KES" | "GHS" | "EGP";

const regionCurrencyMap: Record<RegionCode, CurrencyCode> = {
  ZA: "ZAR",
  AO: "AOA",
  MZ: "MZN",
  CV: "CVE",
  PT: "EUR",
  BR: "BRL",
  GW: "XOF",
  ST: "STN",
  TL: "USD",
  GQ: "XAF",
  SN: "XOF",
  ZW: "USD",
  BW: "BWP",
  NA: "NAD",
  ZM: "ZMW",
  BF: "XOF",
  NG: "NGN",
  US: "USD",
  GB: "GBP",
  KE: "KES",
  GH: "GHS",
  EG: "EGP",
};

const currencySymbols: Record<CurrencyCode, string> = {
  ZAR: "R",
  AOA: "Kz",
  MZN: "MT",
  CVE: "$",
  EUR: "€",
  BRL: "R$",
  XOF: "CFA",
  STN: "Db",
  USD: "$",
  XAF: "FCFA",
  ZWL: "Z$",
  BWP: "P",
  NAD: "N$",
  ZMW: "K",
  NGN: "₦",
  GBP: "£",
  KES: "KSh",
  GHS: "GH₵",
  EGP: "E£",
};

const currencyLocales: Record<CurrencyCode, string> = {
  ZAR: "en-ZA",
  AOA: "pt-AO",
  MZN: "pt-MZ",
  CVE: "pt-CV",
  EUR: "pt-PT",
  BRL: "pt-BR",
  XOF: "fr-SN",
  STN: "pt-ST",
  USD: "en-US",
  XAF: "fr-GQ",
  ZWL: "en-ZW",
  BWP: "en-BW",
  NAD: "en-NA",
  ZMW: "en-ZM",
  NGN: "en-NG",
  GBP: "en-GB",
  KES: "en-KE",
  GHS: "en-GH",
  EGP: "ar-EG",
};

export function getCurrencyForCountry(region?: string): CurrencyCode {
  if (!region) return "AOA";
  return regionCurrencyMap[region as RegionCode] || "AOA";
}

export function formatCurrency(
  amount: number | undefined | null,
  code?: CurrencyCode,
  lang?: string
): string {
  if (typeof amount !== "number" || isNaN(amount)) return "";
  
  const currencyCode = code || "AOA";
  const locale = lang || currencyLocales[currencyCode] || "en-US";
  
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currencySymbols[currencyCode] || ""}${(amount ?? 0).toFixed(2)}`;
  }
}

export const supportedRegionList: { code: RegionCode; label: string; flag: string }[] = [
  { code: "ZA", label: "South Africa", flag: "🇿🇦" },
  { code: "AO", label: "Angola", flag: "🇦🇴" },
  { code: "MZ", label: "Mozambique", flag: "🇲🇿" },
  { code: "CV", label: "Cape Verde", flag: "🇨🇻" },
  { code: "PT", label: "Portugal", flag: "🇵🇹" },
  { code: "BR", label: "Brazil", flag: "🇧🇷" },
  { code: "GW", label: "Guinea-Bissau", flag: "🇬🇼" },
  { code: "ST", label: "São Tomé & Príncipe", flag: "🇸🇹" },
  { code: "TL", label: "Timor-Leste", flag: "🇹🇱" },
  { code: "GQ", label: "Equatorial Guinea", flag: "🇬🇶" },
  { code: "SN", label: "Senegal", flag: "🇸🇳" },
  { code: "ZW", label: "Zimbabwe", flag: "🇿🇼" },
  { code: "BW", label: "Botswana", flag: "🇧🇼" },
  { code: "NA", label: "Namibia", flag: "🇳🇦" },
  { code: "ZM", label: "Zambia", flag: "🇿🇲" },
  { code: "BF", label: "Burkina Faso", flag: "🇧🇫" },
  { code: "NG", label: "Nigeria", flag: "🇳🇬" },
  { code: "US", label: "United States", flag: "🇺🇸" },
  { code: "GB", label: "United Kingdom", flag: "🇬🇧" },
  { code: "KE", label: "Kenya", flag: "🇰🇪" },
  { code: "GH", label: "Ghana", flag: "🇬🇭" },
  { code: "EG", label: "Egypt", flag: "🇪🇬" },
];

/**
 * Detect user's country from device locale
 */
export async function detectUserCountry(): Promise<RegionCode> {
  try {
    // Try to get from AsyncStorage first
    const storedRegion = await AsyncStorage.getItem("userRegion");
    if (storedRegion && regionCurrencyMap[storedRegion as RegionCode]) {
      return storedRegion as RegionCode;
    }

    // Get from device locale
    const locales = Localization.getLocales();
    if (locales && locales.length > 0) {
      const regionCode = locales[0].regionCode as RegionCode;
      if (regionCode && regionCurrencyMap[regionCode]) {
        await AsyncStorage.setItem("userRegion", regionCode);
        return regionCode;
      }
    }

    // Try geolocation API
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      const countryCode = data.country_code as RegionCode;
      
      if (countryCode && regionCurrencyMap[countryCode]) {
        await AsyncStorage.setItem("userRegion", countryCode);
        return countryCode;
      }
    } catch (geoError) {
      console.log('Geolocation API failed, using default');
    }
    
    // Default to Angola
    return "AO";
  } catch (error) {
    console.error('Error detecting country:', error);
    return "AO"; // Default to Angola
  }
}

/**
 * Set user's region manually
 */
export async function setUserRegion(region: RegionCode): Promise<void> {
  await AsyncStorage.setItem("userRegion", region);
}

/**
 * Get stored user region or default
 */
export async function getUserRegion(): Promise<RegionCode> {
  try {
    const storedRegion = await AsyncStorage.getItem("userRegion");
    if (storedRegion && regionCurrencyMap[storedRegion as RegionCode]) {
      return storedRegion as RegionCode;
    }
  } catch (error) {
    console.error('Error getting user region:', error);
  }
  return "AO"; // Default to Angola
}

/**
 * Get currency symbol for a region
 */
export function getCurrencySymbol(region: RegionCode): string {
  const currency = getCurrencyForCountry(region);
  return currencySymbols[currency] || "$";
}
