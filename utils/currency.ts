// utils/currency.ts

type CurrencyMap = { [code: string]: string };

const regionCurrencyMap: { [region: string]: string } = {
  ZA: "ZAR", AO: "AOA", MZ: "MZN", CV: "CVE", PT: "EUR", BR: "BRL",
  GW: "XOF", ST: "STN", TL: "USD", GQ: "XAF", SN: "XOF", ZW: "USD",
  BW: "BWP", NA: "NAD", ZM: "ZMW", BF: "XOF", NG: "NGN",
};

const currencySymbols: CurrencyMap = {
  ZAR: "R",  AOA: "Kz",  MZN: "MT", CVE: "$",  EUR: "€", BRL: "R$",
  XOF: "CFA", STN: "Db", USD: "$", XAF: "FCFA", ZWL: "Z$", BWP: "P",
  NAD: "N$", ZMW: "K", NGN: "₦"
};

export function getCurrencyForCountry(region?: string): string {
  if (!region) return "USD";
  return regionCurrencyMap[region] || "USD";
}

// UPDATED: Handle bad values gracefully
export function formatCurrency(
  amount: number | undefined | null,
  code = "USD",
  lang = "en"
) {
  // Guard against undefined, null, NaN, and non-number
  if (typeof amount !== "number" || isNaN(amount)) return "";
  try {
    return new Intl.NumberFormat(lang, {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currencySymbols[code] || ""}${(amount ?? 0).toFixed(2)}`;
  }
}
