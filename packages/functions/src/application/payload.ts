import {
  authProviderIdSet,
  commentTargetTypeSet,
  isAuthProviderId,
  isLocale,
  isRecord,
  isSensoryRating,
  isValidCoordinate,
  locales,
  normalizeText,
  placeCategorySet,
  reportTargetTypeSet,
  sensoryCriterionSet,
  verificationRequestTypeSet,
  verificationStatusSet,
  type AuthProviderId,
  type Locale,
  type SensoryCriterion,
  type SensoryRating,
  type VerificationRequestType,
  type VerificationStatus
} from "@accessibilitat/shared";
import { childAgeRanges, sensoryPreferenceLevels } from "../domain/moderation.js";
import { fail } from "../domain/errors.js";

export function requirePayload(data: unknown): Record<string, unknown> {
  if (!isRecord(data)) {
    fail("invalid-argument", "Expected an object payload.");
  }

  return data;
}

export function requireText(data: Record<string, unknown>, key: string, maxLength = 240): string {
  const text = normalizeText(data[key], maxLength);
  if (!text) {
    fail("invalid-argument", `Invalid ${key}.`);
  }

  return text;
}

export function optionalText(data: Record<string, unknown>, key: string, maxLength = 240): string | undefined {
  if (data[key] === undefined || data[key] === null || data[key] === "") {
    return undefined;
  }

  const text = normalizeText(data[key], maxLength);
  if (!text) {
    fail("invalid-argument", `Invalid ${key}.`);
  }

  return text;
}

export function requireNumber(data: Record<string, unknown>, key: string): number {
  const value = data[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    fail("invalid-argument", `Invalid ${key}.`);
  }

  return value;
}

export function requireCoordinate(data: Record<string, unknown>) {
  const latitude = requireNumber(data, "latitude");
  const longitude = requireNumber(data, "longitude");

  if (!isValidCoordinate(latitude, longitude)) {
    fail("invalid-argument", "Invalid position.");
  }

  return { latitude, longitude };
}

export function requireSetValue(data: Record<string, unknown>, key: string, allowed: Set<string>): string {
  const value = requireText(data, key, 120);
  if (!allowed.has(value)) {
    fail("invalid-argument", `Invalid ${key}.`);
  }

  return value;
}

export function requireLocale(data: Record<string, unknown>): Locale {
  const locale = data.locale;
  if (!isLocale(locale)) {
    fail("invalid-argument", "Invalid locale.");
  }

  return locale;
}

export function requirePlaceCategory(data: Record<string, unknown>) {
  return requireSetValue(data, "category", placeCategorySet);
}

export function requireCommentTargetType(data: Record<string, unknown>) {
  return requireSetValue(data, "targetType", commentTargetTypeSet);
}

export function requireReportTargetType(data: Record<string, unknown>) {
  return requireSetValue(data, "targetType", reportTargetTypeSet);
}

export function requireVerificationRequestType(data: Record<string, unknown>): VerificationRequestType {
  return requireSetValue(data, "profileType", verificationRequestTypeSet) as VerificationRequestType;
}

export function requireVerificationStatus(data: Record<string, unknown>): VerificationStatus {
  return requireSetValue(data, "status", verificationStatusSet) as VerificationStatus;
}

export function requireSensoryRating(data: Record<string, unknown>): SensoryRating {
  const ratings = data.ratings;
  if (!isSensoryRating(ratings)) {
    fail("invalid-argument", "Invalid ratings.");
  }

  return ratings;
}

export function optionalEmail(data: Record<string, unknown>, key: string): string | undefined {
  const value = optionalText(data, key, 254);
  if (!value) {
    return undefined;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    fail("invalid-argument", `Invalid ${key}.`);
  }

  return value.toLowerCase();
}

export function optionalBoolean(data: Record<string, unknown>, key: string): boolean | undefined {
  const value = data[key];
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "boolean") {
    fail("invalid-argument", `Invalid ${key}.`);
  }

  return value;
}

export function optionalOwnerPath(
  data: Record<string, unknown>,
  key: string,
  uid: string,
  prefix: string
): string | undefined {
  const value = optionalText(data, key, 1024);
  if (!value) {
    return undefined;
  }

  if (!value.startsWith(`${prefix}/${uid}/`)) {
    fail("permission-denied", `${key} must belong to the authenticated user.`);
  }

  return value;
}

export function readAuthProviders(value: unknown): AuthProviderId[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > authProviderIdSet.size) {
    fail("invalid-argument", "Invalid authProviders.");
  }

  const providers = new Set<AuthProviderId>();
  for (const provider of value) {
    if (!isAuthProviderId(provider)) {
      fail("invalid-argument", "Invalid authProviders.");
    }
    providers.add(provider);
  }

  return [...providers];
}

export function readSensoryPreferences(value: unknown): Partial<Record<SensoryCriterion, "low" | "medium" | "high">> {
  if (value === undefined || value === null) {
    return {};
  }

  if (!isRecord(value)) {
    fail("invalid-argument", "Invalid sensoryPreferences.");
  }

  const preferences: Partial<Record<SensoryCriterion, "low" | "medium" | "high">> = {};
  for (const [criterion, level] of Object.entries(value)) {
    if (!sensoryCriterionSet.has(criterion) || typeof level !== "string" || !sensoryPreferenceLevels.has(level)) {
      fail("invalid-argument", "Invalid sensoryPreferences.");
    }

    preferences[criterion as SensoryCriterion] = level as "low" | "medium" | "high";
  }

  return preferences;
}

export function readAltText(value: unknown): Record<Locale, string> {
  const altText = Object.fromEntries(locales.map((locale) => [locale, ""])) as Record<Locale, string>;
  if (value === undefined || value === null) {
    return altText;
  }

  if (!isRecord(value)) {
    fail("invalid-argument", "Invalid altText.");
  }

  for (const locale of locales) {
    if (value[locale] === undefined || value[locale] === null || value[locale] === "") {
      continue;
    }

    const text = normalizeText(value[locale], 160);
    if (!text) {
      fail("invalid-argument", "Invalid altText.");
    }

    altText[locale] = text;
  }

  return altText;
}

export function optionalChildAgeRange(data: Record<string, unknown>): string | undefined {
  const ageRange = optionalText(data, "ageRange", 20);
  if (ageRange && !childAgeRanges.has(ageRange)) {
    fail("invalid-argument", "Invalid ageRange.");
  }

  return ageRange;
}
