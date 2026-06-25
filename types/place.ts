export type PlaceCategory =
  | "food"
  | "cafe"
  | "shopping"
  | "sightseeing"
  | "convenience";

export type PlaceSource = "google_saved" | "app_recommended" | "manual";

export type Place = {
  id: string;
  name: string;
  category: PlaceCategory;
  address: string;
  memo: string;
  latitude: number;
  longitude: number;
  tags: string[];
  source: PlaceSource;
  description?: string;
  rating?: number;
  reviewCount?: number;
  priceRange?: string;
  openingHours?: string;
  phone?: string;
  website?: string;
  reservationRequired?: boolean;
  reservationUrl?: string;
  averageStayTime?: string;
  recommendedTime?: string;
  travelerTips?: string[];
  goodFor?: string[];
  favorite?: boolean;
};
