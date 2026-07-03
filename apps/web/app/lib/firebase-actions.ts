import { firebaseApi } from "./firebase-api";

export type {
  CompleteUserOnboardingInput,
  CreateChildProfileInput,
  CreateEventEditionInput,
  CreateEventSeriesInput,
  CreateEventZoneInput,
  CreatePlaceInput,
  CreateReportInput,
  FederatedAuthResult,
  OrganizationVerificationInput,
  ProfessionalVerificationInput,
  SearchEventHistoryInput,
  SubmitCommentInput,
  SubmitEventExperienceInput,
  SubmitReviewInput
} from "./accessibilitat-api";
export { firebaseApi };

export const listActivePlaces = firebaseApi.listActivePlaces;
export const searchNearbyPlaces = firebaseApi.searchNearbyPlaces;
export const searchEventHistory = firebaseApi.searchEventHistory;
export const createPlace = firebaseApi.createPlace;
export const createEventSeries = firebaseApi.createEventSeries;
export const createEventEdition = firebaseApi.createEventEdition;
export const createEventZone = firebaseApi.createEventZone;
export const submitEventExperience = firebaseApi.submitEventExperience;
export const resolvePlaceForContribution = firebaseApi.resolvePlaceForContribution;
export const submitReview = firebaseApi.submitReview;
export const submitComment = firebaseApi.submitComment;
export const createReport = firebaseApi.createReport;
export const createChildProfile = firebaseApi.createChildProfile;
export const completeUserOnboarding = firebaseApi.completeUserOnboarding;
export const requestProfessionalVerification = firebaseApi.requestProfessionalVerification;
export const requestOrganizationVerification = firebaseApi.requestOrganizationVerification;
export const readCurrentAppUser = firebaseApi.readCurrentAppUser;
export const subscribeToAuthState = firebaseApi.subscribeToAuthState;
export const registerWithEmailPassword = firebaseApi.registerWithEmailPassword;
export const loginWithEmailPassword = firebaseApi.loginWithEmailPassword;
export const requestPasswordReset = firebaseApi.requestPasswordReset;
export const loginWithGoogle = firebaseApi.loginWithGoogle;
export const loginWithApple = firebaseApi.loginWithApple;
export const completeFederatedAgeGate = firebaseApi.completeFederatedAgeGate;
export const cancelFederatedAgeGate = firebaseApi.cancelFederatedAgeGate;
export const logout = firebaseApi.logout;
export const uploadPlaceImage = firebaseApi.uploadPlaceImage;
export const uploadEventExperiencePhoto = firebaseApi.uploadEventExperiencePhoto;
export const readStorageDownloadUrl = firebaseApi.readStorageDownloadUrl;
