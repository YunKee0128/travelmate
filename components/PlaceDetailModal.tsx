"use client";

import { useEffect, useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { useItinerary } from "@/hooks/useItinerary";
import type { Place, PlaceCategory, PlaceSource } from "@/types/place";
import { createGoogleMapsDirectionsUrl } from "@/utils/maps";

type PlaceDetailModalProps = {
  place: Place;
  distanceKm?: number;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite?: (placeId: string) => void;
};

const categoryLabels: Record<PlaceCategory, string> = {
  food: "🍜 맛집",
  cafe: "☕ 카페",
  shopping: "🛍 쇼핑",
  sightseeing: "🏯 관광",
  convenience: "🏪 편의점",
};

const sourceLabels: Record<PlaceSource, string> = {
  google_saved: "⭐ Google 저장",
  app_recommended: "📌 앱 추천",
  manual: "➕ 직접 추가",
};

export default function PlaceDetailModal({
  place,
  distanceKm,
  isOpen,
  onClose,
  onToggleFavorite,
}: PlaceDetailModalProps) {
  const [isAddingToItinerary, setIsAddingToItinerary] = useState(false);
  const [addedMessage, setAddedMessage] = useState("");
  const { isFavorite, toggleFavorite } = useFavorites();
  const { itinerary, addPlaceToDay } = useItinerary();
  const isPlaceFavorite = isFavorite(place.id);
  const directionsUrl = createGoogleMapsDirectionsUrl(
    place.latitude,
    place.longitude,
    place.name,
  );

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  function handleAddToDay(dayId: string) {
    addPlaceToDay(dayId, place);
    setIsAddingToItinerary(false);
    setAddedMessage("일정에 추가되었습니다");
    window.setTimeout(() => setAddedMessage(""), 1800);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end bg-black/40 px-4 pb-[max(1rem,var(--app-safe-bottom))] pt-[max(1rem,var(--app-safe-top))]"
      onClick={(event) => {
        event.stopPropagation();
        onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="place-detail-title"
        className="relative max-h-[calc(100dvh-var(--app-safe-top)-var(--app-safe-bottom)-2rem)] w-full overflow-y-auto overscroll-contain rounded-t-3xl bg-white p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-zinc-200" />

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2
              id="place-detail-title"
              className="text-2xl font-bold tracking-normal text-black"
            >
              {place.name}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge>{categoryLabels[place.category]}</Badge>
              <Badge isHighlighted={place.source === "google_saved"}>
                {sourceLabels[place.source]}
              </Badge>
              <Badge>{isPlaceFavorite ? "❤️ 즐겨찾기" : "♡ 즐겨찾기 아님"}</Badge>
              {place.reservationRequired && (
                <Badge tone="red">예약 권장</Badge>
              )}
            </div>
          </div>
          <button
            type="button"
            aria-label="장소 상세 닫기"
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-lg font-semibold text-zinc-600"
          >
            ×
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="flex h-11 items-center justify-center rounded-2xl bg-black text-sm font-semibold text-white"
          >
            📍 길찾기
          </a>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setIsAddingToItinerary((current) => !current);
            }}
            className="h-11 rounded-2xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-700"
          >
            📅 일정 추가
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              if (onToggleFavorite) {
                onToggleFavorite(place.id);
                return;
              }

              toggleFavorite(place.id);
            }}
            className="h-11 rounded-2xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-700"
          >
            {isPlaceFavorite ? "❤️ 해제" : "❤️ 즐겨찾기"}
          </button>
        </div>

        {isAddingToItinerary && (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {itinerary.days.map((day) => (
              <button
                key={day.id}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleAddToDay(day.id);
                }}
                className="min-h-11 rounded-xl bg-zinc-100 text-xs font-semibold text-zinc-700"
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

        <div className="mt-6 space-y-5">
          <DetailGroup title="기본 정보">
            {distanceKm !== undefined && (
              <DetailItem title="거리" value={`현재 위치에서 ${formatDistance(distanceKm)}`} />
            )}
            {place.description && (
              <DetailItem title="설명" value={place.description} />
            )}
            {place.memo && <DetailItem title="메모" value={place.memo} />}
            {place.goodFor && place.goodFor.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {place.goodFor.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </DetailGroup>

          <DetailGroup title="여행 정보">
            <div className="grid grid-cols-2 gap-3">
              {place.rating !== undefined && (
                <DetailItem
                  title="평점"
                  value={`★ ${place.rating.toFixed(1)}${
                    place.reviewCount ? ` (${place.reviewCount})` : ""
                  }`}
                />
              )}
              {place.priceRange && (
                <DetailItem title="가격대" value={place.priceRange} />
              )}
              {place.openingHours && (
                <DetailItem title="영업시간" value={place.openingHours} />
              )}
              {place.averageStayTime && (
                <DetailItem title="평균 체류" value={place.averageStayTime} />
              )}
              {place.recommendedTime && (
                <DetailItem title="추천 시간" value={place.recommendedTime} />
              )}
            </div>
          </DetailGroup>

          {(place.reservationUrl || place.website || place.phone) && (
            <DetailGroup title="예약/연락">
              {place.phone && <DetailItem title="전화" value={place.phone} />}
              <div className="grid grid-cols-2 gap-2">
                {place.website && (
                  <a
                    href={place.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    className="flex min-h-11 items-center justify-center rounded-2xl bg-zinc-100 px-3 text-sm font-semibold text-zinc-700"
                  >
                    홈페이지
                  </a>
                )}
                {place.reservationUrl && (
                  <a
                    href={place.reservationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    className="flex min-h-11 items-center justify-center rounded-2xl bg-red-50 px-3 text-sm font-semibold text-red-700"
                  >
                    예약하기
                  </a>
                )}
              </div>
            </DetailGroup>
          )}

          {place.travelerTips && place.travelerTips.length > 0 && (
            <DetailGroup title="여행 팁">
              <div className="space-y-2">
                {place.travelerTips.map((tip) => (
                  <p
                    key={tip}
                    className="rounded-2xl bg-zinc-50 px-3 py-2 text-sm leading-6 text-zinc-700"
                  >
                    {tip}
                  </p>
                ))}
              </div>
            </DetailGroup>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({
  children,
  isHighlighted = false,
  tone,
}: {
  children: React.ReactNode;
  isHighlighted?: boolean;
  tone?: "red";
}) {
  const className =
    tone === "red"
      ? "bg-red-50 text-red-700"
      : isHighlighted
        ? "bg-blue-50 text-blue-700"
        : "bg-zinc-100 text-zinc-600";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}

function DetailGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 text-base font-bold text-black">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function DetailItem({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-3">
      <p className="text-xs font-semibold text-zinc-500">{title}</p>
      <p className="mt-1 text-sm leading-6 text-zinc-700">{value}</p>
    </div>
  );
}

function formatDistance(distanceKm: number) {
  if (distanceKm < 1) {
    return `약 ${Math.round(distanceKm * 1000)}m`;
  }

  return `약 ${distanceKm.toFixed(1)}km`;
}
