import type { Place } from "@/types/place";

export type ImportedGooglePlace = {
  name?: unknown;
  title?: unknown;
  address?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  lat?: unknown;
  lng?: unknown;
  url?: unknown;
  note?: unknown;
  [key: string]: unknown;
};

export type GoogleMapsParseResult = {
  places: Place[];
  candidateCount: number;
  excludedWithoutCoordinatesCount: number;
};

const IMPORT_TAGS = ["Google Maps", "가져온 장소"];

export function parseGoogleMapsPlaces(input: unknown): Place[] {
  return parseGoogleMapsPlacesWithReport(input).places;
}

export function parseGoogleMapsPlacesWithReport(
  input: unknown,
): GoogleMapsParseResult {
  const parsedInput = parseInput(input);
  const candidates = extractCandidates(parsedInput);
  const places = candidates
    .map((candidate, index) => toPlace(candidate, index))
    .filter((place): place is Place => place !== null);

  return {
    places,
    candidateCount: candidates.length,
    excludedWithoutCoordinatesCount: candidates.length - places.length,
  };
}

function parseInput(input: unknown): unknown {
  if (typeof input !== "string") {
    return input;
  }

  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return [];
  }

  return JSON.parse(trimmedInput);
}

function extractCandidates(input: unknown): ImportedGooglePlace[] {
  if (Array.isArray(input)) {
    return input.filter(isRecord).map(normalizeCandidate);
  }

  if (!isRecord(input)) {
    return [];
  }

  const knownListKeys = ["places", "items", "savedPlaces", "locations", "features"];

  for (const key of knownListKeys) {
    const value = input[key];

    if (Array.isArray(value)) {
      return value.filter(isRecord).map(normalizeCandidate);
    }
  }

  return [normalizeCandidate(input)];
}

function normalizeCandidate(candidate: ImportedGooglePlace): ImportedGooglePlace {
  const geometry = isRecord(candidate.geometry) ? candidate.geometry : null;
  const properties = isRecord(candidate.properties) ? candidate.properties : null;
  const coordinates = Array.isArray(geometry?.coordinates)
    ? geometry.coordinates
    : null;

  return {
    ...properties,
    ...candidate,
    longitude: candidate.longitude ?? candidate.lng ?? coordinates?.[0],
    latitude: candidate.latitude ?? candidate.lat ?? coordinates?.[1],
  };
}

function toPlace(candidate: ImportedGooglePlace, index: number): Place | null {
  const latitude = toNumber(candidate.latitude ?? candidate.lat);
  const longitude = toNumber(candidate.longitude ?? candidate.lng);

  if (latitude === null || longitude === null) {
    return null;
  }

  const name = toText(candidate.name ?? candidate.title) || "이름 없는 장소";
  const note = toText(candidate.note);
  const url = toText(candidate.url);

  return {
    id: `google-import-${slugify(name)}-${index + 1}`,
    name,
    category: "sightseeing",
    address: toText(candidate.address),
    memo: note,
    latitude,
    longitude,
    tags: [...IMPORT_TAGS],
    source: "google_saved",
    ...(url ? { website: url } : {}),
  };
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsedValue = Number(value.trim());

    if (Number.isFinite(parsedValue)) {
      return parsedValue;
    }
  }

  return null;
}

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "place";
}

function isRecord(value: unknown): value is ImportedGooglePlace {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}