"use client";

import { useCallback, useState } from "react";

type CurrentLocation = {
  latitude: number;
  longitude: number;
};

type UseCurrentLocationResult = {
  location: CurrentLocation | null;
  isLoading: boolean;
  error: string | null;
  refreshLocation: () => void;
};

export function useCurrentLocation(): UseCurrentLocationResult {
  const [location, setLocation] = useState<CurrentLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshLocation = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setError("이 브라우저에서는 현재 위치를 가져올 수 없습니다.");
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLoading(false);
      },
      (geolocationError) => {
        setIsLoading(false);

        if (geolocationError.code === geolocationError.PERMISSION_DENIED) {
          setError("위치 권한이 거부되었습니다. 브라우저 설정을 확인해주세요.");
          return;
        }

        setError("현재 위치를 가져오지 못했습니다. 잠시 후 다시 시도해주세요.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  }, []);

  return {
    location,
    isLoading,
    error,
    refreshLocation,
  };
}
