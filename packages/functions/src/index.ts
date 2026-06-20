import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { onDocumentUpdated, onDocumentWritten } from "firebase-functions/v2/firestore";
import { HttpsError, onCall, type CallableRequest } from "firebase-functions/v2/https";
import {
  commentTargetTypeSet,
  authProviderIdSet,
  isAuthProviderId,
  isLocale,
  isRecord,
  isSensoryRating,
  isValidCoordinate,
  locales,
  normalizeText,
  placeCategorySet,
  reportTargetTypeSet,
  sensoryCriterionSet,
  verificationRequestTypeSet,
  verificationStatusSet,
  type Locale,
  type Review,
  type SensoryCriterion,
  type UserRole
} from "@accessibilitat/shared";

initializeApp();

const db = getFirestore();
const functionRegion = process.env.FUNCTIONS_REGION ?? "europe-west1";
const callableOptions = { region: functionRegion };

const aggregateCriteria: SensoryCriterion[] = [
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
];

const moderationTargets = new Set(["places", "reviews", "comments", "placeImages"]);
const moderationTargetStatuses = new Set(["active", "hidden", "deleted", "rejected", "suspended"]);
const childAgeRanges = new Set(["0-5", "6-9", "10-13", "14-17"]);
const sensoryPreferenceLevels = new Set(["low", "medium", "high"]);
const derivedVerificationRoles: Record<string, UserRole> = {
  professional: "professional",
  organization: "organization"
};

type AuthedRequest = CallableRequest<unknown> & {
  auth: NonNullable<CallableRequest<unknown>["auth"]>;
};

function requireAuth(request: CallableRequest<unknown>): AuthedRequest {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication is required.");
  }

  return request as AuthedRequest;
}

function isModeratorRequest(request: AuthedRequest): boolean {
  return request.auth.token.admin === true || request.auth.token.moderator === true;
}

function requireModerator(request: CallableRequest<unknown>): AuthedRequest {
  const authedRequest = requireAuth(request);
  if (!isModeratorRequest(authedRequest)) {
    throw new HttpsError("permission-denied", "Moderator privileges are required.");
  }

  return authedRequest;
}

function requirePayload(request: CallableRequest<unknown>): Record<string, unknown> {
  if (!isRecord(request.data)) {
    throw new HttpsError("invalid-argument", "Expected an object payload.");
  }

  return request.data;
}

function requireText(data: Record<string, unknown>, key: string, maxLength = 240): string {
  const text = normalizeText(data[key], maxLength);
  if (!text) {
    throw new HttpsError("invalid-argument", `Invalid ${key}.`);
  }

  return text;
}

function optionalText(data: Record<string, unknown>, key: string, maxLength = 240): string | undefined {
  if (data[key] === undefined || data[key] === null || data[key] === "") {
    return undefined;
  }

  const text = normalizeText(data[key], maxLength);
  if (!text) {
    throw new HttpsError("invalid-argument", `Invalid ${key}.`);
  }

  return text;
}

function requireNumber(data: Record<string, unknown>, key: string): number {
  const value = data[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new HttpsError("invalid-argument", `Invalid ${key}.`);
  }

  return value;
}

function optionalOwnerPath(data: Record<string, unknown>, key: string, uid: string, prefix: string): string | undefined {
  const value = optionalText(data, key, 1024);
  if (!value) {
    return undefined;
  }

  if (!value.startsWith(`${prefix}/${uid}/`)) {
    throw new HttpsError("permission-denied", `${key} must belong to the authenticated user.`);
  }

  return value;
}

function requireSetValue(data: Record<string, unknown>, key: string, allowed: Set<string>): string {
  const value = requireText(data, key, 120);
  if (!allowed.has(value)) {
    throw new HttpsError("invalid-argument", `Invalid ${key}.`);
  }

  return value;
}

function optionalEmail(data: Record<string, unknown>, key: string): string | undefined {
  const value = optionalText(data, key, 254);
  if (!value) {
    return undefined;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new HttpsError("invalid-argument", `Invalid ${key}.`);
  }

  return value.toLowerCase();
}

function readAuthProviders(value: unknown): string[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > authProviderIdSet.size) {
    throw new HttpsError("invalid-argument", "Invalid authProviders.");
  }

  const providers = new Set<string>();
  for (const provider of value) {
    if (!isAuthProviderId(provider)) {
      throw new HttpsError("invalid-argument", "Invalid authProviders.");
    }
    providers.add(provider);
  }

  return [...providers];
}

