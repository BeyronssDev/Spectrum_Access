import type { Locale } from "@accessibilitat/shared";

export type GooglePlaceCandidate = {
  googlePlaceId: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  primaryType?: string;
  types: string[];
};

export type NearbyPlacesSearch = {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  maxResultCount: number;
  locale: Locale;
  includedTypes: string[];
};

export interface PlacesGateway {
  searchNearby(input: NearbyPlacesSearch): Promise<GooglePlaceCandidate[]>;
  getPlace(googlePlaceId: string, locale: Locale): Promise<GooglePlaceCandidate | undefined>;
}
