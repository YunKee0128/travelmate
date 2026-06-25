"use client";

import { sampleItinerary } from "@/data/itinerary";
import type { Itinerary, ItineraryPlace } from "@/types/itinerary";
import type { Place } from "@/types/place";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const ITINERARY_STORAGE_KEY = "travelmate_itinerary";

export function useItinerary() {
  const [itinerary, setItinerary] = useLocalStorage<Itinerary>(
    ITINERARY_STORAGE_KEY,
    sampleItinerary,
  );

  function addPlaceToDay(dayId: string, place: Place) {
    const itineraryPlace: ItineraryPlace = {
      id: `${dayId}-${place.id}-${Date.now()}`,
      placeId: place.id,
      name: place.name,
      memo: place.memo,
      timeLabel: "시간 미정",
    };

    setItinerary((currentItinerary) => ({
      ...currentItinerary,
      days: currentItinerary.days.map((day) =>
        day.id === dayId
          ? {
              ...day,
              places: [...day.places, itineraryPlace],
            }
          : day,
      ),
    }));
  }

  function removePlaceFromDay(dayId: string, itineraryPlaceId: string) {
    setItinerary((currentItinerary) => ({
      ...currentItinerary,
      days: currentItinerary.days.map((day) =>
        day.id === dayId
          ? {
              ...day,
              places: day.places.filter(
                (place) => place.id !== itineraryPlaceId,
              ),
            }
          : day,
      ),
    }));
  }

  function updateItineraryPlaceTime(
    dayId: string,
    itineraryPlaceId: string,
    newTimeLabel: string,
  ) {
    setItinerary((currentItinerary) => ({
      ...currentItinerary,
      days: currentItinerary.days.map((day) =>
        day.id === dayId
          ? {
              ...day,
              places: day.places.map((place) =>
                place.id === itineraryPlaceId
                  ? {
                      ...place,
                      timeLabel: newTimeLabel,
                    }
                  : place,
              ),
            }
          : day,
      ),
    }));
  }

  function updateItineraryPlaceMemo(
    dayId: string,
    itineraryPlaceId: string,
    newMemo: string,
  ) {
    setItinerary((currentItinerary) => ({
      ...currentItinerary,
      days: currentItinerary.days.map((day) =>
        day.id === dayId
          ? {
              ...day,
              places: day.places.map((place) =>
                place.id === itineraryPlaceId
                  ? {
                      ...place,
                      memo: newMemo,
                    }
                  : place,
              ),
            }
          : day,
      ),
    }));
  }

  function toggleItineraryPlaceCompleted(
    dayId: string,
    itineraryPlaceId: string,
  ) {
    setItinerary((currentItinerary) => ({
      ...currentItinerary,
      days: currentItinerary.days.map((day) =>
        day.id === dayId
          ? {
              ...day,
              places: day.places.map((place) =>
                place.id === itineraryPlaceId
                  ? {
                      ...place,
                      completed: !place.completed,
                    }
                  : place,
              ),
            }
          : day,
      ),
    }));
  }

  function resetItinerary() {
    setItinerary(sampleItinerary);
  }

  return {
    itinerary,
    setItinerary,
    addPlaceToDay,
    removePlaceFromDay,
    updateItineraryPlaceTime,
    updateItineraryPlaceMemo,
    toggleItineraryPlaceCompleted,
    resetItinerary,
  };
}