function ensureUserRoles(currentRoles: unknown, role: UserRole, enabled: boolean): UserRole[] {
  const roles = Array.isArray(currentRoles) ? currentRoles.filter((value): value is UserRole => typeof value === "string") : [];
  const next = new Set<UserRole>(roles.includes("user") ? roles : ["user", ...roles]);

  if (enabled) {
    next.add(role);
  } else {
    next.delete(role);
  }

  return [...next];
}

function readSensoryPreferences(value: unknown): Partial<Record<SensoryCriterion, "low" | "medium" | "high">> {
  if (value === undefined || value === null) {
    return {};
  }

  if (!isRecord(value)) {
    throw new HttpsError("invalid-argument", "Invalid sensoryPreferences.");
  }

  const preferences: Partial<Record<SensoryCriterion, "low" | "medium" | "high">> = {};
  for (const [criterion, level] of Object.entries(value)) {
    if (!sensoryCriterionSet.has(criterion) || typeof level !== "string" || !sensoryPreferenceLevels.has(level)) {
      throw new HttpsError("invalid-argument", "Invalid sensoryPreferences.");
    }

    preferences[criterion as SensoryCriterion] = level as "low" | "medium" | "high";
  }

  return preferences;
}

function readAltText(value: unknown): Record<Locale, string> {
  const altText = Object.fromEntries(locales.map((locale) => [locale, ""])) as Record<Locale, string>;
  if (value === undefined || value === null) {
    return altText;
  }

  if (!isRecord(value)) {
    throw new HttpsError("invalid-argument", "Invalid altText.");
  }

  for (const locale of locales) {
    if (value[locale] === undefined || value[locale] === null || value[locale] === "") {
      continue;
    }

    const text = normalizeText(value[locale], 160);
    if (!text) {
      throw new HttpsError("invalid-argument", "Invalid altText.");
    }

    altText[locale] = text;
  }

  return altText;
}

async function assertChildProfileBelongsToTutor(childProfileId: string, uid: string): Promise<void> {
  const childProfile = await db.collection("childProfiles").doc(childProfileId).get();
  if (!childProfile.exists || childProfile.data()?.tutorUid !== uid) {
    throw new HttpsError("permission-denied", "The child profile does not belong to this tutor.");
  }
}

export const completeUserOnboarding = onCall(callableOptions, async (request) => {
  const authedRequest = requireAuth(request);
  const data = requirePayload(request);
  const uid = authedRequest.auth.uid;
  const now = FieldValue.serverTimestamp();
  const locale = data.locale;

  if (!isLocale(locale)) {
    throw new HttpsError("invalid-argument", "Invalid locale.");
  }

  const publicName = requireText(data, "publicName", 80);
  const displayName = optionalText(data, "displayName", 120) ?? publicName;
  const authProviders = readAuthProviders(data.authProviders);
  const email = optionalEmail(data, "email") ?? authedRequest.auth.token.email;
  const city = optionalText(data, "city", 120);
  const userRef = db.collection("users").doc(uid);
  const userSnapshot = await userRef.get();
  const existingRoles = userSnapshot.data()?.roles;
  const roles = ensureUserRoles(existingRoles, "user", true);

  await userRef.set(
    {
      uid,
      ...(email ? { email } : {}),
      displayName,
      publicName,
      ...(city ? { city } : {}),
      authProviders,
      roles,
      status: "active",
      locale,
      onboardingCompletedAt: userSnapshot.exists ? userSnapshot.data()?.onboardingCompletedAt ?? now : now,
      createdAt: userSnapshot.exists ? userSnapshot.data()?.createdAt ?? now : now,
      updatedAt: now
    },
    { merge: true }
  );

  return {
    uid,
    publicName,
    roles,
    status: "active"
  };
});

export const createPlace = onCall(callableOptions, async (request) => {
  const authedRequest = requireAuth(request);
  const data = requirePayload(request);
  const latitude = requireNumber(data, "latitude");
  const longitude = requireNumber(data, "longitude");

  if (!isValidCoordinate(latitude, longitude)) {
    throw new HttpsError("invalid-argument", "Invalid position.");
  }

  const category = requireSetValue(data, "category", placeCategorySet);
  const placeRef = db.collection("places").doc();
  const now = FieldValue.serverTimestamp();

  await placeRef.set({
    id: placeRef.id,
    name: requireText(data, "name", 120),
    category,
    city: requireText(data, "city", 120),
    addressOrArea: requireText(data, "addressOrArea", 180),
    description: optionalText(data, "description", 1200) ?? "",
    position: { latitude, longitude },
    status: "pending",
    createdBy: authedRequest.auth.uid,
    ratingCount: 0,
    imageCount: 0,
    averageScore: 0,
    createdAt: now,
    updatedAt: now
  });

  return { placeId: placeRef.id, status: "pending" };
});

