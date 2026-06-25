import type {
  Locale,
  ModerationStatus,
  Place,
  Review,
  SensoryCriterion,
  SensoryRating,
  UserRole,
  VerificationRequestType,
  VerificationStatus
} from "@accessibilitat/shared";
import type { PlaceReviewStats } from "../domain/review-stats.js";
import type { TimestampValue } from "./clock.js";

export type UserDocument = Record<string, unknown>;

export type VerificationProfileDocument = {
  ownerUid?: unknown;
};

export type PlaceImageDocument = {
  authorUid?: unknown;
  status?: unknown;
  rejectionReason?: unknown;
};

export type VerificationDocument = {
  verificationStatus?: unknown;
};

export interface SpectrumRepository {
  getUser(uid: string): Promise<UserDocument | undefined>;
  saveUser(uid: string, data: Record<string, unknown>): Promise<void>;
  getChildProfileTutorUid(childProfileId: string): Promise<string | undefined>;
  createPlace(data: Record<string, unknown>): Promise<string>;
  listActivePlacesForDiscovery(limit: number): Promise<Place[]>;
  getPlaceByGooglePlaceId(googlePlaceId: string): Promise<Place | undefined>;
  createGoogleLinkedPlace(input: {
    googlePlaceId: string;
    data: Record<string, unknown>;
  }): Promise<string>;
  createReview(data: Record<string, unknown>): Promise<string>;
  createComment(data: Record<string, unknown>): Promise<string>;
  createPlaceImage(data: Record<string, unknown>): Promise<string>;
  createReport(data: Record<string, unknown>): Promise<string>;
  createChildProfileAndUpdateUser(input: {
    uid: string;
    profile: Record<string, unknown>;
    user: Record<string, unknown>;
  }): Promise<string>;
  createVerificationRequest(input: {
    profileCollection: "professionalProfiles" | "organizationProfiles";
    profile: Record<string, unknown>;
    verification: Record<string, unknown>;
  }): Promise<{ profileId: string; verificationRequestId: string }>;
  moderateContent(input: {
    collectionId: string;
    targetId: string;
    update: Record<string, unknown>;
    adminAction: Record<string, unknown>;
  }): Promise<void>;
  getVerificationProfile(
    profileType: VerificationRequestType,
    profileId: string
  ): Promise<VerificationProfileDocument | undefined>;
  setVerificationStatusAndUserRole(input: {
    profileType: VerificationRequestType;
    profileId: string;
    ownerUid: string;
    status: VerificationStatus;
    profileUpdate: Record<string, unknown>;
    user: Record<string, unknown>;
    adminAction: Record<string, unknown>;
  }): Promise<void>;
  saveUserAccess(input: {
    uid: string;
    user: Record<string, unknown>;
    adminAction: Record<string, unknown>;
  }): Promise<void>;
  listActiveReviewsForPlace(placeId: string): Promise<Review[]>;
  updatePlaceReviewStats(placeId: string, stats: PlaceReviewStats, updatedAt: TimestampValue): Promise<void>;
  createUserNotification(uid: string, data: Record<string, unknown>): Promise<void>;
  addAdminAction(data: Record<string, unknown>): Promise<void>;
}

export type CreatePlaceCommand = {
  uid: string;
  name: string;
  category: string;
  city: string;
  addressOrArea: string;
  description: string;
  latitude: number;
  longitude: number;
  now: TimestampValue;
};

export type SubmitReviewCommand = {
  uid: string;
  placeId: string;
  childProfileId?: string;
  ratings: SensoryRating;
  comment: string;
  now: TimestampValue;
};

export type UserOnboardingCommand = {
  uid: string;
  publicName: string;
  displayName: string;
  email?: string;
  city?: string;
  authProviders: string[];
  roles: UserRole[];
  locale: Locale;
  now: TimestampValue;
  existing?: UserDocument;
};

export type AccessClaims = {
  admin: boolean;
  moderator: boolean;
};

export type ModerationClaims = {
  superAdmin?: boolean;
  admin?: boolean;
  moderator?: boolean;
};

export type StorageOwnerPathInput = {
  uid: string;
  path?: string;
  prefix: string;
};

export type ModerationUpdate = {
  status: ModerationStatus;
  reason?: string;
};
