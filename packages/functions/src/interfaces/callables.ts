import { onCall, type CallableRequest } from "firebase-functions/v2/https";
import { callableOptions, useCases } from "../composition/container.js";
import { requireAuth, requireModerator, requireSuperAdmin, toHttpsError, toRequestContext } from "./callable-auth.js";

function authedCallable(handler: (request: CallableRequest<unknown>) => Promise<unknown>) {
  return onCall(callableOptions, async (request) => {
    try {
      return await handler(request);
    } catch (error) {
      throw toHttpsError(error);
    }
  });
}

function publicCallable(handler: (request: CallableRequest<unknown>) => Promise<unknown>) {
  return onCall(callableOptions, async (request) => {
    try {
      return await handler(request);
    } catch (error) {
      throw toHttpsError(error);
    }
  });
}

export const searchNearbyPlaces = publicCallable(async (request) => {
  return useCases.searchNearbyPlaces(request.data);
});

export const completeUserOnboarding = authedCallable(async (request) => {
  const authedRequest = requireAuth(request);
  return useCases.completeUserOnboarding(toRequestContext(authedRequest), request.data);
});

export const createPlace = authedCallable(async (request) => {
  const authedRequest = requireAuth(request);
  return useCases.createPlace(toRequestContext(authedRequest), request.data);
});

export const resolvePlaceForContribution = authedCallable(async (request) => {
  const authedRequest = requireAuth(request);
  return useCases.resolvePlaceForContribution(toRequestContext(authedRequest), request.data);
});

export const submitReview = authedCallable(async (request) => {
  const authedRequest = requireAuth(request);
  return useCases.submitReview(toRequestContext(authedRequest), request.data);
});

export const submitComment = authedCallable(async (request) => {
  const authedRequest = requireAuth(request);
  return useCases.submitComment(toRequestContext(authedRequest), request.data);
});

export const createPlaceImageRecord = authedCallable(async (request) => {
  const authedRequest = requireAuth(request);
  return useCases.createPlaceImageRecord(toRequestContext(authedRequest), request.data);
});

export const createReport = authedCallable(async (request) => {
  const authedRequest = requireAuth(request);
  return useCases.createReport(toRequestContext(authedRequest), request.data);
});

export const createChildProfile = authedCallable(async (request) => {
  const authedRequest = requireAuth(request);
  return useCases.createChildProfile(toRequestContext(authedRequest), request.data);
});

export const requestProfessionalVerification = authedCallable(async (request) => {
  const authedRequest = requireAuth(request);
  return useCases.requestProfessionalVerification(toRequestContext(authedRequest), request.data);
});

export const requestOrganizationVerification = authedCallable(async (request) => {
  const authedRequest = requireAuth(request);
  return useCases.requestOrganizationVerification(toRequestContext(authedRequest), request.data);
});

export const moderateContent = authedCallable(async (request) => {
  const moderatorRequest = requireModerator(request);
  return useCases.moderateContent(toRequestContext(moderatorRequest), request.data);
});

export const setVerificationStatus = authedCallable(async (request) => {
  const moderatorRequest = requireModerator(request);
  return useCases.setVerificationStatus(toRequestContext(moderatorRequest), request.data);
});

export const setUserAccessClaims = authedCallable(async (request) => {
  const adminRequest = requireSuperAdmin(request);
  return useCases.setUserAccessClaims(toRequestContext(adminRequest), request.data);
});