export const submitReview = onCall(callableOptions, async (request) => {
  const authedRequest = requireAuth(request);
  const data = requirePayload(request);
  const ratings = data.ratings;

  if (!isSensoryRating(ratings)) {
    throw new HttpsError("invalid-argument", "Invalid ratings.");
  }

  const childProfileId = optionalText(data, "childProfileId", 80);
  if (childProfileId) {
    await assertChildProfileBelongsToTutor(childProfileId, authedRequest.auth.uid);
  }

  const reviewRef = db.collection("reviews").doc();
  await reviewRef.set({
    id: reviewRef.id,
    placeId: requireText(data, "placeId", 120),
    authorUid: authedRequest.auth.uid,
    ...(childProfileId ? { childProfileId } : {}),
    tutorApproved: true,
    ratings,
    comment: optionalText(data, "comment", 1200) ?? "",
    status: "pending",
    createdAt: FieldValue.serverTimestamp()
  });

  return { reviewId: reviewRef.id, status: "pending" };
});

export const submitComment = onCall(callableOptions, async (request) => {
  const authedRequest = requireAuth(request);
  const data = requirePayload(request);
  const commentRef = db.collection("comments").doc();
  const now = FieldValue.serverTimestamp();

  await commentRef.set({
    id: commentRef.id,
    targetType: requireSetValue(data, "targetType", commentTargetTypeSet),
    targetId: requireText(data, "targetId", 120),
    placeId: optionalText(data, "placeId", 120),
    authorUid: authedRequest.auth.uid,
    body: requireText(data, "body", 1200),
    status: "pending",
    createdAt: now,
    updatedAt: now
  });

  return { commentId: commentRef.id, status: "pending" };
});

export const createPlaceImageRecord = onCall(callableOptions, async (request) => {
  const authedRequest = requireAuth(request);
  const data = requirePayload(request);
  const uid = authedRequest.auth.uid;
  const storagePath = requireText(data, "storagePath", 1024);

  if (!storagePath.startsWith(`place-images/${uid}/`)) {
    throw new HttpsError("permission-denied", "storagePath must belong to the authenticated user.");
  }

  const imageRef = db.collection("placeImages").doc();
  await imageRef.set({
    id: imageRef.id,
    placeId: requireText(data, "placeId", 120),
    authorUid: uid,
    storagePath,
    thumbnailPath: optionalText(data, "thumbnailPath", 1024),
    altText: readAltText(data.altText),
    status: "pending",
    scanStatus: "not_configured",
    createdAt: FieldValue.serverTimestamp()
  });

  return { imageId: imageRef.id, status: "pending" };
});

export const createReport = onCall(callableOptions, async (request) => {
  const authedRequest = requireAuth(request);
  const data = requirePayload(request);
  const reportRef = db.collection("reports").doc();

  await reportRef.set({
    id: reportRef.id,
    targetType: requireSetValue(data, "targetType", reportTargetTypeSet),
    targetId: requireText(data, "targetId", 120),
    reporterUid: authedRequest.auth.uid,
    reason: requireText(data, "reason", 1200),
    status: "open",
    createdAt: FieldValue.serverTimestamp()
  });

  return { reportId: reportRef.id, status: "open" };
});

export const createChildProfile = onCall(callableOptions, async (request) => {
  const authedRequest = requireAuth(request);
  const data = requirePayload(request);
  const ageRange = optionalText(data, "ageRange", 20);

  if (ageRange && !childAgeRanges.has(ageRange)) {
    throw new HttpsError("invalid-argument", "Invalid ageRange.");
  }

  const profileRef = db.collection("childProfiles").doc();
  const userRef = db.collection("users").doc(authedRequest.auth.uid);
  const now = FieldValue.serverTimestamp();
  const userSnapshot = await userRef.get();
  const roles = ensureUserRoles(userSnapshot.data()?.roles, "tutor", true);
  const batch = db.batch();

  batch.set(profileRef, {
    id: profileRef.id,
    tutorUid: authedRequest.auth.uid,
    alias: requireText(data, "alias", 80),
    ...(ageRange ? { ageRange } : {}),
    sensoryPreferences: readSensoryPreferences(data.sensoryPreferences),
    createdAt: now,
    updatedAt: now
  });
  batch.set(
    userRef,
    {
      uid: authedRequest.auth.uid,
      roles,
      status: "active",
      updatedAt: now,
      ...(userSnapshot.exists ? {} : { createdAt: now })
    },
    { merge: true }
  );
  await batch.commit();

  return { childProfileId: profileRef.id };
});

