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
    }
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe("Firestore security rules", () => {
  it("allows base user creation without elevated roles", async () => {
    const userDb = testEnv.authenticatedContext("user-a").firestore();

    await assertSucceeds(
      userDb.collection("users").doc("user-a").set({
        uid: "user-a",
        displayName: "Josep Baro",
        publicName: "Josep",
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
        displayName: "Josep Baro",
        publicName: "Josep",
        authProviders: ["password"],
        roles: ["user", "professional", "admin"],
        status: "active",
        locale: "ca",
        createdAt: "2026-06-20T00:00:00.000Z",
        updatedAt: "2026-06-20T00:00:00.000Z"
      })
    );
  });

  it("lets public users read active places only", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("places").doc("active").set({
        status: "active",
        name: "Biblioteca",
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

  it("lets tutors manage only their own child profiles", async () => {
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

  it("forces professional verification profiles to start pending", async () => {
    const userDb = testEnv.authenticatedContext("professional-a").firestore();

    await assertSucceeds(
      userDb.collection("professionalProfiles").doc("professional-a").set({
        ownerUid: "professional-a",
        professionalName: "Marta Gomez",
        licenseNumber: "COPC 47145",
        professionalCollege: "Col.legi Oficial de Psicologia de Catalunya",
        specialty: "Autisme adult",
        verificationStatus: "pending_verification"
      })
    );

    await assertFails(
      userDb.collection("professionalProfiles").doc("professional-b").set({
        ownerUid: "professional-a",
        professionalName: "Pau Ferrer",
        licenseNumber: "COPC 50218",
        professionalCollege: "Col.legi Oficial de Psicologia de Catalunya",
        specialty: "Infancia",
        verificationStatus: "verified"
      })
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
