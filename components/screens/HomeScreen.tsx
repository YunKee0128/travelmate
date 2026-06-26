"use client";

import { useMemo, useState } from "react";
import PlaceDetailModal from "@/components/PlaceDetailModal";
import { sampleItinerary } from "@/data/itinerary";
import { places } from "@/data/places";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { useFavorites } from "@/hooks/useFavorites";
import { mergePlaces, useImportedPlaces } from "@/hooks/useImportedPlaces";
import { useItinerary } from "@/hooks/useItinerary";
import { useTravelSettings } from "@/hooks/useTravelSettings";
import { recommendNextActions } from "@/lib/recommendationEngine";
import type { Place, PlaceCategory, PlaceSource } from "@/types/place";
import type { RecommendationContext } from "@/types/recommendation";
import { formatTravelDateRange } from "@/utils/date";
import { calculateDistanceKm } from "@/utils/distance";
import { getNearestPlaceLabel } from "@/utils/location";
import { createGoogleMapsDirectionsUrl } from "@/utils/maps";

type RecommendationActionId =
  | "meal"
  | "cafe"
  | "shopping"
  | "sightseeing"
  | "dessert"
  | "bar";

type RecommendationAction = {
  id: RecommendationActionId;
  label: string;
  category: PlaceCategory;
  mood: NonNullable<RecommendationContext["mood"]>;
  reason: string;
};

const todayItinerary = sampleItinerary.days[0];
const recommendationActions: RecommendationAction[] = [
  {
    id: "meal",
    label: "🍜 밥",
    category: "food",
    mood: "food",
    reason: "지금 식사하기 좋은 저장 장소를 골랐어요.",
  },
  {
    id: "cafe",
    label: "☕ 카페",
    category: "cafe",
    mood: "rest",
    reason: "잠깐 쉬기 좋은 카페 장소를 우선 추천했어요.",
  },
  {
    id: "shopping",
    label: "🛍 쇼핑",
    category: "shopping",
    mood: "shopping",
    reason: "쇼핑 동선에 넣기 좋은 장소를 골랐어요.",
  },
  {
    id: "sightseeing",
    label: "🏯 관광",
    category: "sightseeing",
    mood: "sightseeing",
    reason: "여행 분위기를 느끼기 좋은 관광지를 추천했어요.",
  },
  {
    id: "dessert",
    label: "🍰 디저트",
    category: "cafe",
    mood: "dessert",
    reason: "디저트나 커피 타임에 어울리는 장소를 골랐어요.",
  },
  {
    id: "bar",
    label: "🍺 술집",
    category: "food",
    mood: "food",
    reason: "저녁에 가볍게 들르기 좋은 먹거리 장소를 추천했어요.",
  },
];

const sourceLabels: Record<PlaceSource, string> = {
  google_saved: "⭐ Google 저장",
  app_recommended: "📌 앱 추천",
  manual: "➕ 직접 추가",
};

