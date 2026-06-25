"use client";

import { useMemo, useState } from "react";
import PlaceDetailModal from "@/components/PlaceDetailModal";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { useFavorites } from "@/hooks/useFavorites";
import { recommendNextActions } from "@/lib/recommendationEngine";
import type { Place, PlaceCategory, PlaceSource } from "@/types/place";
import type { RecommendationContext } from "@/types/recommendation";
import { calculateDistanceKm } from "@/utils/distance";
import { getNearestPlaceLabel } from "@/utils/location";
import { createGoogleMapsDirectionsUrl } from "@/utils/maps";

type NearbyCategoryId =
  | "food"
  | "cafe"
  | "shopping"
  | "sightseeing"
  | "dessert"
  | "bar";

type NearbyPlace = Place & {
  distanceKm?: number;
  recommendationRank: number;
};

const categoryButtons: Array<{
  id: NearbyCategoryId;
  label: string;
  ariaLabel: string;
  category: PlaceCategory;
  mood: RecommendationContext["mood"];
  timeOfDay: RecommendationContext["timeOfDay"];
}> = [
  {
    id: "food",
    label: "🍜",
    ariaLabel: "맛집",
    category: "food",
    mood: "food",
    timeOfDay: "lunch",
  },
  {
    id: "cafe",
    label: "☕",
    ariaLabel: "카페",
    category: "cafe",
    mood: "rest",
    timeOfDay: "afternoon",
  },
  {
    id: "shopping",
    label: "🛍",
    ariaLabel: "쇼핑",
    category: "shopping",
    mood: "shopping",
    timeOfDay: "afternoon",
  },
  {
    id: "sightseeing",
    label: "🏯",
    ariaLabel: "관광",
    category: "sightseeing",
    mood: "sightseeing",
    timeOfDay: "afternoon",
  },
  {
    id: "dessert",
    label: "🍰",
    ariaLabel: "디저트",
    category: "cafe",
    mood: "dessert",
    timeOfDay: "afternoon",
  },
  {
    id: "bar",
    label: "🍺",
    ariaLabel: "술집",
    category: "food",
    mood: "food",
    timeOfDay: "night",
  },
];

const sourceLabels: Record<PlaceSource, string> = {
  google_saved: "⭐ Google 저장",
  app_recommended: "📌 앱 추천",
  manual: "➕ 직접 추가",
};

