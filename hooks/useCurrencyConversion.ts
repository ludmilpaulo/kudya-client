// hooks/useCurrencyConversion.ts
import { useState, useEffect, useCallback } from "react";
import { 
  CurrencyCode, 
  fetchExchangeRates, 
  convertCurrency,
  formatCurrency,
  getCurrencyForCountry 
} from "../utils/currency";
import { useUserRegion } from "./useUserRegion";

export function useCurrencyConversion() {
  const { region } = useUserRegion();
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const targetCurrency = getCurrencyForCountry(region);

  useEffect(() => {
    const loadRates = async () => {
      setLoading(true);
      const exchangeRates = await fetchExchangeRates();
      setRates(exchangeRates);
      setLoading(false);
    };

    loadRates();
  }, []);

  const convertPrice = useCallback(
    async (amountInAOA: number, toCurrency?: CurrencyCode): Promise<number> => {
      const targetCode = toCurrency || targetCurrency;
      return await convertCurrency(amountInAOA, "AOA", targetCode);
    },
    [targetCurrency]
  );

  const formatPrice = useCallback(
    async (amountInAOA: number, toCurrency?: CurrencyCode, language?: string): Promise<string> => {
      const targetCode = toCurrency || targetCurrency;
      const lang = language || "en";
      
      try {
        const converted = await convertPrice(amountInAOA, targetCode);
        return formatCurrency(converted, targetCode, lang);
      } catch (error) {
        // Fallback to original amount
        return formatCurrency(amountInAOA, targetCode, lang);
      }
    },
    [convertPrice, targetCurrency]
  );

  return {
    rates,
    loading,
    targetCurrency,
    region,
    convertPrice,
    formatPrice,
  };
}

