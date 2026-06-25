import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User
} from "firebase/auth";
import { collection, doc, getDoc, getDocs, getFirestore, limit, query, where } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import type { AppUser, AuthProviderId, DiscoveredPlace, Locale, Place } from "@accessibilitat/shared";
import type {
  AccessibilitatApi,
  CompleteUserOnboardingInput,
  CreateChildProfileInput,
  CreatePlaceInput,
  CreateReportInput,
  ProfessionalVerificationInput,
  ResolvePlaceForContributionInput,
  SearchNearbyPlacesInput,
  SubmitCommentInput,
  SubmitReviewInput
} from "./accessibilitat-api";
import { requireFirebaseApp } from "./firebase";
import { mapPlaceDocument } from "./firebase-place-mappers";

const functionsRegion = "europe-west1";

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

async function listActivePlaces(): Promise<Place[]> {
  const app = requireFirebaseApp();
  const snapshot = await getDocs(
    query(collection(getFirestore(app), "places"), where("status", "==", "active"), limit(50))
  );

  return snapshot.docs.map((doc) => mapPlaceDocument(doc.id, doc.data()));
}

async function createPlace(input: CreatePlaceInput) {
  const callable = getCallable<CreatePlaceInput, { placeId: string; status: "pending" }>("createPlace");
  return callable(input);
}

async function searchNearbyPlaces(input: SearchNearbyPlacesInput) {
  const callable = getCallable<SearchNearbyPlacesInput, { places: DiscoveredPlace[] } | DiscoveredPlace[]>("searchNearbyPlaces");
  return callable(input);
}

async function resolvePlaceForContribution(input: ResolvePlaceForContributionInput) {
  const callable = getCallable<
    ResolvePlaceForContributionInput,
    { placeId: string; status: "pending" | "active" | "hidden" | "deleted" | "rejected" | "suspended" }
  >("resolvePlaceForContribution");
  return callable(input);
}

async function submitReview(input: SubmitReviewInput) {
  const callable = getCallable<SubmitReviewInput, { reviewId: string; status: "pending" }>("submitReview");
  return callable(input);
}

async function submitComment(input: SubmitCommentInput) {
  const callable = getCallable<SubmitCommentInput, { commentId: string; status: "pending" }>("submitComment");
  return callable(input);
}

async function createReport(input: CreateReportInput) {
  const callable = getCallable<CreateReportInput, { reportId: string; status: "open" }>("createReport");
  return callable(input);
}

async function createChildProfile(input: CreateChildProfileInput) {
  const callable = getCallable<CreateChildProfileInput, { childProfileId: string }>("createChildProfile");
  return callable(input);
}

async function completeUserOnboarding(input: CompleteUserOnboardingInput) {
  const callable = getCallable<CompleteUserOnboardingInput, { uid: string; status: "active"; roles: string[] }>(
    "completeUserOnboarding"
  );
  return callable(input);
}

async function requestProfessionalVerification(input: ProfessionalVerificationInput) {
  const callable = getCallable<
    ProfessionalVerificationInput,
    { profileId: string; verificationRequestId: string; status: "pending_verification" }
  >("requestProfessionalVerification");
  return callable(input);
}

async function readCurrentAppUser(): Promise<AppUser | null> {
  const app = requireFirebaseApp();
  const authUser = getAuth(app).currentUser;
  if (!authUser) {
    return null;
  }

  const snapshot = await getDoc(doc(getFirestore(app), "users", authUser.uid));
  return snapshot.exists() ? (snapshot.data() as AppUser) : null;
}

function subscribeToAuthState(callback: (user: User | null) => void) {
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

async function registerWithEmailPassword(input: {
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

async function loginWithEmailPassword(input: { email: string; password: string; locale: Locale }) {
  const app = requireFirebaseApp();
  const credential = await signInWithEmailAndPassword(getAuth(app), input.email, input.password);
  await finishAuthOnboarding(credential.user, input.locale, "password");
  return credential.user;
}

async function requestPasswordReset(input: { email: string; locale: Locale }) {
  const app = requireFirebaseApp();
  const auth = getAuth(app);
  auth.languageCode = input.locale;

  try {
    await sendPasswordResetEmail(auth, input.email.trim());
  } catch (error) {
    if ((error as { code?: string }).code === "auth/user-not-found") {
      return;
    }

    throw error;
  }
}

async function loginWithGoogle(locale: Locale) {
  const app = requireFirebaseApp();
  const credential = await signInWithPopup(getAuth(app), new GoogleAuthProvider());
  await finishAuthOnboarding(credential.user, locale, "google.com");
  return credential.user;
}

async function loginWithApple(locale: Locale) {
  const app = requireFirebaseApp();
  const provider = new OAuthProvider("apple.com");
  provider.addScope("email");
  provider.addScope("name");
  const credential = await signInWithPopup(getAuth(app), provider);
  await finishAuthOnboarding(credential.user, locale, "apple.com");
  return credential.user;
}

async function logout() {
  const app = requireFirebaseApp();
  await signOut(getAuth(app));
}

async function uploadPlaceImage(placeId: string, file: File, altText?: Record<string, string>) {
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

export function createFirebaseAccessibilitatApi(): AccessibilitatApi {
  return {
    listActivePlaces,
    searchNearbyPlaces,
    createPlace,
    resolvePlaceForContribution,
    submitReview,
    submitComment,
    createReport,
    createChildProfile,
    completeUserOnboarding,
    requestProfessionalVerification,
    readCurrentAppUser,
    subscribeToAuthState,
    registerWithEmailPassword,
    loginWithEmailPassword,
    requestPasswordReset,
    loginWithGoogle,
    loginWithApple,
    logout,
    uploadPlaceImage
  };
}

export const firebaseApi = createFirebaseAccessibilitatApi();
