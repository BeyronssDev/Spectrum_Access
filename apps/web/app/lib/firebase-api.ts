import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut,
  updateProfile,
  type User
} from "firebase/auth";
import { collection, doc, getDoc, getDocs, getFirestore, limit, query, where } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import type { AppUser, AuthProviderId, DiscoveredPlace, EventHistorySearchResult, Locale, Place } from "@accessibilitat/shared";
import type {
  AccessibilitatApi,
  CompleteUserOnboardingInput,
  CreateChildProfileInput,
  CreateEventEditionInput,
  CreateEventSeriesInput,
  CreateEventZoneInput,
  CreatePlaceInput,
  CreateReportInput,
  OrganizationVerificationInput,
  ProfessionalVerificationInput,
  ResolvePlaceForContributionInput,
  SearchEventHistoryInput,
  SearchNearbyPlacesInput,
  SubmitCommentInput,
  SubmitEventExperienceInput,
  SubmitReviewInput
} from "./accessibilitat-api";
import { requireFirebaseApp } from "./firebase";
import { mapPlaceDocument } from "./firebase-place-mappers";

const functionsRegion = "europe-west1";
const federatedRedirectStorageKey = "spectrum-access:federated-redirect:v1";

type PendingFederatedRedirect = {
  providerId: AuthProviderId;
  locale: Locale;
  birthDate?: string;
  createdAt: number;
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

function isFirebasePermissionDenied(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "permission-denied"
  );
}

function makeFederatedProvider(providerId: AuthProviderId): GoogleAuthProvider | OAuthProvider {
  if (providerId === "google.com") {
    return new GoogleAuthProvider();
  }

  if (providerId === "apple.com") {
    const provider = new OAuthProvider("apple.com");
    provider.addScope("email");
    provider.addScope("name");
    return provider;
  }

  throw new Error("unsupported-federated-provider");
}

function readPendingFederatedRedirect(): PendingFederatedRedirect | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(federatedRedirectStorageKey);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<PendingFederatedRedirect>;
    if (
      (parsed.providerId !== "google.com" && parsed.providerId !== "apple.com") ||
      (parsed.locale !== "ca" && parsed.locale !== "es" && parsed.locale !== "en") ||
      typeof parsed.createdAt !== "number"
    ) {
      window.sessionStorage.removeItem(federatedRedirectStorageKey);
      return null;
    }

    return {
      providerId: parsed.providerId,
      locale: parsed.locale,
      ...(typeof parsed.birthDate === "string" ? { birthDate: parsed.birthDate } : {}),
      createdAt: parsed.createdAt
    };
  } catch {
    window.sessionStorage.removeItem(federatedRedirectStorageKey);
    return null;
  }
}

function savePendingFederatedRedirect(input: { providerId: AuthProviderId; locale: Locale; birthDate?: string }) {
  if (typeof window === "undefined") {
    return;
  }

  const pending: PendingFederatedRedirect = {
    providerId: input.providerId,
    locale: input.locale,
    ...(input.birthDate ? { birthDate: input.birthDate } : {}),
    createdAt: Date.now()
  };
  window.sessionStorage.setItem(federatedRedirectStorageKey, JSON.stringify(pending));
}

function clearPendingFederatedRedirect() {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(federatedRedirectStorageKey);
  }
}

