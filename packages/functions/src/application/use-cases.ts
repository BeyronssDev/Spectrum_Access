import {
  isAuthProviderId,
  type UserRole,
  type VerificationRequestType
} from "@accessibilitat/shared";
import { fail } from "../domain/errors.js";
import { moderationTargets, moderationTargetStatuses } from "../domain/moderation.js";
import { ensureUserRoles } from "../domain/roles.js";
import type { AuthGateway, RequestContext } from "../ports/auth.js";
import type { Clock } from "../ports/clock.js";
import type { SpectrumRepository } from "../ports/repositories.js";
import {
  optionalBoolean,
  optionalChildAgeRange,
  optionalEmail,
  optionalOwnerPath,
  optionalText,
  readAltText,
  readAuthProviders,
  readSensoryPreferences,
  requireCommentTargetType,
  requireCoordinate,
  requireLocale,
  requirePayload,
  requirePlaceCategory,
  requireReportTargetType,
  requireSensoryRating,
  requireSetValue,
  requireText,
  requireVerificationRequestType,
  requireVerificationStatus
} from "./payload.js";

export type UseCaseDependencies = {
  auth: AuthGateway;
  clock: Clock;
  repository: SpectrumRepository;
};

const derivedVerificationRoles: Record<string, UserRole> = {
  professional: "professional",
  organization: "organization"
};

