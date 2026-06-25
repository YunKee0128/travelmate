import type { Place } from "@/types/place";
import { calculateDistanceKm } from "@/utils/distance";

export type RecommendedPlace = Place & {
  distanceKm: number;
};

export function recommendNearbyPlaces(
  basePlace: Place,
  allPlaces: Place[],
  limit = 5,
): RecommendedPlace[] {
  return allPlaces
    .filter((place) => place.id !== basePlace.id)
    .map((place) => ({
      ...place,
      distanceKm: calculateDistanceKm(
        basePlace.latitude,
        basePlace.longitude,
        place.latitude,
        place.longitude,
      ),
    }))
    .sort(
      (firstPlace, secondPlace) =>
        firstPlace.distanceKm - secondPlace.distanceKm,
    )
    .slice(0, limit);
}
