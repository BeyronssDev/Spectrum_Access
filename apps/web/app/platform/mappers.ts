import type { Place as FirebasePlace, SensoryRating } from "@accessibilitat/shared";
import type { Place, SensoryKey } from "./types";

function criterionAtMost(place: FirebasePlace, criterion: keyof SensoryRating, maximum: number) {
  const score = place.criterionAverages?.[criterion];
  return typeof score === "number" && score > 0 && score <= maximum;
}
function criterionAtLeast(place: FirebasePlace, criterion: keyof SensoryRating, minimum: number) {
  const score = place.criterionAverages?.[criterion];
  return typeof score === "number" && score >= minimum;
}

function filterIdsForPlace(place: FirebasePlace) {
  if (place.ratingCount <= 0 || !place.criterionAverages) {
    return [];
  }

  const ids: number[] = [];
  if (criterionAtMost(place, "noise", 3)) {
    ids.push(0);
  }
  if (criterionAtMost(place, "lighting", 3)) {
    ids.push(1);
  }
  if (criterionAtMost(place, "crowd", 3)) {
    ids.push(2);
  }
  if (criterionAtLeast(place, "exitEase", 4)) {
    ids.push(3);
  }

  return ids;
}

export function toUiPlace(place: FirebasePlace): Place {
  return {
    id: place.id,
    name: place.name,
    area: place.addressOrArea || place.category,
    city: place.city,
    category: place.category,
    score: place.averageScore || 0,
    distance: "Live",
    quietDb: place.ratingCount > 0 ? `${place.ratingCount} reviews` : "New",
    description: place.description,
    criterionAverages: place.criterionAverages,
    position: {
      lat: place.position.latitude,
      lng: place.position.longitude
    },
    filterIds: filterIdsForPlace(place)
  };
}

export function toSensoryRating(ratings: Record<SensoryKey, number>): SensoryRating {
  const noise = Math.round(ratings.noise);
  const density = Math.round(ratings.density);
  const light = Math.round(ratings.light);
  const wait = Math.round(ratings.wait);
  const generalRecommendation = Math.round((noise + density + light + wait) / 4);

  return {
    noise,
    crowd: density,
    lighting: light,
    temperature: 3,
    waitingTime: wait,
    staffTreatment: 3,
    quietSpace: Math.max(1, Math.min(5, 6 - noise)),
    exitEase: 3,
    perceivedSafety: 3,
    generalRecommendation
  };
}
