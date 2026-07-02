import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment
} from "@firebase/rules-unit-testing";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "spectrum-access-499918",
    firestore: {
      rules: readFileSync(resolve(process.cwd(), "../../firebase/firestore.rules"), "utf8")
    },
    storage: {
      rules: readFileSync(resolve(process.cwd(), "../../firebase/storage.rules"), "utf8")
    }
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.clearStorage();
});

afterAll(async () => {
  await testEnv.cleanup();
});

const adultGate = {
  adultConfirmed: true,
  minimumAge: 18,
  method: "self_declared",
  confirmedAt: new Date("2026-06-20T00:00:00.000Z")
};

function activeUserDoc(uid: string) {
  return {
    uid,
    displayName: "Test User",
    publicName: "Test User",
    authProviders: ["password"],
    roles: ["user"],
    status: "active",
    locale: "ca",
    adultGate,
    createdAt: "2026-06-20T00:00:00.000Z",
    updatedAt: "2026-06-20T00:00:00.000Z"
  };
}

async function seedActiveUsers(...uids: string[]) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await Promise.all(uids.map((uid) => db.collection("users").doc(uid).set(activeUserDoc(uid))));
  });
}

describe("Firestore security rules", () => {
  it("allows base user creation without elevated roles", async () => {
    const userDb = testEnv.authenticatedContext("user-a").firestore();

    await assertSucceeds(
      userDb.collection("users").doc("user-a").set({
        uid: "user-a",
        displayName: "Test User",
        publicName: "Test User",
        authProviders: ["password"],
        roles: ["user"],
        status: "active",
        locale: "ca",
        adultGate,
        createdAt: "2026-06-20T00:00:00.000Z",
        updatedAt: "2026-06-20T00:00:00.000Z"
      })
    );
  });

  it("blocks base user creation without adult confirmation", async () => {
    const userDb = testEnv.authenticatedContext("user-a").firestore();

    await assertFails(
      userDb.collection("users").doc("user-a").set({
        uid: "user-a",
        displayName: "Test User",
        publicName: "Test User",
        authProviders: ["password"],
        roles: ["user"],
        status: "active",
        locale: "ca",
        createdAt: "2026-06-20T00:00:00.000Z",
        updatedAt: "2026-06-20T00:00:00.000Z"
      })
    );
  });

  it("blocks users from creating themselves with elevated roles", async () => {
    const userDb = testEnv.authenticatedContext("user-a").firestore();

    await assertFails(
      userDb.collection("users").doc("user-a").set({
        uid: "user-a",
        displayName: "Test User",
        publicName: "Test User",
        authProviders: ["password"],
        roles: ["user", "professional", "admin"],
        status: "active",
        locale: "ca",
        adultGate,
        createdAt: "2026-06-20T00:00:00.000Z",
        updatedAt: "2026-06-20T00:00:00.000Z"
      })
    );
  });

  it("lets public users read active places only", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("places").doc("active").set({
        status: "active",
        name: "Test Place",
        category: "culture",
        updatedAt: "2026-06-19T00:00:00.000Z"
      });
      await context.firestore().collection("places").doc("pending").set({
        status: "pending",
        name: "Pendent",
        category: "culture",
        updatedAt: "2026-06-19T00:00:00.000Z"
      });
    });

    const anon = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(anon.collection("places").doc("active").get());
    await assertFails(anon.collection("places").doc("pending").get());
  });

  it("forces user-created place images to start pending", async () => {
    await seedActiveUsers("user-a");
    const userDb = testEnv.authenticatedContext("user-a").firestore();

    await assertSucceeds(
      userDb.collection("placeImages").doc("img-1").set({
        placeId: "place-1",
        authorUid: "user-a",
        status: "pending",
        scanStatus: "not_configured",
        storagePath: "place-images/user-a/img-1/original.jpg",
        createdAt: "2026-06-19T00:00:00.000Z"
      })
    );

    await assertFails(
      userDb.collection("placeImages").doc("img-2").set({
        placeId: "place-1",
        authorUid: "user-a",
        status: "active",
        scanStatus: "not_configured",
        storagePath: "place-images/user-a/img-2/original.jpg",
        createdAt: "2026-06-19T00:00:00.000Z"
      })
    );
  });

  it("blocks anonymous place image records", async () => {
    const anonDb = testEnv.unauthenticatedContext().firestore();

    await assertFails(
      anonDb.collection("placeImages").doc("img-1").set({
        placeId: "place-1",
        authorUid: "anonymous",
        status: "pending",
        scanStatus: "not_configured",
        storagePath: "place-images/anonymous/img-1/original.jpg",
        createdAt: "2026-06-20T00:00:00.000Z"
      })
    );
  });

  it("lets users upload only their own profile photos", async () => {
    await seedActiveUsers("user-a", "user-b");
    const ownerStorage = testEnv.authenticatedContext("user-a").storage();
    const otherStorage = testEnv.authenticatedContext("user-b").storage();
    const imageDataUrl =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=";

    await assertSucceeds(
      ownerStorage.ref("profile-photos/user-a/avatar.png").putString(imageDataUrl, "data_url")
    );
    await assertFails(
      otherStorage.ref("profile-photos/user-a/avatar-2.png").putString(imageDataUrl, "data_url")
    );
    await assertFails(
      ownerStorage.ref("profile-photos/user-a/not-image.txt").putString("not an image", "raw", {
        contentType: "text/plain"
      })
    );
  });

  it("lets tutors manage only their own child profiles", async () => {
    await seedActiveUsers("tutor-a", "tutor-b");
    const tutorDb = testEnv.authenticatedContext("tutor-a").firestore();
    const otherDb = testEnv.authenticatedContext("tutor-b").firestore();

    await assertSucceeds(
      tutorDb.collection("childProfiles").doc("child-a").set({
        tutorUid: "tutor-a",
        alias: "Perfil tranquil",
        sensoryPreferences: {},
        createdAt: "2026-06-19T00:00:00.000Z",
        updatedAt: "2026-06-19T00:00:00.000Z"
      })
    );

    await assertSucceeds(tutorDb.collection("childProfiles").doc("child-a").get());
    await assertFails(otherDb.collection("childProfiles").doc("child-a").get());
  });

  it("forces user-created comments to start pending", async () => {
    await seedActiveUsers("user-a");
    const userDb = testEnv.authenticatedContext("user-a").firestore();

    await assertSucceeds(
      userDb.collection("comments").doc("comment-1").set({
        targetType: "place",
        targetId: "place-1",
        authorUid: "user-a",
        body: "Entrada clara i personal tranquil.",
        status: "pending",
        createdAt: "2026-06-19T00:00:00.000Z",
        updatedAt: "2026-06-19T00:00:00.000Z"
      })
    );

    await assertFails(
      userDb.collection("comments").doc("comment-2").set({
        targetType: "place",
        targetId: "place-1",
        authorUid: "user-a",
        body: "No ha de sortir actiu directament.",
        status: "active",
        createdAt: "2026-06-19T00:00:00.000Z",
        updatedAt: "2026-06-19T00:00:00.000Z"
      })
    );
  });

  it("blocks authors from editing active reviews and comments after moderation", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await db.collection("reviews").doc("active-review").set({
        placeId: "place-1",
        authorUid: "user-a",
        ratings: { noise: 2 },
        comment: "Text aprovat.",
        status: "active",
        createdAt: "2026-06-19T00:00:00.000Z"
      });
      await db.collection("comments").doc("active-comment").set({
        targetType: "place",
        targetId: "place-1",
        authorUid: "user-a",
        body: "Comentari aprovat.",
        status: "active",
        createdAt: "2026-06-19T00:00:00.000Z",
        updatedAt: "2026-06-19T00:00:00.000Z"
      });
    });

    const userDb = testEnv.authenticatedContext("user-a").firestore();

    await assertFails(
      userDb.collection("reviews").doc("active-review").update({
        comment: "Text canviat despres de moderacio.",
        status: "active"
      })
    );
    await assertFails(
      userDb.collection("comments").doc("active-comment").update({
        body: "Comentari canviat despres de moderacio.",
        status: "active",
        updatedAt: "2026-06-20T00:00:00.000Z"
      })
    );
  });

  it("still lets authors edit their own pending reviews and comments", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await db.collection("users").doc("user-a").set(activeUserDoc("user-a"));
      await db.collection("reviews").doc("pending-review").set({
        placeId: "place-1",
        authorUid: "user-a",
        ratings: { noise: 2 },
        comment: "Text pendent.",
        status: "pending",
        createdAt: "2026-06-19T00:00:00.000Z"
      });
      await db.collection("comments").doc("pending-comment").set({
        targetType: "place",
        targetId: "place-1",
        authorUid: "user-a",
        body: "Comentari pendent.",
        status: "pending",
        createdAt: "2026-06-19T00:00:00.000Z",
        updatedAt: "2026-06-19T00:00:00.000Z"
      });
    });

    const userDb = testEnv.authenticatedContext("user-a").firestore();

    await assertSucceeds(
      userDb.collection("reviews").doc("pending-review").update({
        comment: "Text pendent actualitzat.",
        status: "pending"
      })
    );
    await assertSucceeds(
      userDb.collection("comments").doc("pending-comment").update({
        body: "Comentari pendent actualitzat.",
        status: "pending",
        updatedAt: "2026-06-20T00:00:00.000Z"
      })
    );
  });

  it("keeps event history pending content private until moderation", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await db.collection("users").doc("user-a").set(activeUserDoc("user-a"));
      await db.collection("eventSeries").doc("active-series").set({
        title: "Festa Major",
        category: "festa_major",
        city: "Manresa",
        description: "",
        status: "active",
        createdBy: "admin-a",
        createdAt: "2027-08-01T00:00:00.000Z",
        updatedAt: "2027-08-01T00:00:00.000Z"
      });
      await db.collection("eventSeries").doc("pending-series").set({
        title: "Proposta Festa",
        category: "local_festival",
        city: "Manresa",
        description: "",
        status: "pending",
        createdBy: "user-a",
        createdAt: "2027-08-01T00:00:00.000Z",
        updatedAt: "2027-08-01T00:00:00.000Z"
      });
      await db.collection("eventExperiences").doc("pending-experience").set({
        eventSeriesId: "pending-series",
        eventEditionId: "edition-1",
        eventZoneId: "zone-1",
        authorUid: "user-a",
        observedAt: "2027-08-28T20:30:00.000Z",
        ratings: {
          noise: 4,
          crowd: 5,
          lighting: 3,
          waitingTime: 2,
          temperature: 4,
          perceivedSafety: 3,
          exitEase: 2
        },
        description: "Pendent.",
        photoPath: "event-experience-images/user-a/pending-experience/photo.png",
        status: "pending",
        createdAt: "2027-08-28T21:00:00.000Z",
        updatedAt: "2027-08-28T21:00:00.000Z"
      });
    });

    const anonDb = testEnv.unauthenticatedContext().firestore();
    const ownerDb = testEnv.authenticatedContext("user-a").firestore();
    const moderatorDb = testEnv.authenticatedContext("mod-a", { moderator: true }).firestore();

    await assertSucceeds(anonDb.collection("eventSeries").doc("active-series").get());
    await assertFails(anonDb.collection("eventSeries").doc("pending-series").get());
    await assertSucceeds(ownerDb.collection("eventSeries").doc("pending-series").get());
    await assertFails(anonDb.collection("eventExperiences").doc("pending-experience").get());
    await assertSucceeds(ownerDb.collection("eventExperiences").doc("pending-experience").get());
    await assertSucceeds(moderatorDb.collection("eventExperiences").doc("pending-experience").get());
  });

  it("forces user-created event experiences to start pending with their own photo path", async () => {
    await seedActiveUsers("user-a");
    const userDb = testEnv.authenticatedContext("user-a").firestore();

    await assertSucceeds(
      userDb.collection("eventExperiences").doc("experience-1").set({
        eventSeriesId: "series-1",
        eventEditionId: "edition-1",
        eventZoneId: "zone-1",
        authorUid: "user-a",
        observedAt: "2027-08-28T20:30:00.000Z",
        ratings: {
          noise: 4,
          crowd: 5,
          lighting: 3,
          waitingTime: 2,
          temperature: 4,
          perceivedSafety: 3,
          exitEase: 2
        },
        description: "La plaça estava plena.",
        photoPath: "event-experience-images/user-a/experience-1/photo.png",
        status: "pending",
        createdAt: "2027-08-28T21:00:00.000Z",
        updatedAt: "2027-08-28T21:00:00.000Z"
      })
    );

    await assertFails(
      userDb.collection("eventExperiences").doc("experience-2").set({
        eventSeriesId: "series-1",
        eventEditionId: "edition-1",
        eventZoneId: "zone-1",
        authorUid: "user-a",
        observedAt: "2027-08-28T20:30:00.000Z",
        ratings: {},
        description: "No ha de sortir activa directament.",
        photoPath: "event-experience-images/user-a/experience-2/photo.png",
        status: "active",
        createdAt: "2027-08-28T21:00:00.000Z",
        updatedAt: "2027-08-28T21:00:00.000Z"
      })
    );

    await assertFails(
      userDb.collection("eventExperiences").doc("experience-3").set({
        eventSeriesId: "series-1",
        eventEditionId: "edition-1",
        eventZoneId: "zone-1",
        authorUid: "user-a",
        observedAt: "2027-08-28T20:30:00.000Z",
        ratings: {},
        description: "Foto aliena.",
        photoPath: "event-experience-images/user-b/experience-3/photo.png",
        status: "pending",
        createdAt: "2027-08-28T21:00:00.000Z",
        updatedAt: "2027-08-28T21:00:00.000Z"
      })
    );
  });

  it("forces professional verification profiles to start pending", async () => {
    await seedActiveUsers("professional-a");
    const userDb = testEnv.authenticatedContext("professional-a").firestore();

    await assertSucceeds(
      userDb.collection("professionalProfiles").doc("professional-a").set({
        ownerUid: "professional-a",
        professionalName: "Test Professional",
        licenseNumber: "TEST 10001",
        professionalCollege: "Test Professional College",
        specialty: "Test specialty",
        verificationStatus: "pending_verification"
      })
    );

    await assertFails(
      userDb.collection("professionalProfiles").doc("professional-b").set({
        ownerUid: "professional-a",
        professionalName: "Second Test Professional",
        licenseNumber: "TEST 10002",
        professionalCollege: "Test Professional College",
        specialty: "Second test specialty",
        verificationStatus: "verified"
      })
    );
  });

  it("keeps pending verification profiles private until they are verified", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await db.collection("users").doc("professional-a").set(activeUserDoc("professional-a"));
      await db.collection("professionalProfiles").doc("pending-professional").set({
        ownerUid: "professional-a",
        professionalName: "Professional Pendent",
        licenseNumber: "TEST 20001",
        professionalCollege: "College",
        specialty: "Accessibility",
        verificationStatus: "pending_verification"
      });
      await db.collection("organizationProfiles").doc("verified-organization").set({
        ownerUid: "organization-a",
        name: "Entitat Verificada",
        description: "Descripcio publica.",
        city: "Barcelona",
        verificationStatus: "verified"
      });
    });

    const anonDb = testEnv.unauthenticatedContext().firestore();
    const ownerDb = testEnv.authenticatedContext("professional-a").firestore();

    await assertFails(anonDb.collection("professionalProfiles").doc("pending-professional").get());
    await assertSucceeds(ownerDb.collection("professionalProfiles").doc("pending-professional").get());
    await assertSucceeds(anonDb.collection("organizationProfiles").doc("verified-organization").get());
  });

  it("requires owner edits to verified profiles to return to pending verification", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("users").doc("professional-a").set(activeUserDoc("professional-a"));
      await context.firestore().collection("professionalProfiles").doc("verified-professional").set({
        ownerUid: "professional-a",
        professionalName: "Professional Verificat",
        licenseNumber: "TEST 30001",
        professionalCollege: "College",
        specialty: "Accessibility",
        verificationStatus: "verified"
      });
    });

    const ownerDb = testEnv.authenticatedContext("professional-a").firestore();

    await assertFails(
      ownerDb.collection("professionalProfiles").doc("verified-professional").update({
        specialty: "Changed after approval",
        verificationStatus: "verified"
      })
    );
    await assertSucceeds(
      ownerDb.collection("professionalProfiles").doc("verified-professional").update({
        specialty: "Changed for re-review",
        verificationStatus: "pending_verification"
      })
    );
  });

  it("publishes professional and organization media only for verified profile paths", async () => {
    const imageDataUrl =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=";

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await db.collection("users").doc("professional-a").set(activeUserDoc("professional-a"));
      await db.collection("professionalProfiles").doc("verified-professional").set({
        ownerUid: "professional-a",
        professionalName: "Professional Verificat",
        licenseNumber: "TEST 40001",
        professionalCollege: "College",
        specialty: "Accessibility",
        verificationStatus: "verified"
      });
      await db.collection("professionalProfiles").doc("pending-professional").set({
        ownerUid: "professional-a",
        professionalName: "Professional Pendent",
        licenseNumber: "TEST 40002",
        professionalCollege: "College",
        specialty: "Accessibility",
        verificationStatus: "pending_verification"
      });
      await db.collection("organizationProfiles").doc("verified-organization").set({
        ownerUid: "organization-a",
        name: "Entitat Verificada",
        description: "Descripcio publica.",
        city: "Barcelona",
        verificationStatus: "verified"
      });

      const storage = context.storage();
      await storage.ref("professional-photos/professional-a/verified-professional/headshot.png").putString(imageDataUrl, "data_url");
      await storage.ref("professional-photos/professional-a/pending-professional/headshot.png").putString(imageDataUrl, "data_url");
      await storage.ref("professional-photos/professional-a/legacy-headshot.png").putString(imageDataUrl, "data_url");
      await storage.ref("organization-logos/organization-a/verified-organization/logo.png").putString(imageDataUrl, "data_url");
    });

    const anonStorage = testEnv.unauthenticatedContext().storage();
    const ownerStorage = testEnv.authenticatedContext("professional-a").storage();

    await assertSucceeds(
      anonStorage.ref("professional-photos/professional-a/verified-professional/headshot.png").getDownloadURL()
    );
    await assertFails(
      anonStorage.ref("professional-photos/professional-a/pending-professional/headshot.png").getDownloadURL()
    );
    await assertFails(anonStorage.ref("professional-photos/professional-a/legacy-headshot.png").getDownloadURL());
    await assertSucceeds(ownerStorage.ref("professional-photos/professional-a/pending-professional/headshot.png").getDownloadURL());
    await assertSucceeds(
      anonStorage.ref("organization-logos/organization-a/verified-organization/logo.png").getDownloadURL()
    );
  });

  it("publishes event experience photos only after the experience is active", async () => {
    const imageDataUrl =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=";

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await db.collection("eventExperiences").doc("active-experience").set({
        authorUid: "user-a",
        status: "active",
        photoPath: "event-experience-images/user-a/active-experience/photo.png"
      });
      await db.collection("eventExperiences").doc("pending-experience").set({
        authorUid: "user-a",
        status: "pending",
        photoPath: "event-experience-images/user-a/pending-experience/photo.png"
      });

      const storage = context.storage();
      await storage.ref("event-experience-images/user-a/active-experience/photo.png").putString(imageDataUrl, "data_url");
      await storage.ref("event-experience-images/user-a/pending-experience/photo.png").putString(imageDataUrl, "data_url");
    });

    const anonStorage = testEnv.unauthenticatedContext().storage();
    const ownerStorage = testEnv.authenticatedContext("user-a").storage();
    const moderatorStorage = testEnv.authenticatedContext("mod-a", { moderator: true }).storage();

    await assertSucceeds(
      anonStorage.ref("event-experience-images/user-a/active-experience/photo.png").getDownloadURL()
    );
    await assertFails(
      anonStorage.ref("event-experience-images/user-a/pending-experience/photo.png").getDownloadURL()
    );
    await assertFails(
      ownerStorage.ref("event-experience-images/user-a/pending-experience/photo.png").getDownloadURL()
    );
    await assertSucceeds(
      moderatorStorage.ref("event-experience-images/user-a/pending-experience/photo.png").getDownloadURL()
    );
  });

  it("blocks non-admins from admin action writes", async () => {
    const userDb = testEnv.authenticatedContext("user-a").firestore();
    await assertFails(
      userDb.collection("adminActions").add({
        action: "verification_status_changed",
        createdAt: "2026-06-19T00:00:00.000Z"
      })
    );
  });

  it("allows admins to write admin actions", async () => {
    const adminDb = testEnv.authenticatedContext("admin-a", { admin: true }).firestore();
    const result = await assertSucceeds(
      adminDb.collection("adminActions").add({
        action: "verification_status_changed",
        createdAt: "2026-06-19T00:00:00.000Z"
      })
    );
    expect(result.id).toBeTruthy();
  });
});
