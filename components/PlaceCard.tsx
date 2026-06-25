import { useState } from "react";
import { useItinerary } from "@/hooks/useItinerary";
import PlaceDetailModal from "@/components/PlaceDetailModal";
import type { Place, PlaceCategory, PlaceSource } from "@/types/place";
import { createGoogleMapsDirectionsUrl } from "@/utils/maps";

type PlaceCardProps = {
  place: Place;
  onToggleFavorite: (placeId: string) => void;
  distanceKm?: number;
};

const categoryLabels: Record<PlaceCategory, string> = {
  food: "맛집",
  cafe: "카페",
  shopping: "쇼핑",
  sightseeing: "관광",
  convenience: "편의점",
};

const sourceLabels: Record<PlaceSource, string> = {
  google_saved: "⭐ Google 저장",
  app_recommended: "📌 앱 추천",
  manual: "➕ 직접 추가",
};

export default function PlaceCard({
  place,
  onToggleFavorite,
  distanceKm,
}: PlaceCardProps) {
  const directionsUrl = createGoogleMapsDirectionsUrl(
    place.latitude,
    place.longitude,
    place.name,
  );
  const isFavorite = place.favorite === true;
  const isGoogleSaved = place.source === "google_saved";
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddingToItinerary, setIsAddingToItinerary] = useState(false);
  const [addedMessage, setAddedMessage] = useState("");
  const { itinerary, addPlaceToDay } = useItinerary();

  function handleAddToDay(dayId: string) {
    addPlaceToDay(dayId, place);
    setIsAddingToItinerary(false);
    setAddedMessage("일정에 추가되었습니다");
    window.setTimeout(() => setAddedMessage(""), 1800);
  }

  return (
    <article
      onClick={() => setIsDetailOpen(true)}
      className={`rounded-lg border bg-white p-4 text-left shadow-sm ${
        isGoogleSaved
          ? "border-blue-200 shadow-blue-50"
          : isFavorite
            ? "border-yellow-300"
            : "border-zinc-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold leading-7 text-black">
            {place.name}
          </h2>
          <span className="mt-2 inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
            {categoryLabels[place.category]}
          </span>
          <span
            className={`ml-2 mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${
              isGoogleSaved
                ? "bg-blue-50 text-blue-700"
                : "bg-zinc-50 text-zinc-500"
            }`}
          >
            {sourceLabels[place.source]}
          </span>
        </div>

        <button
          type="button"
          aria-label={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
          aria-pressed={isFavorite}
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite(place.id);
          }}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-xl transition-colors ${
            isFavorite
              ? "border-yellow-300 bg-yellow-100 text-yellow-600"
              : "border-zinc-200 bg-white text-zinc-300"
          }`}
        >
          ★
        </button>
      </div>

      <p className="mt-3 text-sm leading-6 text-zinc-600">{place.address}</p>
      {distanceKm !== undefined && (
        <p className="mt-2 text-sm font-medium text-zinc-700">
          현재 위치에서 {formatDistance(distanceKm)}
        </p>
      )}
      <p className="mt-2 text-sm leading-6 text-zinc-500">{place.memo}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {place.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-zinc-50 px-2.5 py-1 text-xs text-zinc-500"
          >
            #{tag}
          </span>
        ))}
      </div>

      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => event.stopPropagation()}
        className="mt-5 flex h-11 w-full items-center justify-center rounded-lg bg-black text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
      >
        길찾기
      </a>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setIsAddingToItinerary((current) => !current);
        }}
        className="mt-3 flex h-11 w-full items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 transition-colors hover:border-black"
      >
        일정 추가
      </button>

      {isAddingToItinerary && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {itinerary.days.map((day) => (
            <button
              key={day.id}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleAddToDay(day.id);
              }}
              className="min-h-11 rounded-lg bg-zinc-100 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-200"
            >
              Day {day.dayNumber}
            </button>
          ))}
        </div>
      )}

      {addedMessage && (
        <p className="mt-3 text-center text-sm font-medium text-zinc-500">
          {addedMessage}
        </p>
      )}
      <PlaceDetailModal
        place={place}
        distanceKm={distanceKm}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onToggleFavorite={onToggleFavorite}
      />
    </article>
  );
}

function formatDistance(distanceKm: number) {
  if (distanceKm < 1) {
    return `약 ${Math.round(distanceKm * 1000)}m`;
  }

  return `약 ${distanceKm.toFixed(1)}km`;
}
