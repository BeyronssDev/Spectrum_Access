import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  query,
  where,
  type DocumentData
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import type { AppUser, AuthProviderId, Locale, Place, SensoryRating } from "@accessibilitat/shared";
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

export type CompleteUserOnboardingInput = {
  publicName: string;
  displayName?: string;
  email?: string;
  city?: string;
  locale: Locale;
  authProviders: AuthProviderId[];
};

export type ProfessionalVerificationInput = {
  professionalName: string;
  licenseNumber: string;
  professionalCollege: string;
  specialty: string;
  photoPath?: string;
  evidencePath?: string;
  note?: string;
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

export async function completeUserOnboarding(input: CompleteUserOnboardingInput) {
  const callable = getCallable<CompleteUserOnboardingInput, { uid: string; status: "active"; roles: string[] }>(
    "completeUserOnboarding"
  );
  return callable(input);
}

export async function requestProfessionalVerification(input: ProfessionalVerificationInput) {
  const callable = getCallable<
    ProfessionalVerificationInput,
    { profileId: string; verificationRequestId: string; status: "pending_verification" }
  >("requestProfessionalVerification");
  return callable(input);
}

export async function readCurrentAppUser(): Promise<AppUser | null> {
  const app = requireFirebaseApp();
  const authUser = getAuth(app).currentUser;
  if (!authUser) {
    return null;
  }

  const snapshot = await getDoc(doc(getFirestore(app), "users", authUser.uid));
  return snapshot.exists() ? (snapshot.data() as AppUser) : null;
}

export function subscribeToAuthState(callback: (user: User | null) => void) {
  const app = requireFirebaseApp();
  return onAuthStateChanged(getAuth(app), callback);
}

function fallbackPublicName(user: User): string {
  if (user.displayName?.trim()) {
    return user.displayName.trim();
  }

  const emailName = user.email?.split("@")[0]?.trim();
  return emailName || "Spectrum user";
}

function providerIds(user: User, fallback: AuthProviderId): AuthProviderId[] {
  const ids = user.providerData
    .map((provider) => provider.providerId)
    .filter((provider): provider is AuthProviderId =>
      provider === "password" || provider === "google.com" || provider === "apple.com"
    );

  return ids.length > 0 ? Array.from(new Set(ids)) : [fallback];
}

async function finishAuthOnboarding(user: User, locale: Locale, fallbackProvider: AuthProviderId, city?: string) {
  const publicName = fallbackPublicName(user);
  await completeUserOnboarding({
    publicName,
    displayName: user.displayName ?? publicName,
    email: user.email ?? undefined,
    city: city?.trim() || undefined,
    locale,
    authProviders: providerIds(user, fallbackProvider)
  });
}

export async function registerWithEmailPassword(input: {
  email: string;
  password: string;
  publicName: string;
  city?: string;
  locale: Locale;
}) {
  const app = requireFirebaseApp();
  const credential = await createUserWithEmailAndPassword(getAuth(app), input.email, input.password);
  await updateProfile(credential.user, { displayName: input.publicName });
  await sendEmailVerification(credential.user);
  await completeUserOnboarding({
    publicName: input.publicName,
    displayName: input.publicName,
    email: credential.user.email ?? input.email,
    city: input.city?.trim() || undefined,
    locale: input.locale,
    authProviders: ["password"]
  });
  return credential.user;
}

export async function loginWithEmailPassword(input: { email: string; password: string; locale: Locale }) {
  const app = requireFirebaseApp();
  const credential = await signInWithEmailAndPassword(getAuth(app), input.email, input.password);
  await finishAuthOnboarding(credential.user, input.locale, "password");
  return credential.user;
}

export async function loginWithGoogle(locale: Locale) {
  const app = requireFirebaseApp();
  const credential = await signInWithPopup(getAuth(app), new GoogleAuthProvider());
  await finishAuthOnboarding(credential.user, locale, "google.com");
  return credential.user;
}

export async function loginWithApple(locale: Locale) {
  const app = requireFirebaseApp();
  const provider = new OAuthProvider("apple.com");
  provider.addScope("email");
  provider.addScope("name");
  const credential = await signInWithPopup(getAuth(app), provider);
  await finishAuthOnboarding(credential.user, locale, "apple.com");
  return credential.user;
}

export async function logout() {
  const app = requireFirebaseApp();
  await signOut(getAuth(app));
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
