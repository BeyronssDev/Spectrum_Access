export type ApplicationErrorCode =
  | "unauthenticated"
  | "permission-denied"
  | "invalid-argument"
  | "not-found"
  | "failed-precondition";

export class ApplicationError extends Error {
  constructor(
    readonly code: ApplicationErrorCode,
    message: string
  ) {
    super(message);
    this.name = "ApplicationError";
  }
}

export function fail(code: ApplicationErrorCode, message: string): never {
  throw new ApplicationError(code, message);
}
