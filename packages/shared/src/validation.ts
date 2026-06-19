import {
  locales,
  moderationStatuses,
  placeCategories,
  sensoryCriteria,
  userRoles,
  verificationStatuses
} from "./models.js";

const asSet = <T extends readonly string[]>(values: T) => new Set<string>(values);

export const localeSet = asSet(locales);
export const userRoleSet = asSet(userRoles);
export const placeCategorySet = asSet(placeCategories);
export const moderationStatusSet = asSet(moderationStatuses);
export const verificationStatusSet = asSet(verificationStatuses);
export const sensoryCriterionSet = asSet(sensoryCriteria);

export function isScore(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5;
}

export function isNonEmptyText(value: unknown, maxLength = 240): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= maxLength;
}

export function isValidCoordinate(latitude: number, longitude: number): boolean {
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}
