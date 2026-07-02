import { createHash } from "node:crypto";
import { logger as functionsLogger } from "firebase-functions";
import { HttpsError, onCall, type CallableRequest } from "firebase-functions/v2/https";
import {
  callableOptions,
  passwordResetCallableOptions,
  replayProtectedCallableOptions,
  useCases
} from "../composition/container.js";
import { requireAuth, requireModerator, requireSuperAdmin, toHttpsError, toRequestContext } from "./callable-auth.js";

const publicSearchQuota = {
  limit: 60,
  windowSeconds: 60
};
const callableQuota = {
  limit: 120,
  windowSeconds: 60
};

function authedCallable(name: string, handler: (request: CallableRequest<unknown>) => Promise<unknown>) {
  return onCall(replayProtectedCallableOptions, async (request) => {
    try {
      rejectReplayedAppCheckToken(name, request);
      await reserveCallableQuota(name, request);
      return await handler(request);
    } catch (error) {
      const httpsError = toHttpsError(error);
      logSecurityError(name, request, httpsError);
      throw httpsError;
    }
  });
}

function publicCallable(
  name: string,
  handler: (request: CallableRequest<unknown>) => Promise<unknown>,
  options = callableOptions
) {
  return onCall(options, async (request) => {
    try {
      return await handler(request);
    } catch (error) {
      const httpsError = toHttpsError(error);
      logSecurityError(name, request, httpsError);
      throw httpsError;
    }
  });
}

function rejectReplayedAppCheckToken(name: string, request: CallableRequest<unknown>) {
  if (request.app?.alreadyConsumed === true) {
    logSecurityEvent(name, request, "app_check_replay");
    throw new HttpsError("unauthenticated", "App Check token was already used.");
  }
}

async function reserveCallableQuota(
  name: string,
  request: CallableRequest<unknown>,
  quota = callableQuota
): Promise<void> {
  await useCases.reserveRateLimit({
    namespace: `callable.${name}`,
    key: request.auth?.uid ? `uid:${request.auth.uid}` : publicCallerKey(request),
    limit: quota.limit,
    windowSeconds: quota.windowSeconds
  });
}

function publicCallerKey(request: CallableRequest<unknown>): string {
  return `app:${request.app?.appId ?? "missing"}:ip:${clientIp(request)}`;
}

function clientIp(request: CallableRequest<unknown>): string {
  const forwardedFor = request.rawRequest.headers["x-forwarded-for"];
  const forwardedForValue = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
  return forwardedForValue?.split(",")[0]?.trim() || request.rawRequest.ip || "unknown";
}

function hashValue(value: string | undefined): string | undefined {
  return value ? createHash("sha256").update(value).digest("hex").slice(0, 16) : undefined;
}

function logSecurityError(name: string, request: CallableRequest<unknown>, error: HttpsError): void {
  if (!["permission-denied", "resource-exhausted", "unauthenticated"].includes(error.code)) {
    return;
  }

  logSecurityEvent(name, request, error.code);
}

function logSecurityEvent(name: string, request: CallableRequest<unknown>, securityEvent: string): void {
  functionsLogger.warn("Callable security event", {
    securityEvent,
    callable: name,
    appIdHash: hashValue(request.app?.appId),
    uidHash: hashValue(request.auth?.uid),
    ipHash: hashValue(clientIp(request))
  });
}

export const searchNearbyPlaces = publicCallable("searchNearbyPlaces", async (request) => {
  return useCases.searchNearbyPlaces(request.data, {
    namespace: "places.searchNearby",
    key: publicCallerKey(request),
    limit: publicSearchQuota.limit,
    windowSeconds: publicSearchQuota.windowSeconds
  });
});

export const searchEventHistory = publicCallable("searchEventHistory", async (request) => {
  return useCases.searchEventHistory(request.data, {
    namespace: "events.searchHistory",
    key: publicCallerKey(request),
    limit: publicSearchQuota.limit,
    windowSeconds: publicSearchQuota.windowSeconds
  });
});