async function finishPendingFederatedRedirect(user: User): Promise<boolean> {
  const pending = readPendingFederatedRedirect();
  if (!pending || Date.now() - pending.createdAt > 30 * 60 * 1000) {
    clearPendingFederatedRedirect();
    return false;
  }

  if (!pending.birthDate) {
    return false;
  }

  await finishAuthOnboarding({
    user,
    locale: pending.locale,
    fallbackProvider: pending.providerId,
    birthDate: pending.birthDate
  });
  clearPendingFederatedRedirect();
  return true;
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

async function searchEventHistory(input: SearchEventHistoryInput) {
  const callable = getCallable<SearchEventHistoryInput, EventHistorySearchResult>("searchEventHistory");
  return callable(input);
}

async function createEventSeries(input: CreateEventSeriesInput) {
  const callable = getCallable<CreateEventSeriesInput, { eventSeriesId: string; status: "pending" | "active" }>(
    "createEventSeries"
  );
  return callable(input);
}

async function createEventEdition(input: CreateEventEditionInput) {
  const callable = getCallable<CreateEventEditionInput, { eventEditionId: string; status: "pending" | "active" }>(
    "createEventEdition"
  );
  return callable(input);
}

async function createEventZone(input: CreateEventZoneInput) {
  const callable = getCallable<CreateEventZoneInput, { eventZoneId: string; status: "pending" | "active" }>(
    "createEventZone"
  );
  return callable(input);
}

async function submitEventExperience(input: SubmitEventExperienceInput) {
  const callable = getCallable<SubmitEventExperienceInput, { eventExperienceId: string; status: "pending" }>(
    "submitEventExperience"
  );
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

async function requestOrganizationVerification(input: OrganizationVerificationInput) {
  const callable = getCallable<
    OrganizationVerificationInput,
    { profileId: string; verificationRequestId: string; status: "pending_verification" }
  >("requestOrganizationVerification");
  return callable(input);
}

async function readCurrentAppUser(): Promise<AppUser | null> {
  const app = requireFirebaseApp();
  const authUser = getAuth(app).currentUser;
  if (!authUser) {
    return null;
  }

  const userRef = doc(getFirestore(app), "users", authUser.uid);
  const readProfile = async () => {
    const snapshot = await getDoc(userRef);
    return snapshot.exists() ? (snapshot.data() as AppUser) : null;
  };

  try {
    const profile = await readProfile();
    if (profile) {
      return profile;
    }

    return (await finishPendingFederatedRedirect(authUser)) ? readProfile() : null;
  } catch (error) {
    if (isFirebasePermissionDenied(error)) {
      return (await finishPendingFederatedRedirect(authUser)) ? readProfile() : null;
    }

    throw error;
  }
}

function subscribeToAuthState(callback: (user: User | null) => void) {
  const app = requireFirebaseApp();
  const auth = getAuth(app);
  let active = true;
  void getRedirectResult(auth)
    .then(async (credential) => {
      if (!active || !credential?.user) {
        return;
      }

      try {
        await finishPendingFederatedRedirect(credential.user);
      } catch {
        // Leave the pending redirect in storage so the profile read path can retry once auth state settles.
      }

      if (active) {
        callback(credential.user);
      }
    })
    .catch(() => undefined);
  const unsubscribe = onAuthStateChanged(auth, callback);
  return () => {
    active = false;
    unsubscribe();
  };
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

async function finishAuthOnboarding(input: {
  user: User;
  locale: Locale;
  fallbackProvider: AuthProviderId;
  city?: string;
  birthDate?: string;
}) {
  const { user, locale, fallbackProvider, city, birthDate } = input;
  const publicName = fallbackPublicName(user);
  await completeUserOnboarding({
    publicName,
    displayName: user.displayName ?? publicName,
    email: user.email ?? undefined,
    city: city?.trim() || undefined,
    locale,
    authProviders: providerIds(user, fallbackProvider),
    ...(birthDate ? { birthDate } : {})
  });
}

async function finishFederatedAuth(user: User, locale: Locale, fallbackProvider: AuthProviderId, birthDate?: string) {
  const existingProfile = await readCurrentAppUser();
  if (existingProfile) {
    return { status: "complete" as const, user };
  }

  if (!birthDate) {
    return { status: "age_gate_required" as const, user, providerId: fallbackProvider };
  }

  await finishAuthOnboarding({ user, locale, fallbackProvider, birthDate });
  return { status: "complete" as const, user };
}

async function registerWithEmailPassword(input: {
  email: string;
  password: string;
  publicName: string;
  birthDate: string;
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
    authProviders: ["password"],
    birthDate: input.birthDate
  });
  return credential.user;
}

async function loginWithEmailPassword(input: { email: string; password: string; locale: Locale }) {
  const app = requireFirebaseApp();
  const credential = await signInWithEmailAndPassword(getAuth(app), input.email, input.password);
  const existingProfile = await readCurrentAppUser();
  if (!existingProfile) {
    await finishAuthOnboarding({ user: credential.user, locale: input.locale, fallbackProvider: "password" });
  }
  return credential.user;
}

async function requestPasswordReset(input: { email: string; locale: Locale }) {
  const callable = getCallable<{ email: string; locale: Locale }, { status: "accepted" }>("requestPasswordReset");
  await callable({ email: input.email.trim(), locale: input.locale });
}

async function startFederatedRedirect(input: { providerId: AuthProviderId; locale: Locale; birthDate?: string }) {
  const app = requireFirebaseApp();
  savePendingFederatedRedirect(input);
  await signInWithRedirect(getAuth(app), makeFederatedProvider(input.providerId));
  return { status: "redirect_started" as const, providerId: input.providerId };
}

async function loginWithGoogle(input: { locale: Locale; birthDate?: string }) {
  return startFederatedRedirect({ providerId: "google.com", locale: input.locale, birthDate: input.birthDate });
}

async function loginWithApple(input: { locale: Locale; birthDate?: string }) {
  return startFederatedRedirect({ providerId: "apple.com", locale: input.locale, birthDate: input.birthDate });
}

async function completeFederatedAgeGate(input: { locale: Locale; providerId: AuthProviderId; birthDate: string }) {
  const app = requireFirebaseApp();
  const user = getAuth(app).currentUser;
  if (!user) {
    throw new Error("auth-required");
  }

  await finishAuthOnboarding({
    user,
    locale: input.locale,
    fallbackProvider: input.providerId,
    birthDate: input.birthDate
  });
  return user;
}

async function cancelFederatedAgeGate() {
  await logout();
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

async function uploadEventExperiencePhoto(experienceId: string, file: File) {
  const app = requireFirebaseApp();
  const uid = requireSignedInUid();
  const storagePath = `event-experience-images/${uid}/${experienceId}/${file.name}`;
  await uploadBytes(ref(getStorage(app), storagePath), file, { contentType: file.type });
  return storagePath;
}

async function readStorageDownloadUrl(path: string) {
  const app = requireFirebaseApp();
  return getDownloadURL(ref(getStorage(app), path));
}

export function createFirebaseAccessibilitatApi(): AccessibilitatApi {
  return {
    listActivePlaces,
    searchNearbyPlaces,
    searchEventHistory,
    createPlace,
    createEventSeries,
    createEventEdition,
    createEventZone,
    submitEventExperience,
    resolvePlaceForContribution,
    submitReview,
    submitComment,
    createReport,
    createChildProfile,
    completeUserOnboarding,
    requestProfessionalVerification,
    requestOrganizationVerification,
    readCurrentAppUser,
    subscribeToAuthState,
    registerWithEmailPassword,
    loginWithEmailPassword,
    requestPasswordReset,
    loginWithGoogle,
    loginWithApple,
    completeFederatedAgeGate,
    cancelFederatedAgeGate,
    logout,
    uploadPlaceImage,
    uploadEventExperiencePhoto,
    readStorageDownloadUrl
  };
}

export const firebaseApi = createFirebaseAccessibilitatApi();
