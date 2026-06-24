import type { Review } from "@accessibilitat/shared";
import { rejectedImageStatuses } from "../domain/moderation.js";
import { calculatePlaceReviewStats } from "../domain/review-stats.js";
import type { Clock } from "../ports/clock.js";
import type { AppLogger } from "../ports/logger.js";
import type { PlaceImageDocument, SpectrumRepository, VerificationDocument } from "../ports/repositories.js";

export type ReviewWrittenEvent = {
  before?: Review;
  after?: Review;
};

export type PlaceImageUpdatedEvent = {
  imageId: string;
  before: PlaceImageDocument;
  after: PlaceImageDocument;
};

export type VerificationStatusChangedEvent = {
  collectionId: string;
  profileId: string;
  before: VerificationDocument;
  after: VerificationDocument;
};

export type EventHandlerDependencies = {
  clock: Clock;
  logger: AppLogger;
  repository: SpectrumRepository;
};

export function createEventHandlers({ clock, logger, repository }: EventHandlerDependencies) {
  return {
    async recalculatePlaceReviewStats(event: ReviewWrittenEvent) {
      const placeId = event.after?.placeId ?? event.before?.placeId;
      if (!placeId) {
        return;
      }

      const reviews = await repository.listActiveReviewsForPlace(placeId);
      await repository.updatePlaceReviewStats(placeId, calculatePlaceReviewStats(reviews), clock.now());
    },

    async notifyRejectedImage(event: PlaceImageUpdatedEvent) {
      if (event.before.status === event.after.status || typeof event.after.status !== "string") {
        return;
      }

      if (!rejectedImageStatuses.has(event.after.status)) {
        return;
      }

      const authorUid = event.after.authorUid;
      if (typeof authorUid !== "string" || authorUid.length === 0) {
        logger.warn("Image moderation event without authorUid", { imageId: event.imageId });
        return;
      }

      await repository.createUserNotification(authorUid, {
        type: "image_moderation",
        imageId: event.imageId,
        status: event.after.status,
        reason: event.after.rejectionReason ?? "moderation_policy",
        read: false,
        createdAt: clock.now()
      });
    },

    async auditVerificationStatusChange(event: VerificationStatusChangedEvent) {
      if (!["professionalProfiles", "organizationProfiles"].includes(event.collectionId)) {
        return;
      }

      if (event.before.verificationStatus === event.after.verificationStatus) {
        return;
      }

      await repository.addAdminAction({
        action: "verification_status_changed",
        collectionId: event.collectionId,
        targetId: event.profileId,
        from: event.before.verificationStatus,
        to: event.after.verificationStatus,
        createdAt: clock.now()
      });
    }
  };
}

export type EventHandlers = ReturnType<typeof createEventHandlers>;
