import type { User } from "firebase/auth";
import type {
  AppUser,
  AuthProviderId,
  DiscoveredPlace,
  EventCategory,
  EventExperienceRating,
  EventHistorySearchResult,
  Locale,
  Place,
  PlaceCategory,
  SensoryRating
} from "@accessibilitat/shared";

export type CreatePlaceInput = {
  name: string;
  category: string;
  city: string;
  addressOrArea: string;
  description?: string;
  latitude: number;
  longitude: number;
};

export type SearchNearbyPlacesInput = {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  maxResultCount?: number;
  locale: Locale;
  includedTypes?: string[];
};

export type SearchEventHistoryInput = {
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  maxResultCount?: number;
  city?: string;
  locale: Locale;
};

export type CreateEventSeriesInput = {
  title: string;
  category: EventCategory;
  city: string;
  description?: string;
};

export type CreateEventEditionInput = {
  eventSeriesId: string;
  title: string;
  year: number;
  startsAt: string;
  endsAt: string;
};

export type CreateEventZoneInput = {
  eventSeriesId: string;
  eventEditionId: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  radiusMeters?: number;
};

export type SubmitEventExperienceInput = {
  experienceId: string;
  eventSeriesId: string;
  eventEditionId: string;
  eventZoneId: string;
  observedAt: string;
  ratings: EventExperienceRating;
  description: string;
  photoPath: string;
};

export type ResolvePlaceForContributionInput = {
  googlePlaceId: string;
  locale: Locale;
  name: string;
  category: PlaceCategory;
  city: string;
  addressOrArea: string;
  latitude: number;
  longitude: number;
  contributorPosition: {
    latitude: number;
    longitude: number;
    accuracyMeters?: number;
  };
  description?: string;
};

export type SubmitReviewInput = {
  placeId: string;
  ratings: SensoryRating;
  comment?: string;
  childProfileId?: string;
};

export type SubmitCommentInput = {
  targetType: "place" | "review";
  targetId: string;
  placeId?: string;
  body: string;
};

export type CreateReportInput = {
  targetType: "place" | "review" | "comment" | "image" | "professional" | "organization";
  targetId: string;
  reason: string;
};

export type CreateChildProfileInput = {
  alias: string;
  ageRange?: "0-5" | "6-9" | "10-13" | "14-17";
  sensoryPreferences?: Record<string, "low" | "medium" | "high">;
};

export type CompleteUserOnboardingInput = {
  publicName: string;
  displayName?: string;
  email?: string;
  city?: string;
  locale: Locale;
  authProviders: AuthProviderId[];
};

export type ProfessionalVerificationInput = {
  professionalName: string;
  licenseNumber: string;
  professionalCollege: string;
  specialty: string;
  photoPath?: string;
  evidencePath?: string;
  note?: string;
};

export type OrganizationVerificationInput = {
  name: string;
  description: string;
  city: string;
  website?: string;
  registryNumber?: string;
  logoPath?: string;
  evidencePath?: string;
  note?: string;
};

export type CallableResponse<T> = Promise<{ data: T }>;

export interface AccessibilitatApi {
  listActivePlaces(): Promise<Place[]>;
  searchNearbyPlaces(input: SearchNearbyPlacesInput): CallableResponse<{ places: DiscoveredPlace[] } | DiscoveredPlace[]>;
  searchEventHistory(input: SearchEventHistoryInput): CallableResponse<EventHistorySearchResult>;
  createPlace(input: CreatePlaceInput): CallableResponse<{ placeId: string; status: "pending" }>;
  createEventSeries(input: CreateEventSeriesInput): CallableResponse<{ eventSeriesId: string; status: "pending" | "active" }>;
  createEventEdition(input: CreateEventEditionInput): CallableResponse<{ eventEditionId: string; status: "pending" | "active" }>;
  createEventZone(input: CreateEventZoneInput): CallableResponse<{ eventZoneId: string; status: "pending" | "active" }>;
  submitEventExperience(input: SubmitEventExperienceInput): CallableResponse<{ eventExperienceId: string; status: "pending" }>;
  resolvePlaceForContribution(
    input: ResolvePlaceForContributionInput
  ): CallableResponse<{ placeId: string; status: "pending" | "active" | "hidden" | "deleted" | "rejected" | "suspended" }>;
  submitReview(input: SubmitReviewInput): CallableResponse<{ reviewId: string; status: "pending" }>;
  submitComment(input: SubmitCommentInput): CallableResponse<{ commentId: string; status: "pending" }>;
  createReport(input: CreateReportInput): CallableResponse<{ reportId: string; status: "open" }>;
  createChildProfile(input: CreateChildProfileInput): CallableResponse<{ childProfileId: string }>;
  completeUserOnboarding(input: CompleteUserOnboardingInput): CallableResponse<{ uid: string; status: "active"; roles: string[] }>;
  requestProfessionalVerification(
    input: ProfessionalVerificationInput
  ): CallableResponse<{ profileId: string; verificationRequestId: string; status: "pending_verification" }>;
  requestOrganizationVerification(
    input: OrganizationVerificationInput
  ): CallableResponse<{ profileId: string; verificationRequestId: string; status: "pending_verification" }>;
  readCurrentAppUser(): Promise<AppUser | null>;
  subscribeToAuthState(callback: (user: User | null) => void): () => void;
  registerWithEmailPassword(input: {
    email: string;
    password: string;
    publicName: string;
    city?: string;
    locale: Locale;
  }): Promise<User>;
  loginWithEmailPassword(input: { email: string; password: string; locale: Locale }): Promise<User>;
  requestPasswordReset(input: { email: string; locale: Locale }): Promise<void>;
  loginWithGoogle(locale: Locale): Promise<User>;
  loginWithApple(locale: Locale): Promise<User>;
  logout(): Promise<void>;
  uploadPlaceImage(
    placeId: string,
    file: File,
    altText?: Record<string, string>
  ): CallableResponse<{ imageId: string; status: "pending" }>;
  uploadEventExperiencePhoto(experienceId: string, file: File): Promise<string>;
  readStorageDownloadUrl(path: string): Promise<string>;
}
