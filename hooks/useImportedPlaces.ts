"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Place, PlaceCategory } from "@/types/place";

const IMPORTED_PLACES_STORAGE_KEY = "travelmate_imported_places";
const IMPORTED_PLACES_UPDATED_EVENT = "travelmate_imported_places_updated";

type ImportedPlacesUpdatedEventDetail = {
  sourceId: string;
  importedPlaces: Place[];
};

export type SaveImportedPlacesResult = {
  addedCount: number;
  duplicateCount: number;
  totalCount: number;
};

export type ImportedPlaceDetailsUpdate = Partial<
  Pick<
    Place,
    | "description"
    | "memo"
    | "priceRange"
    | "openingHours"
    | "phone"
    | "website"
    | "reservationRequired"
    | "reservationUrl"
    | "averageStayTime"
    | "recommendedTime"
  >
>;

function createHookId() {
  return Math.random().toString(36).slice(2);
}

function createCoordinateKey(place: Place) {
  return `${place.name.trim().toLowerCase()}|${place.latitude}|${place.longitude}`;
}

export function dedupePlaces(placeList: Place[]) {
  const seenIds = new Set<string>();
  const seenCoordinateKeys = new Set<string>();
  const dedupedPlaces: Place[] = [];

  for (const place of placeList) {
    const coordinateKey = createCoordinateKey(place);

    if (seenIds.has(place.id) || seenCoordinateKeys.has(coordinateKey)) {
      continue;
    }

    seenIds.add(place.id);
    seenCoordinateKeys.add(coordinateKey);
    dedupedPlaces.push(place);
  }

  return dedupedPlaces;
}

export function mergePlaces(basePlaces: Place[], importedPlaces: Place[]) {
  return dedupePlaces([...basePlaces, ...importedPlaces]);
}

function hasSeenPlace(
  place: Place,
  seenIds: Set<string>,
  seenCoordinateKeys: Set<string>,
) {
  return seenIds.has(place.id) || seenCoordinateKeys.has(createCoordinateKey(place));
}

function createSaveImportedPlacesResult(
  currentPlaces: Place[],
  newPlaces: Place[],
) {
  const nextPlaces = dedupePlaces(currentPlaces);
  const seenIds = new Set(nextPlaces.map((place) => place.id));
  const seenCoordinateKeys = new Set(nextPlaces.map(createCoordinateKey));
  let duplicateCount = 0;

  for (const place of newPlaces) {
    if (hasSeenPlace(place, seenIds, seenCoordinateKeys)) {
      duplicateCount += 1;
      continue;
    }

    seenIds.add(place.id);
    seenCoordinateKeys.add(createCoordinateKey(place));
    nextPlaces.push(place);
  }

  return {
    importedPlaces: nextPlaces,
    result: {
      addedCount: nextPlaces.length - dedupePlaces(currentPlaces).length,
      duplicateCount,
      totalCount: nextPlaces.length,
    },
  };
}

function isPlace(value: unknown): value is Place {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const place = value as Partial<Place>;

  return (
    typeof place.id === "string" &&
    typeof place.name === "string" &&
    typeof place.category === "string" &&
    typeof place.address === "string" &&
    typeof place.memo === "string" &&
    typeof place.latitude === "number" &&
    Number.isFinite(place.latitude) &&
    typeof place.longitude === "number" &&
    Number.isFinite(place.longitude) &&
    Array.isArray(place.tags) &&
    place.tags.every((tag) => typeof tag === "string") &&
    typeof place.source === "string"
  );
}

function readImportedPlaces() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const savedValue = window.localStorage.getItem(IMPORTED_PLACES_STORAGE_KEY);

    if (!savedValue) {
      return [];
    }

    const parsedValue = JSON.parse(savedValue);

    return Array.isArray(parsedValue)
      ? dedupePlaces(parsedValue.filter(isPlace))
      : [];
  } catch {
    return [];
  }
}

