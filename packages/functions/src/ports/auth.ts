export type RequestContext = {
  uid: string;
  token: Record<string, unknown>;
};

export type AuthUserRecord = {
  uid: string;
  email?: string;
  displayName?: string;
  providerIds: string[];
  customClaims?: Record<string, unknown>;
};

export type UserLookup = {
  uid?: string;
  email?: string;
};

export interface AuthGateway {
  getUser(lookup: UserLookup): Promise<AuthUserRecord>;
  setCustomUserClaims(uid: string, claims: Record<string, unknown>): Promise<void>;
}