export function createUseCases({ auth, clock, repository }: UseCaseDependencies) {
  return {
    async completeUserOnboarding(context: RequestContext, rawData: unknown) {
      const data = requirePayload(rawData);
      const uid = context.uid;
      const now = clock.now();
      const locale = requireLocale(data);
      const publicName = requireText(data, "publicName", 80);
      const displayName = optionalText(data, "displayName", 120) ?? publicName;
      const authProviders = readAuthProviders(data.authProviders);
      const email = optionalEmail(data, "email") ?? (typeof context.token.email === "string" ? context.token.email : undefined);
      const city = optionalText(data, "city", 120);
      const existing = await repository.getUser(uid);
      const roles = ensureUserRoles(existing?.roles, "user", true);

      await repository.saveUser(uid, {
        uid,
        ...(email ? { email } : {}),
        displayName,
        publicName,
        ...(city ? { city } : {}),
        authProviders,
        roles,
        status: "active",
        locale,
        onboardingCompletedAt: existing?.onboardingCompletedAt ?? now,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now
      });

      return { uid, publicName, roles, status: "active" };
    },

    async createPlace(context: RequestContext, rawData: unknown) {
      const data = requirePayload(rawData);
      const { latitude, longitude } = requireCoordinate(data);
      const category = requirePlaceCategory(data);
      const now = clock.now();

      const placeId = await repository.createPlace({
        name: requireText(data, "name", 120),
        category,
        city: requireText(data, "city", 120),
        addressOrArea: requireText(data, "addressOrArea", 180),
        description: optionalText(data, "description", 1200) ?? "",
        position: { latitude, longitude },
        status: "pending",
        createdBy: context.uid,
        ratingCount: 0,
        imageCount: 0,
        averageScore: 0,
        createdAt: now,
        updatedAt: now
      });

      return { placeId, status: "pending" };
    },

    async submitReview(context: RequestContext, rawData: unknown) {
      const data = requirePayload(rawData);
      const ratings = requireSensoryRating(data);
      const childProfileId = optionalText(data, "childProfileId", 80);
      if (childProfileId) {
        const tutorUid = await repository.getChildProfileTutorUid(childProfileId);
        if (tutorUid !== context.uid) {
          fail("permission-denied", "The child profile does not belong to this tutor.");
        }
      }

      const reviewId = await repository.createReview({
        placeId: requireText(data, "placeId", 120),
        authorUid: context.uid,
        ...(childProfileId ? { childProfileId } : {}),
        tutorApproved: true,
        ratings,
        comment: optionalText(data, "comment", 1200) ?? "",
        status: "pending",
        createdAt: clock.now()
      });

      return { reviewId, status: "pending" };
    },

    async submitComment(context: RequestContext, rawData: unknown) {
      const data = requirePayload(rawData);
      const now = clock.now();
      const commentId = await repository.createComment({
        targetType: requireCommentTargetType(data),
        targetId: requireText(data, "targetId", 120),
        placeId: optionalText(data, "placeId", 120),
        authorUid: context.uid,
        body: requireText(data, "body", 1200),
        status: "pending",
        createdAt: now,
        updatedAt: now
      });

      return { commentId, status: "pending" };
    },

    async createPlaceImageRecord(context: RequestContext, rawData: unknown) {
      const data = requirePayload(rawData);
      const storagePath = requireText(data, "storagePath", 1024);
      const thumbnailPath = optionalText(data, "thumbnailPath", 1024);

      if (!storagePath.startsWith(`place-images/${context.uid}/`)) {
        fail("permission-denied", "storagePath must belong to the authenticated user.");
      }

      const imageId = await repository.createPlaceImage({
        placeId: requireText(data, "placeId", 120),
        authorUid: context.uid,
        storagePath,
        ...(thumbnailPath ? { thumbnailPath } : {}),
        altText: readAltText(data.altText),
        status: "pending",
        scanStatus: "not_configured",
        createdAt: clock.now()
      });

      return { imageId, status: "pending" };
    },

    async createReport(context: RequestContext, rawData: unknown) {
      const data = requirePayload(rawData);
      const reportId = await repository.createReport({
        targetType: requireReportTargetType(data),
        targetId: requireText(data, "targetId", 120),
        reporterUid: context.uid,
        reason: requireText(data, "reason", 1200),
        status: "open",
        createdAt: clock.now()
      });

      return { reportId, status: "open" };
    },

    async createChildProfile(context: RequestContext, rawData: unknown) {
      const data = requirePayload(rawData);
      const ageRange = optionalChildAgeRange(data);
      const now = clock.now();
      const existing = await repository.getUser(context.uid);
      const roles = ensureUserRoles(existing?.roles, "tutor", true);

      const childProfileId = await repository.createChildProfileAndUpdateUser({
        uid: context.uid,
        profile: {
          tutorUid: context.uid,
          alias: requireText(data, "alias", 80),
          ...(ageRange ? { ageRange } : {}),
          sensoryPreferences: readSensoryPreferences(data.sensoryPreferences),
          createdAt: now,
          updatedAt: now
        },
        user: {
          uid: context.uid,
          roles,
          status: "active",
          updatedAt: now,
          ...(existing ? {} : { createdAt: now })
        }
      });

      return { childProfileId };
    },

    async requestProfessionalVerification(context: RequestContext, rawData: unknown) {
      const data = requirePayload(rawData);
      const now = clock.now();
      const result = await repository.createVerificationRequest({
        profileCollection: "professionalProfiles",
        profile: {
          ownerUid: context.uid,
          professionalName: requireText(data, "professionalName", 120),
          licenseNumber: requireText(data, "licenseNumber", 80),
          professionalCollege: requireText(data, "professionalCollege", 160),
          specialty: requireText(data, "specialty", 160),
          photoPath: optionalOwnerPath(data, "photoPath", context.uid, "professional-photos"),
          verificationStatus: "pending_verification",
          createdAt: now,
          updatedAt: now
        },
        verification: {
          ownerUid: context.uid,
          profileType: "professional",
          evidencePath: optionalOwnerPath(data, "evidencePath", context.uid, "verification-evidence"),
          note: optionalText(data, "note", 1200),
          status: "open",
          createdAt: now,
          updatedAt: now
        }
      });

      return { ...result, status: "pending_verification" };
    },

    async requestOrganizationVerification(context: RequestContext, rawData: unknown) {
      const data = requirePayload(rawData);
      const now = clock.now();
      const result = await repository.createVerificationRequest({
        profileCollection: "organizationProfiles",
        profile: {
          ownerUid: context.uid,
          name: requireText(data, "name", 140),
          description: requireText(data, "description", 1200),
          city: requireText(data, "city", 120),
          website: optionalText(data, "website", 240),
          registryNumber: optionalText(data, "registryNumber", 120),
          logoPath: optionalOwnerPath(data, "logoPath", context.uid, "organization-logos"),
          verificationStatus: "pending_verification",
          createdAt: now,
          updatedAt: now
        },
        verification: {
          ownerUid: context.uid,
          profileType: "organization",
          evidencePath: optionalOwnerPath(data, "evidencePath", context.uid, "verification-evidence"),
          note: optionalText(data, "note", 1200),
          status: "open",
          createdAt: now,
          updatedAt: now
        }
      });

      return { ...result, status: "pending_verification" };
    },

    async moderateContent(context: RequestContext, rawData: unknown) {
      const data = requirePayload(rawData);
      const collectionId = requireSetValue(data, "collectionId", moderationTargets);
      const status = requireSetValue(data, "status", moderationTargetStatuses);
      const targetId = requireText(data, "targetId", 120);
      const reason = optionalText(data, "reason", 1200);
      const now = clock.now();
      const update: Record<string, unknown> = {
        status,
        updatedAt: now,
        moderatedAt: now,
        moderatedBy: context.uid
      };

      if (reason && collectionId === "placeImages") {
        update.rejectionReason = reason;
      }

      await repository.moderateContent({
        collectionId,
        targetId,
        update,
        adminAction: {
          action: "content_moderated",
          collectionId,
          targetId,
          status,
          reason: reason ?? null,
          actorUid: context.uid,
          createdAt: now
        }
      });

      return { targetId, status };
    },

    async setVerificationStatus(context: RequestContext, rawData: unknown) {
      const data = requirePayload(rawData);
      const profileType = requireVerificationRequestType(data) as VerificationRequestType;
      const status = requireVerificationStatus(data);
      const profileId = requireText(data, "profileId", 120);
      const profile = await repository.getVerificationProfile(profileType, profileId);
      if (!profile) {
        fail("not-found", "Verification profile not found.");
      }

      const ownerUid = profile.ownerUid;
      if (typeof ownerUid !== "string" || ownerUid.length === 0) {
        fail("failed-precondition", "Verification profile is missing ownerUid.");
      }

      const now = clock.now();
      const existing = await repository.getUser(ownerUid);
      const derivedRole = derivedVerificationRoles[profileType];
      const roles = ensureUserRoles(existing?.roles, derivedRole, status === "verified");

      await repository.setVerificationStatusAndUserRole({
        profileType,
        profileId,
        ownerUid,
        status,
        profileUpdate: {
          verificationStatus: status,
          verificationReviewedAt: now,
          verificationReviewedBy: context.uid,
          updatedAt: now
        },
        user: {
          uid: ownerUid,
          roles,
          status: "active",
          updatedAt: now,
          ...(existing ? {} : { createdAt: now })
        },
        adminAction: {
          action: "verification_status_set",
          collectionId: profileType === "professional" ? "professionalProfiles" : "organizationProfiles",
          targetId: profileId,
          to: status,
          actorUid: context.uid,
          note: optionalText(data, "note", 1200) ?? null,
          createdAt: now
        }
      });

      return { profileId, status };
    },

    async setUserAccessClaims(context: RequestContext, rawData: unknown) {
      const data = requirePayload(rawData);
      const targetUid = optionalText(data, "uid", 128);
      const targetEmail = optionalEmail(data, "email");
      const adminEnabled = optionalBoolean(data, "admin");
      const moderatorEnabled = optionalBoolean(data, "moderator");

      if (!targetUid && !targetEmail) {
        fail("invalid-argument", "Expected uid or email.");
      }

      if (adminEnabled === undefined && moderatorEnabled === undefined) {
        fail("invalid-argument", "Expected admin or moderator.");
      }

      const userRecord = await auth.getUser({ uid: targetUid, email: targetEmail });
      const nextAdmin = adminEnabled ?? userRecord.customClaims?.admin === true;
      const nextModerator = nextAdmin || (moderatorEnabled ?? userRecord.customClaims?.moderator === true);

      if (userRecord.uid === context.uid && !nextAdmin) {
        fail("failed-precondition", "Super admins cannot remove their own admin access.");
      }

      const customClaims: Record<string, unknown> = { ...(userRecord.customClaims ?? {}) };
      if (nextAdmin) {
        customClaims.admin = true;
      } else {
        delete customClaims.admin;
      }

      if (nextModerator) {
        customClaims.moderator = true;
      } else {
        delete customClaims.moderator;
      }

      await auth.setCustomUserClaims(userRecord.uid, customClaims);

      const now = clock.now();
      const existing = await repository.getUser(userRecord.uid);
      let roles = ensureUserRoles(existing?.roles, "admin", nextAdmin);
      roles = ensureUserRoles(roles, "moderator", nextModerator);

      await repository.saveUserAccess({
        uid: userRecord.uid,
        user: {
          uid: userRecord.uid,
          ...(userRecord.email ? { email: userRecord.email } : {}),
          ...(existing
            ? {}
            : {
                displayName: userRecord.displayName ?? userRecord.email ?? userRecord.uid,
                publicName: userRecord.displayName ?? userRecord.email ?? userRecord.uid,
                locale: "ca",
                authProviders: userRecord.providerIds.filter(isAuthProviderId),
                status: "active",
                createdAt: now
              }),
          roles,
          updatedAt: now
        },
        adminAction: {
          action: "user_access_claims_set",
          targetUid: userRecord.uid,
          targetEmail: userRecord.email ?? targetEmail ?? null,
          admin: nextAdmin,
          moderator: nextModerator,
          actorUid: context.uid,
          createdAt: now
        }
      });

      return {
        uid: userRecord.uid,
        email: userRecord.email ?? targetEmail,
        roles,
        claims: { admin: nextAdmin, moderator: nextModerator }
      };
    }
  };
}

export type UseCases = ReturnType<typeof createUseCases>;
