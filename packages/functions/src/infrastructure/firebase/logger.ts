import { logger } from "firebase-functions";
import type { AppLogger } from "../../ports/logger.js";

export class FirebaseLogger implements AppLogger {
  warn(message: string, metadata?: Record<string, unknown>) {
    logger.warn(message, metadata);
  }
}
