import type { Place, UserLocation } from "./types";

function distanceBetweenKm(origin: UserLocation, destination: { lat: number; lng: number }) {
  const earthRadiusKm = 6371;
  const latDelta = toRadians(destination.lat - origin.lat);
  const lngDelta = toRadians(destination.lng - origin.lng);
  const originLat = toRadians(origin.lat);
  const destinationLat = toRadians(destination.lat);
  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(originLat) * Math.cos(destinationLat) * Math.sin(lngDelta / 2) * Math.sin(lngDelta / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}
function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function formatDistance(distanceKm: number) {
  if (distanceKm < 1) {
    return `${Math.max(50, Math.round((distanceKm * 1000) / 50) * 50)} m`;
  }

  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km`;
  }

  return `${Math.round(distanceKm)} km`;
}

export function rankPlacesByDistance(source: Place[], userLocation: UserLocation | null) {
  if (!userLocation) {
    return source;
  }

  return source
    .map((place) => ({
      place,
      distanceKm: distanceBetweenKm(userLocation, place.position)
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .map(({ place, distanceKm }) => ({
      ...place,
      distance: formatDistance(distanceKm)
    }));
}

export function rankLocatedItemsByDistance<T extends { distance: string; position: { lat: number; lng: number } }>(
  source: T[],
  userLocation: UserLocation | null
) {
  if (!userLocation) {
    return source;
  }

  return source
    .map((item) => ({
      item,
      distanceKm: distanceBetweenKm(userLocation, item.position)
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .map(({ item, distanceKm }) => ({
      ...item,
      distance: formatDistance(distanceKm)
    }));
}
