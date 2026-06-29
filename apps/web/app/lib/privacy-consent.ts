export type PrivacyConsent = {
  version: 1;
  analytics: boolean;
  maps: boolean;
  updatedAt: string;
};

export type PrivacyConsentChoice = Pick<PrivacyConsent, "analytics" | "maps">;

const privacyConsentStorageKey = "spectrum-access:privacy-consent:v1";

function normalizeConsent(value: unknown): PrivacyConsent | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<PrivacyConsent>;
  if (candidate.version !== 1 || typeof candidate.analytics !== "boolean" || typeof candidate.maps !== "boolean") {
    return null;
  }

  return {
    version: 1,
    analytics: candidate.analytics,
    maps: candidate.maps,
    updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : new Date(0).toISOString()
  };
}

export function readPrivacyConsent(): PrivacyConsent | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(privacyConsentStorageKey);
    return stored ? normalizeConsent(JSON.parse(stored)) : null;
  } catch {
    return null;
  }
}

export function savePrivacyConsent(choice: PrivacyConsentChoice): PrivacyConsent {
  const consent: PrivacyConsent = {
    version: 1,
    analytics: choice.analytics,
    maps: choice.maps,
    updatedAt: new Date().toISOString()
  };

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(privacyConsentStorageKey, JSON.stringify(consent));
    } catch {
      // Consent still applies in memory if browser storage is unavailable.
    }
  }

  return consent;
}
