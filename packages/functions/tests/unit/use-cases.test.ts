import { describe, expect, it } from "vitest";
import { ApplicationError } from "../../src/domain/errors.js";
import { createUseCases } from "../../src/application/use-cases.js";
import type { AuthGateway, AuthUserRecord, UserLookup } from "../../src/ports/auth.js";
import type { Clock, TimestampValue } from "../../src/ports/clock.js";
import type { GooglePlaceCandidate, NearbyPlacesSearch, PlacesGateway } from "../../src/ports/places.js";
import type { SpectrumRepository, UserDocument, VerificationProfileDocument } from "../../src/ports/repositories.js";
import type { PlaceReviewStats } from "../../src/domain/review-stats.js";
import type { EventEdition, EventExperience, EventSeries, EventZone, Place, Review } from "@accessibilitat/shared";

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
  places = new Map<string, Place>();
  eventSeries = new Map<string, EventSeries>();
  eventEditions = new Map<string, EventEdition>();
  eventZones = new Map<string, EventZone>();
  eventExperiences = new Map<string, EventExperience>();
  createdPlaces: Array<Record<string, unknown>> = [];
  createdEventSeries: Array<Record<string, unknown>> = [];
  createdEventEditions: Array<Record<string, unknown>> = [];
  createdEventZones: Array<Record<string, unknown>> = [];
  createdEventExperiences: Array<Record<string, unknown>> = [];
  createdReviews: Array<Record<string, unknown>> = [];
  rateLimitAllowed = true;
  reservedRateLimits: Array<Record<string, unknown>> = [];

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

  listActivePlacesForDiscovery(_limit: number): Promise<Place[]> {
    return Promise.resolve([...this.places.values()].filter((place) => place.status === "active"));
  }

  listActiveEventSeries(_limit: number): Promise<EventSeries[]> {
    return Promise.resolve([...this.eventSeries.values()].filter((series) => series.status === "active"));
  }

  listActiveEventEditions(_limit: number): Promise<EventEdition[]> {
    return Promise.resolve([...this.eventEditions.values()].filter((edition) => edition.status === "active"));
  }

  listActiveEventZones(_limit: number): Promise<EventZone[]> {
    return Promise.resolve([...this.eventZones.values()].filter((zone) => zone.status === "active"));
  }

  listActiveEventExperiences(_limit: number): Promise<EventExperience[]> {
    return Promise.resolve([...this.eventExperiences.values()].filter((experience) => experience.status === "active"));
  }

  async createEventSeries(data: Record<string, unknown>): Promise<string> {
    this.createdEventSeries.push(data);
    return "event-series-1";
  }

  async createEventEdition(data: Record<string, unknown>): Promise<string> {
    this.createdEventEditions.push(data);
    return "event-edition-1";
  }

  async createEventZone(data: Record<string, unknown>): Promise<string> {
    this.createdEventZones.push(data);
    return "event-zone-1";
  }

  async createEventExperience(input: {
    experienceId: string;
    data: Record<string, unknown>;
  }): Promise<string> {
    this.createdEventExperiences.push(input.data);
    return input.experienceId;
  }

  getPlaceByGooglePlaceId(googlePlaceId: string): Promise<Place | undefined> {
    return Promise.resolve([...this.places.values()].find((place) => place.external?.googlePlaceId === googlePlaceId));
  }

  async createGoogleLinkedPlace(input: {
    googlePlaceId: string;
    data: Record<string, unknown>;
  }): Promise<string> {
    const placeId = `google-${input.googlePlaceId}`;
    this.places.set(placeId, { id: placeId, ...(input.data as Omit<Place, "id">) });
    this.createdPlaces.push(input.data);
    return placeId;
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

  reserveRateLimit(input: {
    namespace: string;
    key: string;
    limit: number;
    windowSeconds: number;
    nowMillis?: number;
  }): Promise<boolean> {
    this.reservedRateLimits.push(input);
    return Promise.resolve(this.rateLimitAllowed);
  }
}

class FakePlacesGateway implements PlacesGateway {
  nearby: GooglePlaceCandidate[] = [];
  details = new Map<string, GooglePlaceCandidate>();
  lastSearch: NearbyPlacesSearch | null = null;

  searchNearby(input: NearbyPlacesSearch): Promise<GooglePlaceCandidate[]> {
    this.lastSearch = input;
    return Promise.resolve(this.nearby);
  }