export const completeUserOnboarding = authedCallable("completeUserOnboarding", async (request) => {
  const authedRequest = requireAuth(request);
  return useCases.completeUserOnboarding(toRequestContext(authedRequest), request.data);
});

export const requestPasswordReset = publicCallable(
  "requestPasswordReset",
  async (request) => {
    await reserveCallableQuota("requestPasswordReset", request, {
      limit: 5,
      windowSeconds: 3600
    });
    return useCases.requestPasswordReset(request.data);
  },
  passwordResetCallableOptions
);

export const createPlace = authedCallable("createPlace", async (request) => {
  const authedRequest = requireAuth(request);
  return useCases.createPlace(toRequestContext(authedRequest), request.data);
});

export const createEventSeries = authedCallable("createEventSeries", async (request) => {
  const authedRequest = requireAuth(request);
  return useCases.createEventSeries(toRequestContext(authedRequest), request.data);
});

export const createEventEdition = authedCallable("createEventEdition", async (request) => {
  const authedRequest = requireAuth(request);
  return useCases.createEventEdition(toRequestContext(authedRequest), request.data);
});

export const createEventZone = authedCallable("createEventZone", async (request) => {
  const authedRequest = requireAuth(request);
  return useCases.createEventZone(toRequestContext(authedRequest), request.data);
});

export const submitEventExperience = authedCallable("submitEventExperience", async (request) => {
  const authedRequest = requireAuth(request);
  return useCases.submitEventExperience(toRequestContext(authedRequest), request.data);
});

export const resolvePlaceForContribution = authedCallable("resolvePlaceForContribution", async (request) => {
  const authedRequest = requireAuth(request);
  return useCases.resolvePlaceForContribution(toRequestContext(authedRequest), request.data);
});

export const submitReview = authedCallable("submitReview", async (request) => {
  const authedRequest = requireAuth(request);
  return useCases.submitReview(toRequestContext(authedRequest), request.data);
});

export const submitComment = authedCallable("submitComment", async (request) => {
  const authedRequest = requireAuth(request);
  return useCases.submitComment(toRequestContext(authedRequest), request.data);
});

export const createPlaceImageRecord = authedCallable("createPlaceImageRecord", async (request) => {
  const authedRequest = requireAuth(request);
  return useCases.createPlaceImageRecord(toRequestContext(authedRequest), request.data);
});

export const createReport = authedCallable("createReport", async (request) => {
  const authedRequest = requireAuth(request);
  return useCases.createReport(toRequestContext(authedRequest), request.data);
});

export const createChildProfile = authedCallable("createChildProfile", async (request) => {
  const authedRequest = requireAuth(request);
  return useCases.createChildProfile(toRequestContext(authedRequest), request.data);
});

export const requestProfessionalVerification = authedCallable("requestProfessionalVerification", async (request) => {
  const authedRequest = requireAuth(request);
  return useCases.requestProfessionalVerification(toRequestContext(authedRequest), request.data);
});

export const requestOrganizationVerification = authedCallable("requestOrganizationVerification", async (request) => {
  const authedRequest = requireAuth(request);
  return useCases.requestOrganizationVerification(toRequestContext(authedRequest), request.data);
});

export const moderateContent = authedCallable("moderateContent", async (request) => {
  const moderatorRequest = requireModerator(request);
  return useCases.moderateContent(toRequestContext(moderatorRequest), request.data);
});

export const setVerificationStatus = authedCallable("setVerificationStatus", async (request) => {
  const moderatorRequest = requireModerator(request);
  return useCases.setVerificationStatus(toRequestContext(moderatorRequest), request.data);
});

export const setUserAccessClaims = authedCallable("setUserAccessClaims", async (request) => {
  const adminRequest = requireSuperAdmin(request);
  return useCases.setUserAccessClaims(toRequestContext(adminRequest), request.data);
});
