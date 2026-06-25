import type { Place as FirebasePlace } from "@accessibilitat/shared";

export type Locale = "ca" | "es" | "en";
export type ViewId = "home" | "consult" | "contribute" | "support" | "profiles" | "verified";
export type SensoryKey = "noise" | "density" | "light" | "wait";
export type MapLayerId = "roadmap" | "satellite" | "terrain";
export type LocationState = "idle" | "locating" | "located" | "denied" | "unsupported" | "error";
export type AuthMode = "login" | "register";
export type RegisterAccountType = "user" | "professional";
export type UserLocation = { lat: number; lng: number; accuracy?: number };

export type ContributionDraft = {
  createNewPlace: boolean;
  placeName: string;
  city: string;
  addressOrArea: string;
  description: string;
};

export type Place = {
  id: string;
  source: "spectrum" | "google_places";
  spectrumPlaceId?: string;
  googlePlaceId?: string;
  name: string;
  area: string;
  city: string;
  category: FirebasePlace["category"];
  score: number;
  distance: string;
  description: string;
  quietDb: string;
  criterionAverages?: FirebasePlace["criterionAverages"];
  hasSpectrumData: boolean;
  position: {
    lat: number;
    lng: number;
  };
  filterIds: number[];
};

export type Professional = {
  id: string;
  name: string;
  role: string;
  license: string;
  college: string;
  specialty: string;
  city: string;
  distance: string;
  position: {
    lat: number;
    lng: number;
  };
  initials: string;
};

export type Organization = {
  id: string;
  name: string;
  city: string;
  registry: string;
  description: string;
  distance: string;
  position: {
    lat: number;
    lng: number;
  };
  initials: string;
};
