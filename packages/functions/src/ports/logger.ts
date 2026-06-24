export interface AppLogger {
  warn(message: string, metadata?: Record<string, unknown>): void;
}
