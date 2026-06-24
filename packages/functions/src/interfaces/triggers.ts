import type { Review } from "@accessibilitat/shared";
import { onDocumentUpdated, onDocumentWritten } from "firebase-functions/v2/firestore";
import { eventHandlers, functionRegion } from "../composition/container.js";

export const recalculatePlaceReviewStats = onDocumentWritten(
  { document: "reviews/{reviewId}", region: functionRegion },
  async (event) => {
    await eventHandlers.recalculatePlaceReviewStats({
      before: event.data?.before.data() as Review | undefined,
      after: event.data?.after.data() as Review | undefined
    });
  }
);

export const notifyRejectedImage = onDocumentUpdated(
  { document: "placeImages/{imageId}", region: functionRegion },
  async (event) => {
    if (!event.data) {
      return;
    }

    await eventHandlers.notifyRejectedImage({
      imageId: event.params.imageId,
      before: event.data.before.data(),
      after: event.data.after.data()
    });
  }
);

export const auditVerificationStatusChange = onDocumentUpdated(
  { document: "{collectionId}/{profileId}", region: functionRegion },
  async (event) => {
    if (!event.data) {
      return;
    }

    await eventHandlers.auditVerificationStatusChange({
      collectionId: event.params.collectionId,
      profileId: event.params.profileId,
      before: event.data.before.data(),
      after: event.data.after.data()
    });
  }
);
