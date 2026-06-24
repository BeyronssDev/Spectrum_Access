import { describe, expect, it } from "vitest";
import { ApplicationError } from "../../src/domain/errors.js";
import { createUseCases } from "../../src/application/use-cases.js";
import type { AuthGateway, AuthUserRecord, UserLookup } from "../../src/ports/auth.js";
import type { Clock, TimestampValue } from "../../src/ports/clock.js";
import type { SpectrumRepository, UserDocument, VerificationProfileDocument } from "../../src/ports/repositories.js";
import type { PlaceReviewStats } from "../../src/domain/review-stats.js";
import type { Review } from "@accessibilitat/shared";

class FakeClock implements Clock {
  now(): TimestampValue {
    return "now";
  }
}

class FakeAuthGateway implements AuthGateway {
  user: AuthUserRecord = {
    uid: "target-user",
    email: "target@example.com",
    providerIds: ["password"],
    customClaims: {}
  };

  getUser(_lookup: UserLookup): Promise<AuthUserRecord> {
    return Promise.resolve(this.user);
  }

  setCustomUserClaims(_uid: string, _claims: Record<string, unknown>): Promise<void> {
    return Promise.resolve();
  }
}

class FakeRepository implements SpectrumRepository {
  users = new Map<string, UserDocument>();
  childTutors = new Map<string, string>();
  createdPlaces: Array<Record<string, unknown>> = [];
  createdReviews: Array<Record<string, unknown>> = [];

  getUser(uid: string): Promise<UserDocument | undefined> {
    return Promise.resolve(this.users.get(uid));
  }

  async saveUser(uid: string, data: Record<string, unknown>): Promise<void> {
    this.users.set(uid, { ...(this.users.get(uid) ?? {}), ...data });
  }

  getChildProfileTutorUid(childProfileId: string): Promise<string | undefined> {
    return Promise.resolve(this.childTutors.get(childProfileId));
  }

  async createPlace(data: Record<string, unknown>): Promise<string> {
    this.createdPlaces.push(data);
    return "place-1";
  }

  async createReview(data: Record<string, unknown>): Promise<string> {
    this.createdReviews.push(data);
    return "review-1";
  }

  createComment(_data: Record<string, unknown>): Promise<string> {
    return Promise.resolve("comment-1");
  }

  createPlaceImage(_data: Record<string, unknown>): Promise<string> {
    return Promise.resolve("image-1");
  }

  createReport(_data: Record<string, unknown>): Promise<string> {
    return Promise.resolve("report-1");
  }

  createChildProfileAndUpdateUser(_input: {
    uid: string;
    profile: Record<string, unknown>;
    user: Record<string, unknown>;
  }): Promise<string> {
    return Promise.resolve("child-1");
  }

  createVerificationRequest(_input: {
    profileCollection: "professionalProfiles" | "organizationProfiles";
    profile: Record<string, unknown>;
    verification: Record<string, unknown>;
  }): Promise<{ profileId: string; verificationRequestId: string }> {
    return Promise.resolve({ profileId: "profile-1", verificationRequestId: "verification-1" });
  }

  moderateContent(_input: {
    collectionId: string;
    targetId: string;
    update: Record<string, unknown>;
    adminAction: Record<string, unknown>;
  }): Promise<void> {
    return Promise.resolve();
  }

  getVerificationProfile(_profileType: "professional" | "organization", _profileId: string): Promise<VerificationProfileDocument | undefined> {
    return Promise.resolve({ ownerUid: "owner-1" });
  }

  setVerificationStatusAndUserRole(_input: {
    profileType: "professional" | "organization";
    profileId: string;
    ownerUid: string;
    status: "unverified" | "pending_verification" | "verified" | "rejected" | "suspended";
    profileUpdate: Record<string, unknown>;
    user: Record<string, unknown>;
    adminAction: Record<string, unknown>;
  }): Promise<void> {
    return Promise.resolve();
  }

  saveUserAccess(_input: {
    uid: string;
    user: Record<string, unknown>;
    adminAction: Record<string, unknown>;
  }): Promise<void> {
    return Promise.resolve();
  }

  listActiveReviewsForPlace(_placeId: string): Promise<Review[]> {
    return Promise.resolve([]);
  }

  updatePlaceReviewStats(_placeId: string, _stats: PlaceReviewStats, _updatedAt: TimestampValue): Promise<void> {
    return Promise.resolve();
  }

  createUserNotification(_uid: string, _data: Record<string, unknown>): Promise<void> {
    return Promise.resolve();
  }

  addAdminAction(_data: Record<string, unknown>): Promise<void> {
    return Promise.resolve();
  }
}

const validRatings = {
  noise: 1,
  crowd: 2,
  lighting: 3,
  temperature: 4,
  waitingTime: 5,
  staffTreatment: 4,
  quietSpace: 3,
  exitEase: 2,
  perceivedSafety: 4,
  generalRecommendation: 5
};

function makeUseCases() {
  const repository = new FakeRepository();
  const useCases = createUseCases({
    auth: new FakeAuthGateway(),
    clock: new FakeClock(),
    repository
  });

  return { repository, useCases };
}

describe("functions use cases", () => {
  it("creates pending places through the repository port", async () => {
    const { repository, useCases } = makeUseCases();

    const result = await useCases.createPlace(
      { uid: "user-1", token: {} },
      {
        name: "Biblioteca",
        category: "culture",
        city: "Barcelona",
        addressOrArea: "Centre",
        latitude: 41.38,
        longitude: 2.17
      }
    );

    expect(result).toEqual({ placeId: "place-1", status: "pending" });
    expect(repository.createdPlaces[0]).toMatchObject({
      name: "Biblioteca",
      status: "pending",
      createdBy: "user-1"
    });
  });

  it("blocks child reviews when the profile belongs to another tutor", async () => {
    const { useCases } = makeUseCases();

    await expect(
      useCases.submitReview(
        { uid: "tutor-a", token: {} },
        {
          placeId: "place-1",
          childProfileId: "child-1",
          ratings: validRatings
        }
      )
    ).rejects.toMatchObject(new ApplicationError("permission-denied", "The child profile does not belong to this tutor."));
  });

  it("completes onboarding while preserving an existing createdAt", async () => {
    const { repository, useCases } = makeUseCases();
    repository.users.set("user-1", { createdAt: "existing-created-at", roles: ["user"] });

    await useCases.completeUserOnboarding(
      { uid: "user-1", token: { email: "user@example.com" } },
      {
        publicName: "Usuari",
        locale: "ca",
        authProviders: ["password"]
      }
    );

    expect(repository.users.get("user-1")).toMatchObject({
      email: "user@example.com",
      publicName: "Usuari",
      createdAt: "existing-created-at",
      updatedAt: "now"
    });
  });
});
