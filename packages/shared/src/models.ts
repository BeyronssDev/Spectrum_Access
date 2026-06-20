export const locales = ["ca", "es", "en"] as const;
export type Locale = (typeof locales)[number];

export const userRoles = [
  "user",
  "trusted_user",
  "tutor",
  "professional",
  "organization",
  "moderator",
  "admin"
] as const;
export type UserRole = (typeof userRoles)[number];

export const moderationStatuses = [
  "pending",
  "active",
  "hidden",
  "deleted",
  "rejected",
  "suspended"
] as const;
export type ModerationStatus = (typeof moderationStatuses)[number];

export const verificationStatuses = [
  "unverified",
  "pending_verification",
  "verified",
  "rejected",
  "suspended"
] as const;
export type VerificationStatus = (typeof verificationStatuses)[number];

export const placeCategories = [
  "bar",
  "restaurant",
  "cafe",
  "shop",
  "medical_center",
  "public_administration",
  "education",
  "transport",
  "culture",
  "leisure",
  "other"
] as const;
export type PlaceCategory = (typeof placeCategories)[number];

export const sensoryCriteria = [
  "noise",
  "crowd",
  "lighting",
  "temperature",
  "waitingTime",
  "staffTreatment",
  "quietSpace",
  "exitEase",
  "perceivedSafety",
  "generalRecommendation"
] as const;
export type SensoryCriterion = (typeof sensoryCriteria)[number];

export const commentTargetTypes = ["place", "review"] as const;
export type CommentTargetType = (typeof commentTargetTypes)[number];

export const reportTargetTypes = [
  "place",
  "review",
  "comment",
  "image",
  "professional",
  "organization"
] as const;
export type ReportTargetType = (typeof reportTargetTypes)[number];

export const verificationRequestTypes = ["professional", "organization"] as const;
export type VerificationRequestType = (typeof verificationRequestTypes)[number];

export const authProviderIds = ["password", "google.com", "apple.com"] as const;
export type AuthProviderId = (typeof authProviderIds)[number];

export type SensoryRating = Record<SensoryCriterion, number>;

export interface AppUser {
  uid: string;
  email?: string;
  displayName: string;
  publicName: string;
  city?: string;
  authProviders: AuthProviderId[];
  roles: UserRole[];
  status: "active" | "disabled";
  locale: Locale;
  onboardingCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompleteUserOnboardingInput {
  publicName: string;
  displayName?: string;
  email?: string;
  city?: string;
  locale: Locale;
  authProviders: AuthProviderId[];
}

export interface ChildProfile {
  id: string;
  tutorUid: string;
  alias: string;
  ageRange?: "0-5" | "6-9" | "10-13" | "14-17";
  sensoryPreferences: Partial<Record<SensoryCriterion, "low" | "medium" | "high">>;
  createdAt: string;
  updatedAt: string;
}

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  city: string;
  addressOrArea: string;
  description: string;
  position: {
    latitude: number;
    longitude: number;
  };
  status: ModerationStatus;
  createdBy: string;
  ratingCount: number;
  imageCount: number;
  averageScore: number;
  updatedAt: string;
}

export interface Review {
  id: string;
  placeId: string;
  authorUid: string;
  childProfileId?: string;
  tutorApproved: boolean;
  ratings: SensoryRating;
  comment?: string;
  status: ModerationStatus;
  createdAt: string;
}

export interface Comment {
  id: string;
  targetType: CommentTargetType;
  targetId: string;
  placeId?: string;
  authorUid: string;
  body: string;
  status: ModerationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceImage {
  id: string;
  placeId: string;
  authorUid: string;
  storagePath: string;
  thumbnailPath?: string;
  altText: Record<Locale, string>;
  status: ModerationStatus;
  scanStatus: "not_configured" | "queued" | "passed" | "flagged";
  rejectionReason?: string;
  createdAt: string;
}

export interface ProfessionalProfile {
  id: string;
  ownerUid: string;
  professionalName: string;
  licenseNumber: string;
  professionalCollege: string;
  specialty: string;
  photoPath?: string;
  verificationStatus: VerificationStatus;
}

export interface OrganizationProfile {
  id: string;
  ownerUid: string;
  name: string;
  description: string;
  city: string;
  website?: string;
  registryNumber?: string;
  logoPath?: string;
  verificationStatus: VerificationStatus;
}

export interface Report {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reporterUid: string;
  reason: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  createdAt: string;
}

export interface VerificationRequest {
  id: string;
  ownerUid: string;
  profileType: VerificationRequestType;
  profileId: string;
  evidencePath?: string;
  note?: string;
  status: "open" | "reviewing" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}
