import { firebaseApi } from "./firebase-api";

export type {
  CompleteUserOnboardingInput,
  CreateChildProfileInput,
  CreatePlaceInput,
  CreateReportInput,
  ProfessionalVerificationInput,
  SubmitCommentInput,
  SubmitReviewInput
} from "./accessibilitat-api";
export { firebaseApi };

export const listActivePlaces = firebaseApi.listActivePlaces;
export const createPlace = firebaseApi.createPlace;
export const submitReview = firebaseApi.submitReview;
export const submitComment = firebaseApi.submitComment;
export const createReport = firebaseApi.createReport;
export const createChildProfile = firebaseApi.createChildProfile;
export const completeUserOnboarding = firebaseApi.completeUserOnboarding;
export const requestProfessionalVerification = firebaseApi.requestProfessionalVerification;
export const readCurrentAppUser = firebaseApi.readCurrentAppUser;
export const subscribeToAuthState = firebaseApi.subscribeToAuthState;
export const registerWithEmailPassword = firebaseApi.registerWithEmailPassword;
export const loginWithEmailPassword = firebaseApi.loginWithEmailPassword;
export const loginWithGoogle = firebaseApi.loginWithGoogle;
export const loginWithApple = firebaseApi.loginWithApple;
export const logout = firebaseApi.logout;
export const uploadPlaceImage = firebaseApi.uploadPlaceImage;
