import {
  authProviderIds,
  commentTargetTypes,
  locales,
  moderationStatuses,
  placeCategories,
  placeSources,
  reportTargetTypes,
  sensoryCriteria,
  type SensoryRating,
  userRoles,
  verificationRequestTypes,
  verificationStatuses
} from "./models.js";

const asSet = <T extends readonly string[]>(values: T) => new Set<string>(values);

export const localeSet = asSet(locales);
export const userRoleSet = asSet(userRoles);
export const placeCategorySet = asSet(placeCategories);
export const placeSourceSet = asSet(placeSources);
export const moderationStatusSet = asSet(moderationStatuses);
export const verificationStatusSet = asSet(verificationStatuses);
export const sensoryCriterionSet = asSet(sensoryCriteria);
export const commentTargetTypeSet = asSet(commentTargetTypes);
export const reportTargetTypeSet = asSet(reportTargetTypes);
export const verificationRequestTypeSet = asSet(verificationRequestTypes);
export const authProviderIdSet = asSet(authProviderIds);

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeText(value: unknown, maxLength = 240): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > maxLength) {
    return null;
  }

  return trimmed;
}

export function isScore(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5;
}

export function isNonEmptyText(value: unknown, maxLength = 240): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= maxLength;
}

export function isValidCoordinate(latitude: number, longitude: number): boolean {
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

export function isSensoryRating(value: unknown): value is SensoryRating {
  if (!isRecord(value)) {
    return false;
  }

  return sensoryCriteria.every((criterion) => isScore(value[criterion]));
}

export function isLocale(value: unknown): value is (typeof locales)[number] {
  return typeof value === "string" && localeSet.has(value);
}

export function isAuthProviderId(value: unknown): value is (typeof authProviderIds)[number] {
  return typeof value === "string" && authProviderIdSet.has(value);
}

export function isPlaceSource(value: unknown): value is (typeof placeSources)[number] {
  return typeof value === "string" && placeSourceSet.has(value);
}
