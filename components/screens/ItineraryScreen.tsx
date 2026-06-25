"use client";

import { useState } from "react";
import { places } from "@/data/places";
import { useItinerary } from "@/hooks/useItinerary";
import type { ItineraryPlace } from "@/types/itinerary";
import type { Place, PlaceCategory, PlaceSource } from "@/types/place";
import { createGoogleMapsDirectionsUrl } from "@/utils/maps";

const placeMap = new Map(places.map((place) => [place.id, place]));

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

export default function ItineraryScreen() {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const {
    itinerary,
    removePlaceFromDay,
    resetItinerary,
    toggleItineraryPlaceCompleted,
    updateItineraryPlaceMemo,
    updateItineraryPlaceTime,
  } = useItinerary();

  function handleResetItinerary() {
    const shouldReset = window.confirm(
      "전체 일정을 기본값으로 되돌릴까요? 추가한 장소가 사라집니다.",
    );

    if (shouldReset) {
      resetItinerary();
    }
  }

  const selectedDay =
    itinerary.days[Math.min(selectedDayIndex, itinerary.days.length - 1)];
  const completedPlaceCount =
    selectedDay?.places.filter((place) => place.completed).length ?? 0;
  const totalPlaceCount = selectedDay?.places.length ?? 0;

  function moveDay(direction: "previous" | "next") {
    setSelectedDayIndex((currentIndex) => {
      if (direction === "previous") {
        return Math.max(currentIndex - 1, 0);
      }

      return Math.min(currentIndex + 1, itinerary.days.length - 1);
    });
  }

  return (
    <section className="pb-[var(--app-screen-bottom-space)]">
      <div className="mb-6">
        <p className="text-sm font-semibold text-zinc-500">
          {itinerary.city}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-normal">
          {itinerary.title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          3박 4일 일정을 날짜별로 확인하세요.
        </p>
        <button
          type="button"
          onClick={handleResetItinerary}
          className="mt-4 h-11 w-full rounded-2xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 transition-colors hover:border-black"
        >
          일정 초기화
        </button>
      </div>

      <div className="mb-5 grid grid-cols-4 gap-2">
        {itinerary.days.map((day, index) => {
          const isSelected = index === selectedDayIndex;

          return (
            <button
              key={day.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedDayIndex(index)}
              className={`h-11 rounded-2xl text-sm font-semibold transition-colors ${
                isSelected
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-100 text-zinc-500"
              }`}
            >
              Day{day.dayNumber}
            </button>
          );
        })}
      </div>

      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => moveDay("previous")}
          disabled={selectedDayIndex === 0}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-lg font-bold text-zinc-700 transition-colors disabled:text-zinc-300"
        >
          ◀
        </button>
        <div className="min-w-0 text-center">
          <p className="text-sm font-semibold text-zinc-500">
            Day {selectedDay?.dayNumber}
          </p>
          <p className="truncate text-lg font-bold text-black">
            {selectedDay?.title}
          </p>
        </div>
        <button
          type="button"
          onClick={() => moveDay("next")}
          disabled={selectedDayIndex === itinerary.days.length - 1}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-lg font-bold text-zinc-700 transition-colors disabled:text-zinc-300"
        >
          ▶
        </button>
      </div>

      {selectedDay && (
        <div>
          <article
            className="rounded-3xl border border-zinc-100 bg-white p-4 shadow-lg shadow-zinc-100 sm:p-5"
          >
            <div className="mb-5">
              <p className="text-base font-bold text-zinc-500">
                Day {selectedDay.dayNumber}
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-normal text-black">
                {selectedDay.title}
              </h2>
              <p className="mt-2 text-sm font-semibold text-blue-600">
                {completedPlaceCount} / {totalPlaceCount} 완료
              </p>
            </div>

            <div className="space-y-4">
              {selectedDay.places.map((itineraryPlace) => (
                <ItineraryPlaceItem
                  key={itineraryPlace.id}
                  itineraryPlace={itineraryPlace}
                  connectedPlace={
                    itineraryPlace.placeId
                      ? placeMap.get(itineraryPlace.placeId)
                      : undefined
                  }
                  onDelete={() =>
                    removePlaceFromDay(selectedDay.id, itineraryPlace.id)
                  }
                  onToggleCompleted={() =>
                    toggleItineraryPlaceCompleted(
                      selectedDay.id,
                      itineraryPlace.id,
                    )
                  }
                  onTimeChange={(newTimeLabel) =>
                    updateItineraryPlaceTime(
                      selectedDay.id,
                      itineraryPlace.id,
                      newTimeLabel,
                    )
                  }
                  onMemoChange={(newMemo) =>
                    updateItineraryPlaceMemo(
                      selectedDay.id,
                      itineraryPlace.id,
                      newMemo,
                    )
                  }
                />
              ))}
            </div>
          </article>
        </div>
      )}
    </section>
  );
}

