import { afterEach, describe, expect, it } from "vitest";
import type { CallableRequest } from "firebase-functions/v2/https";
import { requireModerator, requireSuperAdmin } from "../../src/interfaces/callable-auth.js";

const previousRequireSuperAdminMfa = process.env.REQUIRE_SUPER_ADMIN_MFA;

afterEach(() => {
  if (previousRequireSuperAdminMfa === undefined) {
    delete process.env.REQUIRE_SUPER_ADMIN_MFA;
    return;
  }

  process.env.REQUIRE_SUPER_ADMIN_MFA = previousRequireSuperAdminMfa;
});

function requestWithToken(token: Record<string, unknown>): CallableRequest<unknown> {
  return {
    data: {},
    auth: {
      uid: "admin-1",
      token,
      rawToken: "token"
    },
    rawRequest: {
      headers: {},
      ip: "127.0.0.1"
    }
  } as unknown as CallableRequest<unknown>;
}

describe("callable elevated auth", () => {
  it("requires verified email for moderator access", () => {
    const request = requestWithToken({
      moderator: true,
      email: "moderator@example.com",
      email_verified: false
    });

    expect(() => requireModerator(request)).toThrowError("Verified email is required for elevated access.");
  });

  it("requires multi-factor session for super admin access by default", () => {
    delete process.env.REQUIRE_SUPER_ADMIN_MFA;
    const request = requestWithToken({
      superAdmin: true,
      email: "owner@example.com",
      email_verified: true,
      firebase: {}
    });

    expect(() => requireSuperAdmin(request)).toThrowError("A multi-factor super admin session is required.");
  });

  it("allows super admin access when the token carries a second factor", () => {
    delete process.env.REQUIRE_SUPER_ADMIN_MFA;
    const request = requestWithToken({
      superAdmin: true,
      email: "owner@example.com",
      email_verified: true,
      firebase: {
        sign_in_second_factor: "phone"
      }
    });

    expect(requireSuperAdmin(request).auth.uid).toBe("admin-1");
  });
});
