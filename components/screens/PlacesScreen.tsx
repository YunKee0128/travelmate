"use client";

import { useMemo, useState } from "react";
import CategoryFilter, {
  type CategoryFilterValue,
} from "@/components/CategoryFilter";
import PlaceCard from "@/components/PlaceCard";
import SourceFilter, { type SourceFilterValue } from "@/components/SourceFilter";
import { places } from "@/data/places";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { useFavorites } from "@/hooks/useFavorites";
import { mergePlaces, useImportedPlaces } from "@/hooks/useImportedPlaces";
import type { Place } from "@/types/place";
import { calculateDistanceKm } from "@/utils/distance";

function matchesSearch(place: Place, searchQuery: string) {
  const query = searchQuery.trim().toLowerCase();

  if (!query) {
    return true;
  }

  const searchableText = [
    place.name,
    place.address,
    place.memo,
    ...place.tags,
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(query);
}

export default function PlacesScreen() {
  const { importedPlaces } = useImportedPlaces();
  const allPlaces = useMemo(
    () => mergePlaces(places, importedPlaces),
    [importedPlaces],
  );
  const { placesWithFavorites, toggleFavorite } = useFavorites(allPlaces);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilterValue>("all");
  const [selectedSource, setSelectedSource] =
    useState<SourceFilterValue>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const { location, isLoading, error, refreshLocation } = useCurrentLocation();

  const filteredPlaces = placesWithFavorites.filter((place) => {
    const matchesCategory =
      selectedCategory === "all" || place.category === selectedCategory;
    const matchesSource =
      selectedSource === "all" || place.source === selectedSource;
    const matchesFavorite = !showFavoritesOnly || place.favorite === true;

    return (
      matchesCategory &&
      matchesSource &&
      matchesFavorite &&
      matchesSearch(place, searchQuery)
    );
  });

  return (
    <section className="pb-[var(--app-screen-bottom-space)]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-normal">장소 목록</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          저장해 둔 후쿠오카 장소를 카테고리와 검색어로 확인하세요.
        </p>
      </div>

      <label className="mb-4 block">
        <span className="sr-only">장소 검색</span>
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="장소, 주소, 메모, 태그 검색"
          className="h-12 w-full rounded-lg border border-zinc-200 bg-white px-4 text-sm text-black outline-none transition-colors placeholder:text-zinc-400 focus:border-black"
        />
      </label>

      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <div className="mt-3">
        <SourceFilter
          selectedSource={selectedSource}
          onSourceChange={setSelectedSource}
        />
      </div>

      <button
        type="button"
        aria-pressed={showFavoritesOnly}
        onClick={() => setShowFavoritesOnly((current) => !current)}
        className={`mt-3 h-11 w-full rounded-lg border text-sm font-semibold transition-colors ${
          showFavoritesOnly
            ? "border-yellow-300 bg-yellow-100 text-yellow-700"
            : "border-zinc-200 bg-white text-zinc-600"
        }`}
      >
        ★ 즐겨찾기만 보기
      </button>

      <button
        type="button"
        onClick={refreshLocation}
        disabled={isLoading}
        className="mt-3 h-11 w-full rounded-lg border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 transition-colors hover:border-black disabled:cursor-not-allowed disabled:text-zinc-400"
      >
        {isLoading ? "현재 위치 확인 중..." : "내 위치로 거리 계산"}
      </button>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm leading-6 text-red-700">
          {error}
        </p>
      )}

      {filteredPlaces.length > 0 ? (
        <div className="mt-5 flex flex-col gap-4">
          {filteredPlaces.map((place) => {
            const distanceKm = location
              ? calculateDistanceKm(
                  location.latitude,
                  location.longitude,
                  place.latitude,
                  place.longitude,
                )
              : undefined;

            return (
              <PlaceCard
                key={place.id}
                place={place}
                onToggleFavorite={toggleFavorite}
                distanceKm={distanceKm}
              />
            );
          })}
        </div>
      ) : (
        <p className="mt-12 text-center text-sm text-zinc-500">
          검색 결과가 없습니다
        </p>
      )}
    </section>
  );
}
