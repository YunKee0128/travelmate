import type { Travel } from "@/types/travel";

const currentTravelId = "fukuoka-yufuin-2026";

export const travels: Travel[] = [
  {
    id: currentTravelId,
    title: "후쿠오카 · 유후인 여행",
    country: "일본",
    cities: ["후쿠오카", "유후인"],
    startDate: "2026-07-10",
    endDate: "2026-07-13",
    nights: 3,
    days: 4,
    coverEmoji: "🇯🇵",
    status: "traveling",
    color: "blue",
    createdAt: "2026-06-25",
  },
];

export const currentTravel =
  travels.find((travel) => travel.id === currentTravelId) ?? travels[0];
