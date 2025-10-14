// hooks/useUserRegion.ts
import { useState, useEffect } from "react";
import { RegionCode, detectUserCountry, getUserRegion } from "../utils/currency";

export function useUserRegion() {
  const [region, setRegion] = useState<RegionCode>("AO");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRegion = async () => {
      try {
        setIsLoading(true);
        // Try to get stored region first
        const storedRegion = await getUserRegion();
        setRegion(storedRegion);
        
        // Then detect and update if needed
        const detectedRegion = await detectUserCountry();
        if (detectedRegion !== storedRegion) {
          setRegion(detectedRegion);
        }
      } catch (error) {
        console.error("Error loading user region:", error);
        setRegion("AO");
      } finally {
        setIsLoading(false);
      }
    };

    loadRegion();
  }, []);

  return { region, isLoading };
}

