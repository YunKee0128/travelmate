import type { Place } from "@/types/place";
import { calculateDistanceKm } from "@/utils/distance";

type Location = {
  latitude: number;
  longitude: number;
};

export function getNearestPlaceLabel(
  currentLocation: Location,
  placeList: Place[],
) {
  if (placeList.length === 0) {
    return "현재 위치 확인 완료";
  }

  const nearestPlace = placeList
    .map((place) => ({
      place,
      distanceKm: calculateDistanceKm(
        currentLocation.latitude,
        currentLocation.longitude,
        place.latitude,
        place.longitude,
      ),
    }))
    .sort(
      (firstPlace, secondPlace) =>
        firstPlace.distanceKm - secondPlace.distanceKm,
    )[0]?.place;

  if (!nearestPlace) {
    return "현재 위치 확인 완료";
  }

  return `${nearestPlace.name} 근처`;
}
