import type { Auth } from "firebase-admin/auth";
import { ApplicationError } from "../../domain/errors.js";
import type { AuthGateway, AuthUserRecord, UserLookup } from "../../ports/auth.js";

export class FirebaseAuthGateway implements AuthGateway {
  constructor(private readonly auth: Auth) {}

  async getUser(lookup: UserLookup): Promise<AuthUserRecord> {
    const userRecord = await (lookup.uid
      ? this.auth.getUser(lookup.uid)
      : this.auth.getUserByEmail(lookup.email ?? "")).catch(() => {
      throw new ApplicationError("not-found", "User not found.");
    });

    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      providerIds: userRecord.providerData.map((provider) => provider.providerId),
      customClaims: userRecord.customClaims
    };
  }

  setCustomUserClaims(uid: string, claims: Record<string, unknown>) {
    return this.auth.setCustomUserClaims(uid, claims);
  }
}