export default function HomeScreen() {
  const [selectedRecommendationId, setSelectedRecommendationId] =
    useState<RecommendationActionId | null>(null);
  const [addingPlaceId, setAddingPlaceId] = useState<string | null>(null);
  const [addedPlaceId, setAddedPlaceId] = useState<string | null>(null);
  const { travel } = useTravelSettings();
  const { importedPlaces } = useImportedPlaces();
  const allPlaces = useMemo(
    () => mergePlaces(places, importedPlaces),
    [importedPlaces],
  );
  const { placesWithFavorites, toggleFavorite } = useFavorites(allPlaces);
  const { itinerary, addPlaceToDay } = useItinerary();
  const { location, isLoading, error, refreshLocation } = useCurrentLocation();
  const currentLocationLabel = location
    ? getNearestPlaceLabel(location, placesWithFavorites)
    : null;
  const nearestPlace = location
    ? getNearestPlace(location, placesWithFavorites)
    : null;
  const selectedRecommendationAction = recommendationActions.find(
    (action) => action.id === selectedRecommendationId,
  );
  const recommendationResult = selectedRecommendationAction
    ? recommendNextActions(
        {
          currentPlaceId: nearestPlace?.id,
          timeOfDay:
            selectedRecommendationAction.id === "bar" ? "night" : "afternoon",
          mood: selectedRecommendationAction.mood,
        },
        placesWithFavorites,
      )
    : null;
  const recommendedPlaces =
    recommendationResult?.places
      .filter((place) => place.category === selectedRecommendationAction?.category)
      .slice(0, 5) ?? [];
  const favoritePlaces = placesWithFavorites
    .filter((place) => place.favorite)
    .slice(0, 3);

  function handleRecommendationClick(actionId: RecommendationActionId) {
    setSelectedRecommendationId((currentActionId) =>
      currentActionId === actionId ? null : actionId,
    );
    setAddingPlaceId(null);
  }

  function handleAddPlaceToDay(dayId: string, place: Place) {
    addPlaceToDay(dayId, place);
    setAddingPlaceId(null);
    setAddedPlaceId(place.id);
    window.setTimeout(() => setAddedPlaceId(null), 1800);
  }

  return (
    <section className="space-y-5 pb-[var(--app-screen-bottom-space)]">
      <DashboardCard>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-zinc-500">
              📍 현재 위치
            </p>
            {location ? (
              <div className="mt-3">
                <p className="text-lg font-bold text-black">
                  {currentLocationLabel}
                </p>
                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  방금 업데이트됨
                </p>
              </div>
            ) : (
              <p className="mt-3 text-lg font-bold text-black">
                현재 위치를 확인해보세요
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={refreshLocation}
          disabled={isLoading}
          className="mt-5 h-12 w-full rounded-2xl bg-black text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          {isLoading
            ? "위치 확인 중..."
            : location
              ? "위치 새로고침"
              : "현재 위치 확인"}
        </button>

        {error && (
          <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            {error}
          </p>
        )}
      </DashboardCard>

      <div className="rounded-3xl bg-black p-6 text-white shadow-lg shadow-zinc-200">
        <p className="text-sm font-medium text-zinc-300">🇯🇵 여행 정보</p>
        <h1 className="mt-3 text-2xl font-bold tracking-normal">
          {travel.title}
        </h1>
        <p className="mt-4 text-sm text-zinc-300">
          {formatTravelDateRange(travel.startDate, travel.endDate)}
        </p>
        <p className="mt-1 text-lg font-semibold">
          {travel.nights}박 {travel.days}일
        </p>
      </div>

      <DashboardCard>
        <SectionHeader title="지금 뭐 하고 싶으세요?" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          {recommendationActions.map((action) => (
            <button
              key={action.id}
              type="button"
              aria-pressed={selectedRecommendationId === action.id}
              onClick={() => handleRecommendationClick(action.id)}
              className={`h-14 rounded-2xl text-base font-semibold transition-colors ${
                selectedRecommendationId === action.id
                  ? "bg-black text-white"
                  : "bg-zinc-100 text-black hover:bg-zinc-200"
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>

        {selectedRecommendationAction && (
          <div className="mt-5 space-y-3">
            <div>
              <p className="text-base font-bold text-black">
                {location ? "현재 위치 주변 추천" : "내 저장 장소 우선 추천"}
              </p>
              <p className="mt-1 text-sm leading-6 text-zinc-500">
                {selectedRecommendationAction.reason}
              </p>
            </div>

            {recommendedPlaces.map((place) => {
              const distanceKm = location
                ? calculateDistanceKm(
                    location.latitude,
                    location.longitude,
                    place.latitude,
                    place.longitude,
                  )
                : undefined;

              return (
                <RecommendationPlaceCard
                  key={place.id}
                  place={place}
                  distanceKm={distanceKm}
                  reason={
                    recommendationResult?.reason ??
                    selectedRecommendationAction.reason
                  }
                  itineraryDays={itinerary.days.map((day) => ({
                    id: day.id,
                    dayNumber: day.dayNumber,
                  }))}
                  isAddingToItinerary={addingPlaceId === place.id}
                  isAdded={addedPlaceId === place.id}
                  onToggleAdd={() =>
                    setAddingPlaceId((currentPlaceId) =>
                      currentPlaceId === place.id ? null : place.id,
                    )
                  }
                  onAddToDay={(dayId) => handleAddPlaceToDay(dayId, place)}
                  onToggleFavorite={toggleFavorite}
                />
              );
            })}
          </div>
        )}
      </DashboardCard>

      <DashboardCard>
        <SectionHeader title="⭐ 즐겨찾기 장소" actionLabel="전체 보기" />
        <div className="mt-4 space-y-3">
          {favoritePlaces.map((place) => (
            <div
              key={place.id}
              className="rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3"
            >
              <p className="font-semibold text-black">{place.name}</p>
              <p className="mt-1 text-sm leading-6 text-zinc-500">
                {place.memo}
              </p>
            </div>
          ))}
        </div>
      </DashboardCard>

      <DashboardCard>
        <SectionHeader title="📅 오늘 일정" />
        <div className="mt-4">
          <p className="text-sm font-semibold text-zinc-500">
            Day {todayItinerary.dayNumber}
          </p>
          <h2 className="mt-1 text-lg font-bold text-black">
            {todayItinerary.title}
          </h2>
          <div className="mt-4 space-y-3">
            {todayItinerary.places.map((place) => (
              <div key={place.id} className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-black" />
                <div>
                  <p className="font-semibold text-black">{place.name}</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-500">
                    {place.timeLabel}
                    {place.memo ? ` · ${place.memo}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-5 h-11 w-full rounded-2xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-700"
          >
            오늘 일정 보기
          </button>
          {/* TODO: 일정 탭으로 이동하도록 app/page.tsx의 탭 상태 제어와 연결하기 */}
        </div>
      </DashboardCard>
    </section>
  );
}

function getNearestPlace(
  location: { latitude: number; longitude: number },
  placeList: Place[],
) {
  return placeList
    .map((place) => ({
      place,
      distanceKm: calculateDistanceKm(
        location.latitude,
        location.longitude,
        place.latitude,
        place.longitude,
      ),
    }))
    .sort(
      (firstPlace, secondPlace) =>
        firstPlace.distanceKm - secondPlace.distanceKm,
    )[0]?.place;
}

function RecommendationPlaceCard({
  place,
  distanceKm,
  reason,
  itineraryDays,
  isAddingToItinerary,
  isAdded,
  onToggleAdd,
  onAddToDay,
  onToggleFavorite,
}: {
  place: Place;
  distanceKm?: number;
  reason: string;
  itineraryDays: { id: string; dayNumber: number }[];
  isAddingToItinerary: boolean;
  isAdded: boolean;
  onToggleAdd: () => void;
  onAddToDay: (dayId: string) => void;
  onToggleFavorite: (placeId: string) => void;
}) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const directionsUrl = createGoogleMapsDirectionsUrl(
    place.latitude,
    place.longitude,
    place.name,
  );
  const isGoogleSaved = place.source === "google_saved";

  return (
    <div
      onClick={() => setIsDetailOpen(true)}
      className={`rounded-2xl border p-4 ${
        isGoogleSaved
          ? "border-blue-200 bg-blue-50"
          : "border-zinc-100 bg-zinc-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-black">{place.name}</p>
          <p className="mt-1 text-sm font-medium text-zinc-600">
            {distanceKm === undefined
              ? "거리: 위치 확인 후 표시"
              : `거리: ${formatDistance(distanceKm)}`}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isGoogleSaved ? "bg-white text-blue-700" : "bg-white text-zinc-500"
          }`}
        >
          {sourceLabels[place.source]}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-zinc-500">{reason}</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => event.stopPropagation()}
          className="flex min-h-11 items-center justify-center rounded-2xl bg-black text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
        >
          길찾기
        </a>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleAdd();
          }}
          className="min-h-11 rounded-2xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-700"
        >
          일정 추가
        </button>
      </div>

      {isAddingToItinerary && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {itineraryDays.map((day) => (
            <button
              key={day.id}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onAddToDay(day.id);
              }}
              className="min-h-11 rounded-xl bg-white text-xs font-semibold text-zinc-700"
            >
              Day {day.dayNumber}
            </button>
          ))}
        </div>
      )}

      {isAdded && (
        <p className="mt-3 text-center text-sm font-medium text-zinc-500">
          일정에 추가되었습니다
        </p>
      )}
      <PlaceDetailModal
        place={place}
        distanceKm={distanceKm}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onToggleFavorite={onToggleFavorite}
      />
    </div>
  );
}

function formatDistance(distanceKm: number) {
  if (distanceKm < 1) {
    return `약 ${Math.round(distanceKm * 1000)}m`;
  }

  return `약 ${distanceKm.toFixed(1)}km`;
}

function DashboardCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-zinc-100 bg-white p-5 shadow-lg shadow-zinc-100">
      {children}
    </div>
  );
}

function SectionHeader({
  title,
  actionLabel,
}: {
  title: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-lg font-bold text-black">{title}</h2>
      {actionLabel && (
        <button
          type="button"
          className="shrink-0 text-sm font-semibold text-zinc-500"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
