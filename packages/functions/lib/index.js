import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { onDocumentUpdated, onDocumentWritten } from "firebase-functions/v2/firestore";
initializeApp();
const db = getFirestore();
const aggregateCriteria = [
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
export const recalculatePlaceReviewStats = onDocumentWritten("reviews/{reviewId}", async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
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
    const criterionTotals = Object.fromEntries(aggregateCriteria.map((criterion) => [criterion, 0]));
    snapshot.forEach((doc) => {
        const review = doc.data();
        ratingCount += 1;
        for (const criterion of aggregateCriteria) {
            criterionTotals[criterion] += review.ratings[criterion] ?? 0;
        }
        scoreTotal += review.ratings.generalRecommendation ?? 0;
    });
    const averages = Object.fromEntries(aggregateCriteria.map((criterion) => [
        criterion,
        ratingCount > 0 ? Number((criterionTotals[criterion] / ratingCount).toFixed(2)) : 0
    ]));
    await db.collection("places").doc(placeId).set({
        ratingCount,
        averageScore: ratingCount > 0 ? Number((scoreTotal / ratingCount).toFixed(2)) : 0,
        criterionAverages: averages,
        updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
});
export const notifyRejectedImage = onDocumentUpdated("placeImages/{imageId}", async (event) => {
    if (!event.data) {
        return;
    }
    const before = event.data.before.data();
    const after = event.data.after.data();
    if (before.status === after.status || !["rejected", "deleted", "hidden"].includes(after.status)) {
        return;
    }
    const authorUid = after.authorUid;
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
});
export const auditVerificationStatusChange = onDocumentUpdated("{collectionId}/{profileId}", async (event) => {
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
});