export const requestProfessionalVerification = onCall(callableOptions, async (request) => {
  const authedRequest = requireAuth(request);
  const data = requirePayload(request);
  const uid = authedRequest.auth.uid;
  const profileRef = db.collection("professionalProfiles").doc();
  const verificationRef = db.collection("verificationRequests").doc();
  const now = FieldValue.serverTimestamp();

  const batch = db.batch();
  batch.set(profileRef, {
    id: profileRef.id,
    ownerUid: uid,
    professionalName: requireText(data, "professionalName", 120),
    licenseNumber: requireText(data, "licenseNumber", 80),
    professionalCollege: requireText(data, "professionalCollege", 160),
    specialty: requireText(data, "specialty", 160),
    photoPath: optionalOwnerPath(data, "photoPath", uid, "professional-photos"),
    verificationStatus: "pending_verification",
    createdAt: now,
    updatedAt: now
  });
  batch.set(verificationRef, {
    id: verificationRef.id,
    ownerUid: uid,
    profileType: "professional",
    profileId: profileRef.id,
    evidencePath: optionalOwnerPath(data, "evidencePath", uid, "verification-evidence"),
    note: optionalText(data, "note", 1200),
    status: "open",
    createdAt: now,
    updatedAt: now
  });
  await batch.commit();

  return { profileId: profileRef.id, verificationRequestId: verificationRef.id, status: "pending_verification" };
});

export const requestOrganizationVerification = onCall(callableOptions, async (request) => {
  const authedRequest = requireAuth(request);
  const data = requirePayload(request);
  const uid = authedRequest.auth.uid;
  const profileRef = db.collection("organizationProfiles").doc();
  const verificationRef = db.collection("verificationRequests").doc();
  const now = FieldValue.serverTimestamp();

  const batch = db.batch();
  batch.set(profileRef, {
    id: profileRef.id,
    ownerUid: uid,
    name: requireText(data, "name", 140),
    description: requireText(data, "description", 1200),
    city: requireText(data, "city", 120),
    website: optionalText(data, "website", 240),
    registryNumber: optionalText(data, "registryNumber", 120),
    logoPath: optionalOwnerPath(data, "logoPath", uid, "organization-logos"),
    verificationStatus: "pending_verification",
    createdAt: now,
    updatedAt: now
  });
  batch.set(verificationRef, {
    id: verificationRef.id,
    ownerUid: uid,
    profileType: "organization",
    profileId: profileRef.id,
    evidencePath: optionalOwnerPath(data, "evidencePath", uid, "verification-evidence"),
    note: optionalText(data, "note", 1200),
    status: "open",
    createdAt: now,
    updatedAt: now
  });
  await batch.commit();

  return { profileId: profileRef.id, verificationRequestId: verificationRef.id, status: "pending_verification" };
});

export const moderateContent = onCall(callableOptions, async (request) => {
  const moderatorRequest = requireModerator(request);
  const data = requirePayload(request);
  const collectionId = requireSetValue(data, "collectionId", moderationTargets);
  const status = requireSetValue(data, "status", moderationTargetStatuses);
  const targetId = requireText(data, "targetId", 120);
  const reason = optionalText(data, "reason", 1200);
  const now = FieldValue.serverTimestamp();

  const update: Record<string, unknown> = {
    status,
    updatedAt: now,
    moderatedAt: now,
    moderatedBy: moderatorRequest.auth.uid
  };

  if (reason && collectionId === "placeImages") {
    update.rejectionReason = reason;
  }

  const batch = db.batch();
  batch.update(db.collection(collectionId).doc(targetId), update);
  batch.set(db.collection("adminActions").doc(), {
    action: "content_moderated",
    collectionId,
    targetId,
    status,
    reason: reason ?? null,
    actorUid: moderatorRequest.auth.uid,
    createdAt: now
  });
  await batch.commit();

  return { targetId, status };
});

