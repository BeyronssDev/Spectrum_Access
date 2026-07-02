import {
  authProviderIds,
  commentTargetTypes,
  eventCategories,
  eventExperienceCriteria,
  locales,
  minimumAccountAge,
  moderationStatuses,
  placeCategories,
  placeSources,
  reportTargetTypes,
  sensoryCriteria,
  type EventExperienceRating,
  type SensoryRating,
  userRoles,
  verificationRequestTypes,
  verificationStatuses
} from "./models.js";

const asSet = <T extends readonly string[]>(values: T) => new Set<string>(values);

export const localeSet = asSet(locales);
export const userRoleSet = asSet(userRoles);
export const placeCategorySet = asSet(placeCategories);
export const eventCategorySet = asSet(eventCategories);
export const placeSourceSet = asSet(placeSources);
export const moderationStatusSet = asSet(moderationStatuses);
export const verificationStatusSet = asSet(verificationStatuses);
export const sensoryCriterionSet = asSet(sensoryCriteria);
export const eventExperienceCriterionSet = asSet(eventExperienceCriteria);
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

export function isEventExperienceRating(value: unknown): value is EventExperienceRating {
  if (!isRecord(value)) {
    return false;
  }

  return eventExperienceCriteria.every((criterion) => isScore(value[criterion]));
}

export function isLocale(value: unknown): value is (typeof locales)[number] {
  return typeof value === "string" && localeSet.has(value);
}

export function isAuthProviderId(value: unknown): value is (typeof authProviderIds)[number] {
  return typeof value === "string" && authProviderIdSet.has(value);
}

export function isBirthDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

export function isAdultBirthDate(value: unknown, now = new Date(), minimumAge = minimumAccountAge): value is string {
  if (!isBirthDate(value)) {
    return false;
  }

  const [birthYear, birthMonth, birthDay] = value.split("-").map(Number);
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth() + 1;
  const currentDay = now.getUTCDate();
  const hadBirthdayThisYear =
    currentMonth > birthMonth || (currentMonth === birthMonth && currentDay >= birthDay);
  const age = currentYear - birthYear - (hadBirthdayThisYear ? 0 : 1);

  return age >= minimumAge;
}

export function isPlaceSource(value: unknown): value is (typeof placeSources)[number] {
  return typeof value === "string" && placeSourceSet.has(value);
}
