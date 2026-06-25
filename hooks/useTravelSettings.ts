"use client";

import { currentTravel } from "@/data/travel";
import type { Travel } from "@/types/travel";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const TRAVEL_SETTINGS_STORAGE_KEY = "travelmate_current_travel";

export function useTravelSettings() {
  const [storedTravel, setTravel] = useLocalStorage<Travel>(
    TRAVEL_SETTINGS_STORAGE_KEY,
    currentTravel,
  );
  const travel: Travel = {
    ...currentTravel,
    ...storedTravel,
    cities: storedTravel.cities ?? currentTravel.cities,
  };

  return {
    travel,
    setTravel,
  };
}
