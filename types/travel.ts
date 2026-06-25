export type TravelStatus = "planning" | "traveling" | "completed";

export type Travel = {
  id?: string;
  title: string;
  country: string;
  cities: string[];
  startDate: string;
  endDate: string;
  nights: number;
  days: number;
  coverEmoji?: string;
  status?: TravelStatus;
  color?: string;
  createdAt?: string;
};