function writeImportedPlaces(sourceId: string, importedPlaces: Place[]) {
  if (typeof window === "undefined") {
    return;
  }

  const dedupedPlaces = dedupePlaces(importedPlaces);

  try {
    window.localStorage.setItem(
      IMPORTED_PLACES_STORAGE_KEY,
      JSON.stringify(dedupedPlaces),
    );
  } catch {
    // localStorage can fail in private browsing or restricted environments.
  }

  window.dispatchEvent(
    new CustomEvent<ImportedPlacesUpdatedEventDetail>(
      IMPORTED_PLACES_UPDATED_EVENT,
      {
        detail: {
          sourceId,
          importedPlaces: dedupedPlaces,
        },
      },
    ),
  );
}

function removeImportedPlaces(sourceId: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(IMPORTED_PLACES_STORAGE_KEY);
  } catch {
    // localStorage can fail in private browsing or restricted environments.
  }

  window.dispatchEvent(
    new CustomEvent<ImportedPlacesUpdatedEventDetail>(
      IMPORTED_PLACES_UPDATED_EVENT,
      {
        detail: {
          sourceId,
          importedPlaces: [],
        },
      },
    ),
  );
}

export function useImportedPlaces() {
  const sourceIdRef = useRef(createHookId());
  const [importedPlaces, setImportedPlaces] =
    useState<Place[]>(readImportedPlaces);

  useEffect(() => {
    function handleImportedPlacesUpdated(event: Event) {
      const detail = (
        event as CustomEvent<ImportedPlacesUpdatedEventDetail>
      ).detail;

      if (!detail || detail.sourceId === sourceIdRef.current) {
        return;
      }

      setImportedPlaces(detail.importedPlaces);
    }

    function handleStorage(event: StorageEvent) {
      if (event.key !== IMPORTED_PLACES_STORAGE_KEY) {
        return;
      }

      setImportedPlaces(readImportedPlaces());
    }

    window.addEventListener(
      IMPORTED_PLACES_UPDATED_EVENT,
      handleImportedPlacesUpdated,
    );
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        IMPORTED_PLACES_UPDATED_EVENT,
        handleImportedPlacesUpdated,
      );
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const saveImportedPlaces = useCallback(
    (places: Place[]): SaveImportedPlacesResult => {
      const saveResult = createSaveImportedPlacesResult(importedPlaces, places);

      setImportedPlaces(saveResult.importedPlaces);
      writeImportedPlaces(sourceIdRef.current, saveResult.importedPlaces);

      return saveResult.result;
    },
    [importedPlaces],
  );

  const clearImportedPlaces = useCallback(() => {
    setImportedPlaces([]);
    removeImportedPlaces(sourceIdRef.current);
  }, []);

  const updateImportedPlaceCategory = useCallback(
    (placeId: string, category: PlaceCategory) => {
      setImportedPlaces((currentImportedPlaces) => {
        const nextImportedPlaces = currentImportedPlaces.map((place) =>
          place.id === placeId ? { ...place, category } : place,
        );

        writeImportedPlaces(sourceIdRef.current, nextImportedPlaces);

        return nextImportedPlaces;
      });
    },
    [],
  );

  const updateImportedPlaceDetails = useCallback(
    (placeId: string, details: ImportedPlaceDetailsUpdate) => {
      setImportedPlaces((currentImportedPlaces) => {
        const nextImportedPlaces = currentImportedPlaces.map((place) =>
          place.id === placeId ? { ...place, ...details } : place,
        );

        writeImportedPlaces(sourceIdRef.current, nextImportedPlaces);

        return nextImportedPlaces;
      });
    },
    [],
  );

  return useMemo(
    () => ({
      importedPlaces,
      saveImportedPlaces,
      clearImportedPlaces,
      updateImportedPlaceCategory,
      updateImportedPlaceDetails,
    }),
    [
      clearImportedPlaces,
      importedPlaces,
      saveImportedPlaces,
      updateImportedPlaceCategory,
      updateImportedPlaceDetails,
    ],
  );
}
