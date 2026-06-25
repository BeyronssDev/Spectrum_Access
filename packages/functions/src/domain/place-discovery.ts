import type {
  DiscoveredPlace,
  Locale,
  Place,
  PlaceCategory,
  SensoryCriterion
} from "@accessibilitat/shared";
import type { GooglePlaceCandidate } from "../ports/places.js";

export const defaultGooglePlaceTypes = [
  "restaurant",
  "cafe",
  "bar",
  "bakery",
  "park",
  "museum",
  "library",
  "shopping_mall",
  "store",
  "pharmacy",
  "hospital",
  "doctor",
  "school",
  "university",
  "train_station",
  "subway_station",
  "bus_station",
  "movie_theater",
  "performing_arts_theater",
  "city_hall",
  "local_government_office",
  "tourist_attraction"
] as const;

const placeTypeCategory: Record<string, PlaceCategory> = {
  other: "other",
  restaurant: "restaurant",
  cafe: "cafe",
  bar: "bar",
  bakery: "cafe",
  park: "park",
  public_space: "public_space",
  plaza: "public_space",
  public_square: "public_space",
  town_square: "public_space",
  museum: "culture",
  library: "culture",
  art_gallery: "culture",
  art_museum: "culture",
  movie_theater: "culture",
  performing_arts_theater: "culture",
  shopping_mall: "shop",
  shop: "shop",
  store: "shop",
  book_store: "shop",
  clothing_store: "shop",
  pharmacy: "medical_center",
  hospital: "medical_center",
  medical_center: "medical_center",
  doctor: "medical_center",
  school: "education",
  education: "education",
  university: "education",
  train_station: "transport",
  transport: "transport",
  subway_station: "transport",
  bus_station: "transport",
  city_hall: "public_administration",
  public_administration: "public_administration",
  local_government_office: "public_administration",
  tourist_attraction: "leisure",
  leisure: "leisure",
  culture: "culture"
};

export function categoryFromGoogleTypes(primaryType: string | undefined, types: string[]): PlaceCategory {
  const candidates = [primaryType, ...types].filter((value): value is string => typeof value === "string");
  for (const type of candidates) {
    const category = placeTypeCategory[type];
    if (category) {
      return category;
    }
  }

  return "other";
}

export function cityFromFormattedAddress(address: string): string {
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const candidate = parts.length >= 3 ? parts[parts.length - 3] : (parts[parts.length - 2] ?? parts[0] ?? "");
  return candidate.replace(/^\d{4,6}\s+/, "").trim() || candidate;
}

export function distanceBetweenKm(origin: { latitude: number; longitude: number }, destination: { latitude: number; longitude: number }) {
  const earthRadiusKm = 6371;
  const latDelta = toRadians(destination.latitude - origin.latitude);
  const lngDelta = toRadians(destination.longitude - origin.longitude);
  const originLat = toRadians(origin.latitude);
  const destinationLat = toRadians(destination.latitude);
  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(originLat) * Math.cos(destinationLat) * Math.sin(lngDelta / 2) * Math.sin(lngDelta / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function sanitizeCriterionAverages(value: Place["criterionAverages"]) {
  if (!value) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [SensoryCriterion, number] => typeof entry[1] === "number")
  ) as Partial<Record<SensoryCriterion, number>>;
}

export function spectrumPlaceToDiscoveredPlace(place: Place): DiscoveredPlace {
  const criterionAverages = sanitizeCriterionAverages(place.criterionAverages);
  return {
    id: `spectrum:${place.id}`,
    source: "spectrum",
    name: place.name,
    category: place.category,
    city: place.city,
    addressOrArea: place.addressOrArea,
    description: place.description,
    position: place.position,
    spectrumPlaceId: place.id,
    ...(place.external?.googlePlaceId ? { googlePlaceId: place.external.googlePlaceId } : {}),
    ratingCount: place.ratingCount,
    imageCount: place.imageCount,
    averageScore: place.averageScore,
    ...(criterionAverages ? { criterionAverages } : {}),
    hasSpectrumData: place.ratingCount > 0 || place.imageCount > 0 || Boolean(criterionAverages),
    updatedAt: place.updatedAt
  };
}

export function googlePlaceToDiscoveredPlace(place: GooglePlaceCandidate, _locale: Locale): DiscoveredPlace {
  const category = categoryFromGoogleTypes(place.primaryType, place.types);
  return {
    id: `google:${place.googlePlaceId}`,
    source: "google_places",
    name: place.name,
    category,
    city: cityFromFormattedAddress(place.formattedAddress),
    addressOrArea: place.formattedAddress,
    description: "",
    position: {
      latitude: place.latitude,
      longitude: place.longitude
    },
    googlePlaceId: place.googlePlaceId,
    ratingCount: 0,
    imageCount: 0,
    averageScore: 0,
    hasSpectrumData: false
  };
}
