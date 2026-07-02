import type { ActionCodeSettings, Auth } from "firebase-admin/auth";
import { ApplicationError } from "../../domain/errors.js";
import type { AuthGateway, AuthUserRecord, PasswordResetLinkSettings, UserLookup } from "../../ports/auth.js";

export class FirebaseAuthGateway implements AuthGateway {
  constructor(private readonly auth: Auth) {}

  async getUser(lookup: UserLookup): Promise<AuthUserRecord> {
    const userRecord = await (lookup.uid
      ? this.auth.getUser(lookup.uid)
      : this.auth.getUserByEmail(lookup.email ?? "")).catch((error: unknown) => {
      if (isAuthUserNotFoundError(error)) {
        throw new ApplicationError("not-found", "User not found.");
      }

      throw error;
    });
    const providerIds = userRecord.providerData.map((provider) => provider.providerId);

    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      providerIds,
      hasPasswordProvider: hasPasswordProvider(userRecord, providerIds),
      customClaims: userRecord.customClaims
    };
  }

  setCustomUserClaims(uid: string, claims: Record<string, unknown>) {
    return this.auth.setCustomUserClaims(uid, claims);
  }

  generatePasswordResetLink(email: string, settings: PasswordResetLinkSettings) {
    const actionCodeSettings: ActionCodeSettings = {
      url: settings.url,
      handleCodeInApp: settings.handleCodeInApp ?? false
    };

    return this.auth.generatePasswordResetLink(email, actionCodeSettings);
  }
}

function isAuthUserNotFoundError(error: unknown): boolean {
  const code = (error as { code?: unknown }).code;
  return code === "auth/user-not-found";
}

function hasPasswordProvider(userRecord: { email?: string; passwordHash?: string }, providerIds: string[]): boolean {
  return (
    providerIds.includes("password") ||
    (typeof userRecord.passwordHash === "string" && userRecord.passwordHash.length > 0) ||
    (Boolean(userRecord.email) && providerIds.length === 0)
  );
}