export default function NearbyScreen() {
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<NearbyCategoryId>("food");
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null);
  const { location, isLoading, error, refreshLocation } = useCurrentLocation();
  const { placesWithFavorites, toggleFavorite } = useFavorites();

  const selectedCategory = categoryButtons.find(
    (category) => category.id === selectedCategoryId,
  );

  const nearestPlace = useMemo(() => {
    if (!location) {
      return undefined;
    }

    return [...placesWithFavorites].sort((firstPlace, secondPlace) => {
      const firstDistance = calculateDistanceKm(
        location.latitude,
        location.longitude,
        firstPlace.latitude,
        firstPlace.longitude,
      );
      const secondDistance = calculateDistanceKm(
        location.latitude,
        location.longitude,
        secondPlace.latitude,
        secondPlace.longitude,
      );

      return firstDistance - secondDistance;
    })[0];
  }, [location, placesWithFavorites]);

  const nearbyPlaces = useMemo(() => {
    if (!selectedCategory) {
      return [];
    }

    const recommendation = recommendNextActions(
      {
        currentPlaceId: nearestPlace?.id,
        mood: selectedCategory.mood,
        timeOfDay: selectedCategory.timeOfDay,
      },
      placesWithFavorites,
    );
    const recommendationRankById = new Map(
      recommendation.places.map((place, index) => [place.id, index]),
    );

    return placesWithFavorites
      .filter((place) => place.category === selectedCategory.category)
      .map<NearbyPlace>((place) => ({
        ...place,
        distanceKm: location
          ? calculateDistanceKm(
              location.latitude,
              location.longitude,
              place.latitude,
              place.longitude,
            )
          : undefined,
        recommendationRank: recommendationRankById.get(place.id) ?? 999,
      }))
      .sort((firstPlace, secondPlace) => {
        const firstGoogleScore = firstPlace.source === "google_saved" ? 0 : 1;
        const secondGoogleScore = secondPlace.source === "google_saved" ? 0 : 1;

        if (firstGoogleScore !== secondGoogleScore) {
          return firstGoogleScore - secondGoogleScore;
        }

        if (
          firstPlace.distanceKm !== undefined &&
          secondPlace.distanceKm !== undefined
        ) {
          return firstPlace.distanceKm - secondPlace.distanceKm;
        }

        return firstPlace.recommendationRank - secondPlace.recommendationRank;
      });
  }, [location, nearestPlace?.id, placesWithFavorites, selectedCategory]);

  const selectedPlaceWithFavorites = selectedPlace
    ? (nearbyPlaces.find((place) => place.id === selectedPlace.id) ?? null)
    : null;
  const selectedDistance = selectedPlaceWithFavorites?.distanceKm;

  return (
    <section className="space-y-5 pb-[var(--app-screen-bottom-space)]">
      <div>
        <p className="text-sm font-medium text-zinc-500">TravelMate</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal text-black">
          내 주변
        </h1>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] ring-1 ring-zinc-100">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-zinc-500">현재 위치</p>
            <p className="mt-1 text-lg font-bold text-black">
              {location
                ? getNearestPlaceLabel(location, placesWithFavorites)
                : "위치 확인 전"}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {location
                ? "거리순으로 주변 장소를 정리했어요"
                : "내 위치를 확인하면 가까운 장소부터 볼 수 있어요"}
            </p>
          </div>
          <button
            type="button"
            onClick={refreshLocation}
            className="shrink-0 rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white"
          >
            {isLoading ? "확인 중" : "새로고침"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </div>

      <div className="rounded-3xl bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] ring-1 ring-zinc-100">
        <div className="grid grid-cols-6 gap-2">
          {categoryButtons.map((category) => {
            const isSelected = selectedCategoryId === category.id;

            return (
              <button
                key={category.id}
                type="button"
                aria-label={category.ariaLabel}
                aria-pressed={isSelected}
                onClick={() => setSelectedCategoryId(category.id)}
                className={`flex aspect-square items-center justify-center rounded-2xl text-2xl transition ${
                  isSelected
                    ? "bg-blue-600 shadow-sm text-white"
                    : "bg-zinc-100 text-black"
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-bold text-black">
            {selectedCategory?.ariaLabel} 주변 장소
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Google 저장 장소를 먼저 보여주고, 그 안에서 가까운 순서로 정렬해요.
          </p>
        </div>

        {nearbyPlaces.length === 0 ? (
          <div className="rounded-3xl bg-zinc-50 p-5 text-center text-sm text-zinc-500">
            표시할 장소가 없습니다
          </div>
        ) : (
          nearbyPlaces.map((place) => (
            <NearbyPlaceCard
              key={place.id}
              place={place}
              onOpenDetail={() => setSelectedPlace(place)}
            />
          ))
        )}
      </div>

      {selectedPlaceWithFavorites && (
        <PlaceDetailModal
          place={selectedPlaceWithFavorites}
          distanceKm={selectedDistance}
          isOpen={selectedPlaceWithFavorites !== null}
          onClose={() => setSelectedPlace(null)}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </section>
  );
}

function NearbyPlaceCard({
  place,
  onOpenDetail,
}: {
  place: NearbyPlace;
  onOpenDetail: () => void;
}) {
  const directionsUrl = createGoogleMapsDirectionsUrl(
    place.latitude,
    place.longitude,
    place.name,
  );

  return (
    <article className="rounded-3xl bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.07)] ring-1 ring-zinc-100">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-black">
            {place.name}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
              {formatDistance(place.distanceKm)}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                place.source === "google_saved"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {sourceLabels[place.source]}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 items-center justify-center rounded-2xl bg-zinc-900 text-sm font-semibold text-white"
        >
          📍 길찾기
        </a>
        <button
          type="button"
          onClick={onOpenDetail}
          className="min-h-11 rounded-2xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-700"
        >
          상세보기
        </button>
      </div>
    </article>
  );
}

function formatDistance(distanceKm?: number) {
  if (distanceKm === undefined) {
    return "거리 확인 전";
  }

  if (distanceKm < 1) {
    return `약 ${Math.round(distanceKm * 1000)}m`;
  }

  return `약 ${distanceKm.toFixed(1)}km`;
}
