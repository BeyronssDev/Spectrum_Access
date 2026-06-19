import { getAuth } from "firebase/auth";
import {
  collection,
  getDocs,
  getFirestore,
  limit,
  query,
  where,
  type DocumentData
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import type { Place, SensoryRating } from "@accessibilitat/shared";
import { requireFirebaseApp } from "./firebase";

const functionsRegion = "europe-west1";

export type CreatePlaceInput = {
  name: string;
  category: string;
  city: string;
  addressOrArea: string;
  description?: string;
  latitude: number;
  longitude: number;
};

export type SubmitReviewInput = {
  placeId: string;
  ratings: SensoryRating;
  comment?: string;
  childProfileId?: string;
};

export type SubmitCommentInput = {
  targetType: "place" | "review";
  targetId: string;
  placeId?: string;
  body: string;
};

export type CreateReportInput = {
  targetType: "place" | "review" | "comment" | "image" | "professional" | "organization";
  targetId: string;
  reason: string;
};

export type CreateChildProfileInput = {
  alias: string;
  ageRange?: "0-5" | "6-9" | "10-13" | "14-17";
  sensoryPreferences?: Record<string, "low" | "medium" | "high">;
};

function getCallable<TInput, TOutput>(name: string) {
  const app = requireFirebaseApp();
  return httpsCallable<TInput, TOutput>(getFunctions(app, functionsRegion), name);
}

function requireSignedInUid(): string {
  const app = requireFirebaseApp();
  const user = getAuth(app).currentUser;
  if (!user) {
    throw new Error("auth-required");
  }

  return user.uid;
}

function mapPlaceDocument(id: string, data: DocumentData): Place {
  return {
    id,
    name: String(data.name ?? ""),
    category: data.category,
    city: String(data.city ?? ""),
    addressOrArea: String(data.addressOrArea ?? ""),
    description: String(data.description ?? ""),
    position: {
      latitude: Number(data.position?.latitude ?? 41.3851),
      longitude: Number(data.position?.longitude ?? 2.1734)
    },
    status: data.status,
    createdBy: String(data.createdBy ?? ""),
    ratingCount: Number(data.ratingCount ?? 0),
    imageCount: Number(data.imageCount ?? 0),
    averageScore: Number(data.averageScore ?? 0),
    updatedAt: String(data.updatedAt ?? "")
  };
}

export async function listActivePlaces(): Promise<Place[]> {
  const app = requireFirebaseApp();
  const snapshot = await getDocs(
    query(collection(getFirestore(app), "places"), where("status", "==", "active"), limit(50))
  );

  return snapshot.docs.map((doc) => mapPlaceDocument(doc.id, doc.data()));
}

export async function createPlace(input: CreatePlaceInput) {
  const callable = getCallable<CreatePlaceInput, { placeId: string; status: "pending" }>("createPlace");
  return callable(input);
}

export async function submitReview(input: SubmitReviewInput) {
  const callable = getCallable<SubmitReviewInput, { reviewId: string; status: "pending" }>("submitReview");
  return callable(input);
}

export async function submitComment(input: SubmitCommentInput) {
  const callable = getCallable<SubmitCommentInput, { commentId: string; status: "pending" }>("submitComment");
  return callable(input);
}

export async function createReport(input: CreateReportInput) {
  const callable = getCallable<CreateReportInput, { reportId: string; status: "open" }>("createReport");
  return callable(input);
}

export async function createChildProfile(input: CreateChildProfileInput) {
  const callable = getCallable<CreateChildProfileInput, { childProfileId: string }>("createChildProfile");
  return callable(input);
}

export async function uploadPlaceImage(placeId: string, file: File, altText?: Record<string, string>) {
  const app = requireFirebaseApp();
  const uid = requireSignedInUid();
  const imageId = crypto.randomUUID();
  const storagePath = `place-images/${uid}/${imageId}/${file.name}`;
  const fileRef = ref(getStorage(app), storagePath);
  await uploadBytes(fileRef, file, { contentType: file.type });

  const callable = getCallable<
    { placeId: string; storagePath: string; altText?: Record<string, string> },
    { imageId: string; status: "pending" }
  >("createPlaceImageRecord");

  return callable({ placeId, storagePath, altText });
}
