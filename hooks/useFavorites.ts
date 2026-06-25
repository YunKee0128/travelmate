"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { places } from "@/data/places";
import type { Place } from "@/types/place";

const FAVORITE_PLACES_STORAGE_KEY = "travelmate_favorite_places";
const FAVORITES_UPDATED_EVENT = "travelmate_favorite_places_updated";

type FavoritesUpdatedEventDetail = {
  sourceId: string;
  favoritePlaceIds: string[];
};

const defaultFavoritePlaceIds = places
  .filter((place) => place.favorite === true)
  .map((place) => place.id);

function createHookId() {
  return Math.random().toString(36).slice(2);
}

function readFavoritePlaceIds() {
  if (typeof window === "undefined") {
    return defaultFavoritePlaceIds;
  }

  try {
    const savedValue = window.localStorage.getItem(FAVORITE_PLACES_STORAGE_KEY);

    if (!savedValue) {
      return defaultFavoritePlaceIds;
    }

    const parsedValue = JSON.parse(savedValue);

    return Array.isArray(parsedValue)
      ? parsedValue.filter(
          (placeId): placeId is string => typeof placeId === "string",
        )
      : defaultFavoritePlaceIds;
  } catch {
    return defaultFavoritePlaceIds;
  }
}

function writeFavoritePlaceIds(
  sourceId: string,
  favoritePlaceIds: string[],
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      FAVORITE_PLACES_STORAGE_KEY,
      JSON.stringify(favoritePlaceIds),
    );
  } catch {
    // localStorage can fail in private browsing or restricted environments.
  }

  window.dispatchEvent(
    new CustomEvent<FavoritesUpdatedEventDetail>(FAVORITES_UPDATED_EVENT, {
      detail: {
        sourceId,
        favoritePlaceIds,
      },
    }),
  );
}

export function useFavorites(placeList: Place[] = places) {
  const sourceIdRef = useRef(createHookId());
  const [favoritePlaceIds, setFavoritePlaceIds] = useState<string[]>(
    readFavoritePlaceIds,
  );

  useEffect(() => {
    function handleFavoritesUpdated(event: Event) {
      const detail = (event as CustomEvent<FavoritesUpdatedEventDetail>).detail;

      if (!detail || detail.sourceId === sourceIdRef.current) {
        return;
      }

      setFavoritePlaceIds(detail.favoritePlaceIds);
    }

    function handleStorage(event: StorageEvent) {
      if (event.key !== FAVORITE_PLACES_STORAGE_KEY) {
        return;
      }

      setFavoritePlaceIds(readFavoritePlaceIds());
    }

    window.addEventListener(FAVORITES_UPDATED_EVENT, handleFavoritesUpdated);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(FAVORITES_UPDATED_EVENT, handleFavoritesUpdated);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const favoritePlaceIdSet = useMemo(
    () => new Set(favoritePlaceIds),
    [favoritePlaceIds],
  );

  const placesWithFavorites = useMemo(
    () =>
      placeList.map((place) => ({
        ...place,
        favorite: favoritePlaceIdSet.has(place.id),
      })),
    [favoritePlaceIdSet, placeList],
  );

  const toggleFavorite = useCallback((placeId: string) => {
    setFavoritePlaceIds((currentFavoritePlaceIds) => {
      const nextFavoritePlaceIds = currentFavoritePlaceIds.includes(placeId)
        ? currentFavoritePlaceIds.filter(
            (favoritePlaceId) => favoritePlaceId !== placeId,
          )
        : [...currentFavoritePlaceIds, placeId];

      writeFavoritePlaceIds(sourceIdRef.current, nextFavoritePlaceIds);

      return nextFavoritePlaceIds;
    });
  }, []);

  const isFavorite = useCallback(
    (placeId: string) => favoritePlaceIdSet.has(placeId),
    [favoritePlaceIdSet],
  );

  return {
    favoritePlaceIds,
    isFavorite,
    placesWithFavorites,
    toggleFavorite,
  };
}
