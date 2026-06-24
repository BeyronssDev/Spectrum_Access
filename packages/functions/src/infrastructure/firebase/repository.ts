import type { Firestore } from "firebase-admin/firestore";
import type { Review, VerificationRequestType } from "@accessibilitat/shared";
import type { PlaceReviewStats } from "../../domain/review-stats.js";
import type { TimestampValue } from "../../ports/clock.js";
import type {
  SpectrumRepository,
  UserDocument,
  VerificationProfileDocument
} from "../../ports/repositories.js";

export class FirestoreSpectrumRepository implements SpectrumRepository {
  constructor(private readonly db: Firestore) {}

  async getUser(uid: string): Promise<UserDocument | undefined> {
    const snapshot = await this.db.collection("users").doc(uid).get();
    return snapshot.exists ? snapshot.data() : undefined;
  }

  async saveUser(uid: string, data: Record<string, unknown>): Promise<void> {
    await this.db.collection("users").doc(uid).set(data, { merge: true });
  }

  async getChildProfileTutorUid(childProfileId: string): Promise<string | undefined> {
    const childProfile = await this.db.collection("childProfiles").doc(childProfileId).get();
    const tutorUid = childProfile.data()?.tutorUid;
    return typeof tutorUid === "string" ? tutorUid : undefined;
  }

  async createPlace(data: Record<string, unknown>): Promise<string> {
    const ref = this.db.collection("places").doc();
    await ref.set({ id: ref.id, ...data });
    return ref.id;
  }

  async createReview(data: Record<string, unknown>): Promise<string> {
    const ref = this.db.collection("reviews").doc();
    await ref.set({ id: ref.id, ...data });
    return ref.id;
  }

  async createComment(data: Record<string, unknown>): Promise<string> {
    const ref = this.db.collection("comments").doc();
    await ref.set({ id: ref.id, ...data });
    return ref.id;
  }

  async createPlaceImage(data: Record<string, unknown>): Promise<string> {
    const ref = this.db.collection("placeImages").doc();
    await ref.set({ id: ref.id, ...data });
    return ref.id;
  }

  async createReport(data: Record<string, unknown>): Promise<string> {
    const ref = this.db.collection("reports").doc();
    await ref.set({ id: ref.id, ...data });
    return ref.id;
  }

  async createChildProfileAndUpdateUser(input: {
    uid: string;
    profile: Record<string, unknown>;
    user: Record<string, unknown>;
  }): Promise<string> {
    const profileRef = this.db.collection("childProfiles").doc();
    const userRef = this.db.collection("users").doc(input.uid);
    const batch = this.db.batch();

    batch.set(profileRef, { id: profileRef.id, ...input.profile });
    batch.set(userRef, input.user, { merge: true });
    await batch.commit();

    return profileRef.id;
  }

  async createVerificationRequest(input: {
    profileCollection: "professionalProfiles" | "organizationProfiles";
    profile: Record<string, unknown>;
    verification: Record<string, unknown>;
  }): Promise<{ profileId: string; verificationRequestId: string }> {
    const profileRef = this.db.collection(input.profileCollection).doc();
    const verificationRef = this.db.collection("verificationRequests").doc();
    const batch = this.db.batch();

    batch.set(profileRef, { id: profileRef.id, ...input.profile });
    batch.set(verificationRef, { id: verificationRef.id, profileId: profileRef.id, ...input.verification });
    await batch.commit();

    return { profileId: profileRef.id, verificationRequestId: verificationRef.id };
  }

  async moderateContent(input: {
    collectionId: string;
    targetId: string;
    update: Record<string, unknown>;
    adminAction: Record<string, unknown>;
  }): Promise<void> {
    const batch = this.db.batch();
    batch.update(this.db.collection(input.collectionId).doc(input.targetId), input.update);
    batch.set(this.db.collection("adminActions").doc(), input.adminAction);
    await batch.commit();
  }

  async getVerificationProfile(
    profileType: VerificationRequestType,
    profileId: string
  ): Promise<VerificationProfileDocument | undefined> {
    const collectionId = profileType === "professional" ? "professionalProfiles" : "organizationProfiles";
    const snapshot = await this.db.collection(collectionId).doc(profileId).get();
    return snapshot.exists ? snapshot.data() : undefined;
  }

  async setVerificationStatusAndUserRole(input: {
    profileType: VerificationRequestType;
    profileId: string;
    ownerUid: string;
    status: string;
    profileUpdate: Record<string, unknown>;
    user: Record<string, unknown>;
    adminAction: Record<string, unknown>;
  }): Promise<void> {
    const collectionId = input.profileType === "professional" ? "professionalProfiles" : "organizationProfiles";
    const batch = this.db.batch();

    batch.update(this.db.collection(collectionId).doc(input.profileId), input.profileUpdate);
    batch.set(this.db.collection("users").doc(input.ownerUid), input.user, { merge: true });
    batch.set(this.db.collection("adminActions").doc(), input.adminAction);
    await batch.commit();
  }

  async saveUserAccess(input: {
    uid: string;
    user: Record<string, unknown>;
    adminAction: Record<string, unknown>;
  }): Promise<void> {
    const batch = this.db.batch();
    batch.set(this.db.collection("users").doc(input.uid), input.user, { merge: true });
    batch.set(this.db.collection("adminActions").doc(), input.adminAction);
    await batch.commit();
  }

  async listActiveReviewsForPlace(placeId: string): Promise<Review[]> {
    const snapshot = await this.db
      .collection("reviews")
      .where("placeId", "==", placeId)
      .where("status", "==", "active")
      .get();

    return snapshot.docs.map((doc) => doc.data() as Review);
  }

  async updatePlaceReviewStats(placeId: string, stats: PlaceReviewStats, updatedAt: TimestampValue): Promise<void> {
    await this.db.collection("places").doc(placeId).set(
      {
        ratingCount: stats.ratingCount,
        averageScore: stats.averageScore,
        criterionAverages: stats.criterionAverages,
        updatedAt
      },
      { merge: true }
    );
  }

  async createUserNotification(uid: string, data: Record<string, unknown>): Promise<void> {
    await this.db.collection("userNotifications").doc(uid).collection("items").add(data);
  }

  async addAdminAction(data: Record<string, unknown>): Promise<void> {
    await this.db.collection("adminActions").add(data);
  }
}
