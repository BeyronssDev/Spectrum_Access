export type TimestampValue = unknown;

export interface Clock {
  now(): TimestampValue;
}
