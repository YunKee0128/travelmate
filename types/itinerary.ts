export type ItineraryPlace = {
  id: string;
  placeId?: string;
  name: string;
  memo?: string;
  timeLabel?: string;
  completed?: boolean;
};

export type ItineraryDay = {
  id: string;
  dayNumber: number;
  title: string;
  places: ItineraryPlace[];
};

export type Itinerary = {
  id: string;
  title: string;
  city: string;
  days: ItineraryDay[];
};
