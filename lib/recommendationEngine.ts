import { recommendNearbyPlaces } from "@/lib/recommendPlaces";
import type {
  RecommendationContext,
  RecommendationResult,
} from "@/types/recommendation";
import type { Place, PlaceCategory } from "@/types/place";

const MAX_RECOMMENDATION_COUNT = 5;
const GOOGLE_SAVED_DISTANCE_BONUS_KM = 0.4;

const timeOfDayCategoryPriority: Record<
  RecommendationContext["timeOfDay"],
  PlaceCategory[]
> = {
  morning: ["cafe", "sightseeing", "convenience"],
  lunch: ["food", "cafe", "shopping"],
  afternoon: ["cafe", "shopping", "sightseeing"],
  dinner: ["food", "shopping", "sightseeing"],
  night: ["food", "shopping", "sightseeing"],
};

const moodCategoryPriority: Record<
  NonNullable<RecommendationContext["mood"]>,
  PlaceCategory[]
> = {
  food: ["food"],
  dessert: ["cafe"],
  shopping: ["shopping"],
  sightseeing: ["sightseeing"],
  rest: ["cafe", "sightseeing", "convenience"],
};

function getPreferredCategories(context: RecommendationContext) {
  if (context.mood) {
    return moodCategoryPriority[context.mood];
  }

  return timeOfDayCategoryPriority[context.timeOfDay];
}

function getCategoryScore(place: Place, preferredCategories: PlaceCategory[]) {
  const categoryIndex = preferredCategories.indexOf(place.category);

  if (categoryIndex === -1) {
    return preferredCategories.length + 1;
  }

  return categoryIndex;
}

function getSourceScore(place: Place) {
  if (place.source === "google_saved") {
    return -1;
  }

  return 0;
}

function getDistanceAwareScore(place: Place & { distanceKm?: number }) {
  const distanceScore = place.distanceKm ?? 0;
  const sourceBonus =
    place.source === "google_saved" ? GOOGLE_SAVED_DISTANCE_BONUS_KM : 0;

  return distanceScore - sourceBonus;
}

function createReason(context: RecommendationContext) {
  if (context.mood) {
    return `현재 기분(${context.mood})과 어울리는 저장 장소를 우선 추천했어요.`;
  }

  if (context.currentPlaceId) {
    return "현재 장소와 가까운 저장 장소를 시간대에 맞춰 추천했어요.";
  }

  return "현재 시간대와 즐겨찾기 여부를 기준으로 저장 장소를 추천했어요.";
}

export function recommendNextActions(
  context: RecommendationContext,
  places: Place[],
): RecommendationResult {
  const preferredCategories = getPreferredCategories(context);
  const currentPlace = context.currentPlaceId
    ? places.find((place) => place.id === context.currentPlaceId)
    : undefined;

  const recommendationCandidates = currentPlace
    ? recommendNearbyPlaces(currentPlace, places, places.length)
    : [...places];

  const recommendedPlaces = recommendationCandidates
    .sort((firstPlace, secondPlace) => {
      const firstCategoryScore = getCategoryScore(
        firstPlace,
        preferredCategories,
      );
      const secondCategoryScore = getCategoryScore(
        secondPlace,
        preferredCategories,
      );

      if (firstCategoryScore !== secondCategoryScore) {
        return firstCategoryScore - secondCategoryScore;
      }

      if (currentPlace) {
        return (
          getDistanceAwareScore(firstPlace) - getDistanceAwareScore(secondPlace)
        );
      }

      if (!currentPlace) {
        const firstFavoriteScore = firstPlace.favorite ? 0 : 1;
        const secondFavoriteScore = secondPlace.favorite ? 0 : 1;

        if (firstFavoriteScore !== secondFavoriteScore) {
          return firstFavoriteScore - secondFavoriteScore;
        }

        return getSourceScore(firstPlace) - getSourceScore(secondPlace);
      }

      return 0;
    })
    .slice(0, MAX_RECOMMENDATION_COUNT);

  return {
    title: "다음 장소 추천",
    reason: createReason(context),
    places: recommendedPlaces,
  };
}
