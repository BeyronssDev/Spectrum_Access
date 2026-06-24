import type { User } from "firebase/auth";
import type { AppUser, AuthProviderId, Locale, Place, SensoryRating } from "@accessibilitat/shared";

export type CreatePlaceInput = {
  name: string;
  category: string;
  city: string;
  addressOrArea: string;
  description?: string;
  latitude: number;
  longitude: number;
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

export type CallableResponse<T> = Promise<{ data: T }>;

export interface AccessibilitatApi {
  listActivePlaces(): Promise<Place[]>;
  createPlace(input: CreatePlaceInput): CallableResponse<{ placeId: string; status: "pending" }>;
  submitReview(input: SubmitReviewInput): CallableResponse<{ reviewId: string; status: "pending" }>;
  submitComment(input: SubmitCommentInput): CallableResponse<{ commentId: string; status: "pending" }>;
  createReport(input: CreateReportInput): CallableResponse<{ reportId: string; status: "open" }>;
  createChildProfile(input: CreateChildProfileInput): CallableResponse<{ childProfileId: string }>;
  completeUserOnboarding(input: CompleteUserOnboardingInput): CallableResponse<{ uid: string; status: "active"; roles: string[] }>;
  requestProfessionalVerification(
    input: ProfessionalVerificationInput
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
  loginWithGoogle(locale: Locale): Promise<User>;
  loginWithApple(locale: Locale): Promise<User>;
  logout(): Promise<void>;
  uploadPlaceImage(
    placeId: string,
    file: File,
    altText?: Record<string, string>
  ): CallableResponse<{ imageId: string; status: "pending" }>;
}
