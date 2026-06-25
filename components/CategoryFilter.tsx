"use client";

import type { PlaceCategory } from "@/types/place";

export type CategoryFilterValue = "all" | PlaceCategory;

type CategoryFilterProps = {
  selectedCategory: CategoryFilterValue;
  onCategoryChange: (category: CategoryFilterValue) => void;
};

const categories: { value: CategoryFilterValue; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "food", label: "맛집" },
  { value: "cafe", label: "카페" },
  { value: "shopping", label: "쇼핑" },
  { value: "sightseeing", label: "관광" },
  { value: "convenience", label: "편의점" },
];

export default function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="-mx-4 overflow-x-auto overscroll-x-contain px-4 no-scrollbar sm:-mx-6 sm:px-6">
      <div className="flex flex-nowrap gap-2 whitespace-nowrap pb-2">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.value;

          return (
            <button
              key={category.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onCategoryChange(category.value)}
              className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors ${
                isSelected
                  ? "border-black bg-black text-white"
                  : "border-zinc-200 bg-white text-zinc-600"
              }`}
            >
              {category.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
