import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";
import { ApplicationError } from "../domain/errors.js";
import type { RequestContext } from "../ports/auth.js";

export type AuthedRequest = CallableRequest<unknown> & {
  auth: NonNullable<CallableRequest<unknown>["auth"]>;
};

export function toHttpsError(error: unknown): HttpsError {
  if (error instanceof HttpsError) {
    return error;
  }

  if (error instanceof ApplicationError) {
    return new HttpsError(error.code, error.message);
  }

  return new HttpsError("internal", "Unexpected backend error.");
}

export function requireAuth(request: CallableRequest<unknown>): AuthedRequest {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication is required.");
  }

  return request as AuthedRequest;
}

export function toRequestContext(request: AuthedRequest): RequestContext {
  return {
    uid: request.auth.uid,
    token: request.auth.token as Record<string, unknown>
  };
}

export function isModeratorRequest(request: AuthedRequest): boolean {
  return request.auth.token.superAdmin === true || request.auth.token.admin === true || request.auth.token.moderator === true;
}

export function requireModerator(request: CallableRequest<unknown>): AuthedRequest {
  const authedRequest = requireAuth(request);
  if (!isModeratorRequest(authedRequest)) {
    throw new HttpsError("permission-denied", "Moderator privileges are required.");
  }

  return authedRequest;
}

export function requireSuperAdmin(request: CallableRequest<unknown>): AuthedRequest {
  const authedRequest = requireAuth(request);
  if (authedRequest.auth.token.superAdmin !== true) {
    throw new HttpsError("permission-denied", "Super admin privileges are required.");
  }

  return authedRequest;
}
