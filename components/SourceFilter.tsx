"use client";

import type { PlaceSource } from "@/types/place";

export type SourceFilterValue = "all" | PlaceSource;

type SourceFilterProps = {
  selectedSource: SourceFilterValue;
  onSourceChange: (source: SourceFilterValue) => void;
};

const sources: { value: SourceFilterValue; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "google_saved", label: "Google 저장" },
  { value: "app_recommended", label: "앱 추천" },
  { value: "manual", label: "직접 추가" },
];

export default function SourceFilter({
  selectedSource,
  onSourceChange,
}: SourceFilterProps) {
  return (
    <div className="-mx-4 overflow-x-auto overscroll-x-contain px-4 no-scrollbar sm:-mx-6 sm:px-6">
      <div className="flex flex-nowrap gap-2 whitespace-nowrap pb-2">
        {sources.map((source) => {
          const isSelected = selectedSource === source.value;

          return (
            <button
              key={source.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSourceChange(source.value)}
              className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors ${
                isSelected
                  ? "border-black bg-black text-white"
                  : "border-zinc-200 bg-white text-zinc-600"
              }`}
            >
              {source.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