function ItineraryPlaceItem({
  itineraryPlace,
  connectedPlace,
  onDelete,
  onMemoChange,
  onTimeChange,
  onToggleCompleted,
}: {
  itineraryPlace: ItineraryPlace;
  connectedPlace?: Place;
  onDelete: () => void;
  onMemoChange: (newMemo: string) => void;
  onTimeChange: (newTimeLabel: string) => void;
  onToggleCompleted: () => void;
}) {
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [memoDraft, setMemoDraft] = useState(itineraryPlace.memo ?? "");
  const directionsUrl = connectedPlace
    ? createGoogleMapsDirectionsUrl(
        connectedPlace.latitude,
        connectedPlace.longitude,
        connectedPlace.name,
      )
    : null;

  return (
    <div
      className={`relative rounded-3xl border p-4 shadow-md shadow-zinc-100 ${
        itineraryPlace.completed
          ? "border-zinc-100 bg-zinc-50 opacity-75"
          : "border-zinc-100 bg-white"
      }`}
    >
      <button
        type="button"
        aria-label={
          itineraryPlace.completed ? "방문 완료 해제" : "방문 완료 표시"
        }
        aria-pressed={itineraryPlace.completed === true}
        onClick={onToggleCompleted}
        className={`absolute right-16 top-3 flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold shadow-sm transition-colors ${
          itineraryPlace.completed
            ? "bg-blue-600 text-white"
            : "bg-zinc-50 text-zinc-400"
        }`}
      >
        ✓
      </button>

      <button
        type="button"
        aria-label="일정 장소 삭제"
        onClick={onDelete}
        className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-50 text-sm text-red-500 shadow-sm transition-colors hover:bg-red-50"
      >
        🗑️
      </button>

      <div className="space-y-3 pt-12">
        <div>
          <p className="text-lg font-bold leading-6 text-black">
            {itineraryPlace.timeLabel ?? "시간 미정"}
          </p>
          <button
            type="button"
            onClick={() => setIsEditingTime((current) => !current)}
            className="mt-2 min-h-11 rounded-2xl bg-zinc-100 px-4 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-200"
          >
            ✏️
          </button>
        </div>

        <div className="min-w-0">
          <h3
            className={`text-xl font-bold leading-7 text-black ${
              itineraryPlace.completed ? "line-through decoration-zinc-400" : ""
            }`}
          >
            {itineraryPlace.name}
          </h3>
          {itineraryPlace.completed && (
            <span className="mt-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              완료
            </span>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {connectedPlace && (
              <>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                  {categoryLabels[connectedPlace.category]}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    connectedPlace.source === "google_saved"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {sourceLabels[connectedPlace.source]}
                </span>
              </>
            )}
          </div>

          {itineraryPlace.memo && (
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              {itineraryPlace.memo}
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              setMemoDraft(itineraryPlace.memo ?? "");
              setIsEditingMemo((current) => !current);
            }}
            className="mt-3 min-h-11 w-full rounded-2xl bg-zinc-100 px-4 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-200"
          >
            📝
          </button>

          {isEditingTime && (
            <div className="mt-4 rounded-2xl bg-zinc-50 p-3">
              <label className="block">
                <span className="text-xs font-semibold text-zinc-500">
                  시간 수정
                </span>
                <input
                  type="time"
                  value={
                    isTimeValue(itineraryPlace.timeLabel)
                      ? itineraryPlace.timeLabel
                      : ""
                  }
                  onChange={(event) => onTimeChange(event.target.value)}
                  className="mt-2 min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-black outline-none focus:border-black"
                />
              </label>
              <button
                type="button"
                onClick={() => onTimeChange("시간 미정")}
                className="mt-2 min-h-11 rounded-xl px-3 text-xs font-semibold text-zinc-500"
              >
                시간 미정으로 설정
              </button>
            </div>
          )}

          {isEditingMemo && (
            <div className="mt-4 rounded-2xl bg-zinc-50 p-3">
              <label className="block">
                <span className="text-xs font-semibold text-zinc-500">
                  메모 수정
                </span>
                <textarea
                  value={memoDraft}
                  onChange={(event) => setMemoDraft(event.target.value)}
                  rows={3}
                  className="mt-2 w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm leading-6 text-black outline-none focus:border-black"
                  placeholder="메모를 입력하세요"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  onMemoChange(memoDraft);
                  setIsEditingMemo(false);
                }}
                className="mt-2 min-h-11 rounded-full bg-black px-4 text-xs font-semibold text-white"
              >
                메모 저장
              </button>
            </div>
          )}

          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-zinc-100 px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-200"
            >
              📍 길찾기
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function isTimeValue(timeLabel?: string) {
  return /^\d{2}:\d{2}$/.test(timeLabel ?? "");
}
