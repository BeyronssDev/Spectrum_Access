export type RequestContext = {
  uid: string;
  token: Record<string, unknown>;
};

export type AuthUserRecord = {
  uid: string;
  email?: string;
  displayName?: string;
  providerIds: string[];
  hasPasswordProvider: boolean;
  customClaims?: Record<string, unknown>;
};

export type UserLookup = {
  uid?: string;
  email?: string;
};

export type PasswordResetLinkSettings = {
  url: string;
  handleCodeInApp?: boolean;
};

export interface AuthGateway {
  getUser(lookup: UserLookup): Promise<AuthUserRecord>;
  generatePasswordResetLink(email: string, settings: PasswordResetLinkSettings): Promise<string>;
  setCustomUserClaims(uid: string, claims: Record<string, unknown>): Promise<void>;
}