  getPlace(googlePlaceId: string): Promise<GooglePlaceCandidate | undefined> {
    return Promise.resolve(this.details.get(googlePlaceId));
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

const validEventRatings = {
  noise: 4,
  crowd: 5,
  lighting: 3,
  waitingTime: 2,
  temperature: 4,
  perceivedSafety: 3,
  exitEase: 2
};

function makeUseCases() {
  const repository = new FakeRepository();
  const places = new FakePlacesGateway();
  const useCases = createUseCases({
    auth: new FakeAuthGateway(),
    clock: new FakeClock(),
    places,
    repository
  });

  return { places, repository, useCases };
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

  it("creates pending event catalog entries for normal users", async () => {
    const { repository, useCases } = makeUseCases();

    const series = await useCases.createEventSeries(
      { uid: "user-1", token: {} },
      {
        title: "Festa Major",
        category: "festa_major",
        city: "Manresa",
        description: "Edicio anual"
      }
    );
    const edition = await useCases.createEventEdition(
      { uid: "user-1", token: {} },
      {
        eventSeriesId: series.eventSeriesId,
        title: "Festa Major 2027",
        year: 2027,
        startsAt: "2027-08-25T08:00:00.000Z",
        endsAt: "2027-08-31T23:00:00.000Z"
      }
    );
    const zone = await useCases.createEventZone(
      { uid: "user-1", token: {} },
      {
        eventSeriesId: series.eventSeriesId,
        eventEditionId: edition.eventEditionId,
        name: "Plaça Major",
        latitude: 41.724,
        longitude: 1.826,
        radiusMeters: 120
      }
    );

    expect(series).toEqual({ eventSeriesId: "event-series-1", status: "pending" });
    expect(edition).toEqual({ eventEditionId: "event-edition-1", status: "pending" });
    expect(zone).toEqual({ eventZoneId: "event-zone-1", status: "pending" });
    expect(repository.createdEventSeries[0]).toMatchObject({ status: "pending", createdBy: "user-1" });
    expect(repository.createdEventEditions[0]).toMatchObject({ year: 2027, status: "pending" });
    expect(repository.createdEventZones[0]).toMatchObject({ name: "Plaça Major", status: "pending" });
  });

  it("stores event experiences as pending with required user-owned photos", async () => {
    const { repository, useCases } = makeUseCases();

    const result = await useCases.submitEventExperience(
      { uid: "user-1", token: {} },
      {
        experienceId: "experience-1",
        eventSeriesId: "series-1",
        eventEditionId: "edition-1",
        eventZoneId: "zone-1",
        observedAt: "2027-08-28T20:30:00.000Z",
        ratings: validEventRatings,
        description: "La plaça estava plena i hi havia molta intensitat sonora.",
        photoPath: "event-experience-images/user-1/experience-1/plena.jpg"
      }
    );

    expect(result).toEqual({ eventExperienceId: "experience-1", status: "pending" });
    expect(repository.createdEventExperiences[0]).toMatchObject({
      authorUid: "user-1",
      status: "pending",
      photoPath: "event-experience-images/user-1/experience-1/plena.jpg"
    });
  });

  it("rejects event experience photos outside the contributor path", async () => {
    const { useCases } = makeUseCases();

    await expect(
      useCases.submitEventExperience(
        { uid: "user-1", token: {} },
        {
          experienceId: "experience-1",
          eventSeriesId: "series-1",
          eventEditionId: "edition-1",
          eventZoneId: "zone-1",
          observedAt: "2027-08-28T20:30:00.000Z",
          ratings: validEventRatings,
          description: "Text valid.",
          photoPath: "event-experience-images/user-2/experience-1/plena.jpg"
        }
      )
    ).rejects.toMatchObject(
      new ApplicationError("permission-denied", "photoPath must belong to the authenticated user and experience.")
    );
  });

  it("merges Google Places discovery with existing Spectrum stats", async () => {
    const { places, repository, useCases } = makeUseCases();
    places.nearby = [
      {
        googlePlaceId: "google-1",
        name: "Biblioteca Central",
        formattedAddress: "Passeig Pere III, 08242 Manresa, Barcelona, Spain",
        latitude: 41.728,
        longitude: 1.823,
        primaryType: "library",
        types: ["library", "point_of_interest"]
      }
    ];
    repository.places.set("spectrum-1", {
      id: "spectrum-1",
      name: "Biblioteca Central",
      category: "culture",
      city: "Manresa",
      addressOrArea: "Passeig Pere III",
      description: "",
      position: { latitude: 41.728, longitude: 1.823 },
      external: { googlePlaceId: "google-1" },
      status: "active",
      createdBy: "moderator",
      ratingCount: 3,
      imageCount: 1,
      averageScore: 4,
      criterionAverages: { noise: 2 },
      updatedAt: "now"
    });

    const result = await useCases.searchNearbyPlaces({
      latitude: 41.728,
      longitude: 1.823,
      radiusMeters: 1000,
      maxResultCount: 10,
      locale: "ca"
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "spectrum:spectrum-1",
      source: "spectrum",
      spectrumPlaceId: "spectrum-1",
      googlePlaceId: "google-1",
      ratingCount: 3,
      hasSpectrumData: true
    });
    expect(places.lastSearch?.includedTypes).toContain("restaurant");
  });

  it("blocks public place discovery when the caller search quota is exhausted", async () => {
    const { places, repository, useCases } = makeUseCases();
    repository.rateLimitAllowed = false;

    await expect(
      useCases.searchNearbyPlaces(
        {
          latitude: 41.728,
          longitude: 1.823,
          radiusMeters: 1000,
          maxResultCount: 10,
          locale: "ca"
        },
        {
          namespace: "places.searchNearby",
          key: "app:web:ip:127.0.0.1",
          limit: 60,
          windowSeconds: 60
        }
      )
    ).rejects.toMatchObject(new ApplicationError("resource-exhausted", "Too many requests. Try again shortly."));

    expect(repository.reservedRateLimits).toHaveLength(1);
    expect(places.lastSearch).toBeNull();
  });

  it("resolves a Google place into a pending local Spectrum place", async () => {
    const { places, repository, useCases } = makeUseCases();
    places.details.set("google-2", {
      googlePlaceId: "google-2",
      name: "Parc de la Seu",
      formattedAddress: "Parc de la Seu, 08241 Manresa, Barcelona, Spain",
      latitude: 41.721,
      longitude: 1.828,
      primaryType: "park",
      types: ["park", "point_of_interest"]
    });

    const result = await useCases.resolvePlaceForContribution(
      { uid: "user-1", token: {} },
      {
        googlePlaceId: "google-2",
        locale: "ca",
        name: "Fallback",
        category: "other",
        city: "Manresa",
        addressOrArea: "Fallback address",
        latitude: 41.7,
        longitude: 1.8,
        contributorPosition: {
          latitude: 41.721,
          longitude: 1.828
        }
      }
    );

    expect(result).toEqual({ placeId: "google-google-2", status: "pending" });
    expect(repository.createdPlaces[0]).toMatchObject({
      name: "Parc de la Seu",
      category: "park",
      status: "pending",
      createdBy: "user-1",
      external: { googlePlaceId: "google-2" }
    });
  });

  it("requires contributors to be near a discovered Google place", async () => {
    const { places, useCases } = makeUseCases();
    places.details.set("google-2", {
      googlePlaceId: "google-2",
      name: "Parc de la Seu",
      formattedAddress: "Parc de la Seu, 08241 Manresa, Barcelona, Spain",
      latitude: 41.721,
      longitude: 1.828,
      primaryType: "park",
      types: ["park", "point_of_interest"]
    });

    await expect(
      useCases.resolvePlaceForContribution(
        { uid: "user-1", token: {} },
        {
          googlePlaceId: "google-2",
          locale: "ca",
          name: "Fallback",
          category: "other",
          city: "Manresa",
          addressOrArea: "Fallback address",
          latitude: 41.7,
          longitude: 1.8,
          contributorPosition: {
            latitude: 41.728,
            longitude: 1.823
          }
        }
      )
    ).rejects.toMatchObject(new ApplicationError("failed-precondition", "The contributor must be near this place."));
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

  it("does not reactivate disabled users during onboarding", async () => {
    const { repository, useCases } = makeUseCases();
    repository.users.set("user-1", {
      createdAt: "existing-created-at",
      roles: ["user"],
      status: "disabled"
    });

    await expect(
      useCases.completeUserOnboarding(
        { uid: "user-1", token: { email: "user@example.com" } },
        {
          publicName: "Usuari",
          locale: "ca",
          authProviders: ["password"]
        }
      )
    ).rejects.toMatchObject(new ApplicationError("permission-denied", "This account is disabled."));
    expect(repository.users.get("user-1")).toMatchObject({
      status: "disabled",
      createdAt: "existing-created-at"
    });
  });
});
