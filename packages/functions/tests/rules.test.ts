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
    projectId: "demo-accessibilitat-sensorial",
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

    await assertFails(otherDb.collection("childProfiles").doc("child-a").get());
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