export const setVerificationStatus = onCall(callableOptions, async (request) => {
  const moderatorRequest = requireModerator(request);
  const data = requirePayload(request);
  const profileType = requireSetValue(data, "profileType", verificationRequestTypeSet);
  const status = requireSetValue(data, "status", verificationStatusSet);
  const profileId = requireText(data, "profileId", 120);
  const collectionId = profileType === "professional" ? "professionalProfiles" : "organizationProfiles";
  const now = FieldValue.serverTimestamp();
  const profileRef = db.collection(collectionId).doc(profileId);
  const profileSnapshot = await profileRef.get();

  if (!profileSnapshot.exists) {
    throw new HttpsError("not-found", "Verification profile not found.");
  }

  const ownerUid = profileSnapshot.data()?.ownerUid;
  if (typeof ownerUid !== "string" || ownerUid.length === 0) {
    throw new HttpsError("failed-precondition", "Verification profile is missing ownerUid.");
  }

  const derivedRole = derivedVerificationRoles[profileType];
  const userRef = db.collection("users").doc(ownerUid);
  const userSnapshot = await userRef.get();
  const roles = ensureUserRoles(userSnapshot.data()?.roles, derivedRole, status === "verified");

  const batch = db.batch();
  batch.update(profileRef, {
    verificationStatus: status,
    verificationReviewedAt: now,
    verificationReviewedBy: moderatorRequest.auth.uid,
    updatedAt: now
  });
  batch.set(
    userRef,
    {
      uid: ownerUid,
      roles,
      status: "active",
      updatedAt: now,
      ...(userSnapshot.exists ? {} : { createdAt: now })
    },
    { merge: true }
  );
  batch.set(db.collection("adminActions").doc(), {
    action: "verification_status_set",
    collectionId,
    targetId: profileId,
    to: status,
    actorUid: moderatorRequest.auth.uid,
    note: optionalText(data, "note", 1200) ?? null,
    createdAt: now
  });
  await batch.commit();

  return { profileId, status };
});

export const recalculatePlaceReviewStats = onDocumentWritten(
  { document: "reviews/{reviewId}", region: functionRegion },
  async (event) => {
    const before = event.data?.before.data() as Review | undefined;
    const after = event.data?.after.data() as Review | undefined;
    const placeId = after?.placeId ?? before?.placeId;

    if (!placeId) {
      return;
    }

    const snapshot = await db
      .collection("reviews")
      .where("placeId", "==", placeId)
      .where("status", "==", "active")
      .get();

    let ratingCount = 0;
    let scoreTotal = 0;
    const criterionTotals = Object.fromEntries(
      aggregateCriteria.map((criterion) => [criterion, 0])
    ) as Record<SensoryCriterion, number>;

    snapshot.forEach((doc) => {
      const review = doc.data() as Review;
      ratingCount += 1;
      for (const criterion of aggregateCriteria) {
        criterionTotals[criterion] += review.ratings[criterion] ?? 0;
      }
      scoreTotal += review.ratings.generalRecommendation ?? 0;
    });

    const averages = Object.fromEntries(
      aggregateCriteria.map((criterion) => [
        criterion,
        ratingCount > 0 ? Number((criterionTotals[criterion] / ratingCount).toFixed(2)) : 0
      ])
    );

    await db.collection("places").doc(placeId).set(
      {
        ratingCount,
        averageScore: ratingCount > 0 ? Number((scoreTotal / ratingCount).toFixed(2)) : 0,
        criterionAverages: averages,
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );
  }
);

export const notifyRejectedImage = onDocumentUpdated(
  { document: "placeImages/{imageId}", region: functionRegion },
  async (event) => {
    if (!event.data) {
      return;
    }

    const before = event.data.before.data();
    const after = event.data.after.data();

    if (before.status === after.status || !["rejected", "deleted", "hidden"].includes(after.status)) {
      return;
    }

    const authorUid = after.authorUid as string | undefined;
    if (!authorUid) {
      logger.warn("Image moderation event without authorUid", { imageId: event.params.imageId });
      return;
    }

    await db.collection("userNotifications").doc(authorUid).collection("items").add({
      type: "image_moderation",
      imageId: event.params.imageId,
      status: after.status,
      reason: after.rejectionReason ?? "moderation_policy",
      read: false,
      createdAt: FieldValue.serverTimestamp()
    });
  }
);

export const auditVerificationStatusChange = onDocumentUpdated(
  { document: "{collectionId}/{profileId}", region: functionRegion },
  async (event) => {
    if (!event.data) {
      return;
    }

    const collectionId = event.params.collectionId;
    if (!["professionalProfiles", "organizationProfiles"].includes(collectionId)) {
      return;
    }

    const before = event.data.before.data();
    const after = event.data.after.data();
    if (before.verificationStatus === after.verificationStatus) {
      return;
    }

    await db.collection("adminActions").add({
      action: "verification_status_changed",
      collectionId,
      targetId: event.params.profileId,
      from: before.verificationStatus,
      to: after.verificationStatus,
      createdAt: FieldValue.serverTimestamp()
    });
  }
);
