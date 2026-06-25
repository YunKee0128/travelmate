import type { Place } from "@/types/place";

export type RecommendationContext = {
  currentPlaceId?: string;
  timeOfDay: "morning" | "lunch" | "afternoon" | "dinner" | "night";
  mood?: "food" | "dessert" | "shopping" | "sightseeing" | "rest";
};

export type RecommendationResult = {
  title: string;
  reason: string;
  places: Array<Place & { distanceKm?: number }>;
};
