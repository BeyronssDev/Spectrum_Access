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

function tokenRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function requireVerifiedElevatedEmail(request: AuthedRequest): void {
  const email = request.auth.token.email;
  if (typeof email === "string" && request.auth.token.email_verified !== true) {
    throw new HttpsError("permission-denied", "Verified email is required for elevated access.");
  }
}

function hasMultiFactorSession(request: AuthedRequest): boolean {
  const firebase = tokenRecord(request.auth.token.firebase);
  return typeof firebase.sign_in_second_factor === "string" && firebase.sign_in_second_factor.length > 0;
}

function superAdminMfaRequired(): boolean {
  return process.env.REQUIRE_SUPER_ADMIN_MFA !== "false";
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

  requireVerifiedElevatedEmail(authedRequest);
  return authedRequest;
}

export function requireSuperAdmin(request: CallableRequest<unknown>): AuthedRequest {
  const authedRequest = requireAuth(request);
  if (authedRequest.auth.token.superAdmin !== true) {
    throw new HttpsError("permission-denied", "Super admin privileges are required.");
  }

  requireVerifiedElevatedEmail(authedRequest);
  if (superAdminMfaRequired() && !hasMultiFactorSession(authedRequest)) {
    throw new HttpsError("permission-denied", "A multi-factor super admin session is required.");
  }

  return authedRequest;
}
