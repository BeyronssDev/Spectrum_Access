import type { Locale } from "@accessibilitat/shared";
import type { GooglePlaceCandidate, NearbyPlacesSearch, PlacesGateway } from "../../ports/places.js";

type GooglePlaceResponse = {
  id?: unknown;
  displayName?: {
    text?: unknown;
  };
  formattedAddress?: unknown;
  location?: {
    latitude?: unknown;
    longitude?: unknown;
  };
  primaryType?: unknown;
  types?: unknown;
};

type NearbySearchResponse = {
  places?: GooglePlaceResponse[];
};

const nearbyFieldMask = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.primaryType",
  "places.types"
].join(",");

const detailsFieldMask = ["id", "displayName", "formattedAddress", "location", "primaryType", "types"].join(",");

export class GooglePlacesGateway implements PlacesGateway {
  constructor(private readonly apiKey: string | undefined) {}

  async searchNearby(input: NearbyPlacesSearch): Promise<GooglePlaceCandidate[]> {
    if (!this.apiKey) {
      return [];
    }

    const response = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": this.apiKey,
        "X-Goog-FieldMask": nearbyFieldMask
      },
      body: JSON.stringify({
        includedTypes: input.includedTypes,
        maxResultCount: input.maxResultCount,
        rankPreference: "DISTANCE",
        languageCode: input.locale,
        locationRestriction: {
          circle: {
            center: {
              latitude: input.latitude,
              longitude: input.longitude
            },
            radius: input.radiusMeters
          }
        }
      })
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as NearbySearchResponse;
    return (payload.places ?? []).map(toCandidate).filter((place): place is GooglePlaceCandidate => place !== undefined);
  }

  async getPlace(googlePlaceId: string, locale: Locale): Promise<GooglePlaceCandidate | undefined> {
    if (!this.apiKey) {
      return undefined;
    }

    const params = new URLSearchParams({
      fields: detailsFieldMask,
      key: this.apiKey,
      languageCode: locale
    });
    const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(googlePlaceId)}?${params.toString()}`);

    if (!response.ok) {
      return undefined;
    }

    return toCandidate((await response.json()) as GooglePlaceResponse);
  }
}

function toCandidate(place: GooglePlaceResponse): GooglePlaceCandidate | undefined {
  const googlePlaceId = typeof place.id === "string" ? place.id : undefined;
  const name = typeof place.displayName?.text === "string" ? place.displayName.text : undefined;
  const formattedAddress = typeof place.formattedAddress === "string" ? place.formattedAddress : undefined;
  const latitude = typeof place.location?.latitude === "number" ? place.location.latitude : undefined;
  const longitude = typeof place.location?.longitude === "number" ? place.location.longitude : undefined;

  if (!googlePlaceId || !name || !formattedAddress || latitude === undefined || longitude === undefined) {
    return undefined;
  }

  return {
    googlePlaceId,
    name,
    formattedAddress,
    latitude,
    longitude,
    primaryType: typeof place.primaryType === "string" ? place.primaryType : undefined,
    types: Array.isArray(place.types) ? place.types.filter((type): type is string => typeof type === "string") : []
  };
}
