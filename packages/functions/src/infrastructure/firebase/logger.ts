import { logger } from "firebase-functions";
import type { AppLogger } from "../../ports/logger.js";

export class FirebaseLogger implements AppLogger {
  info(message: string, metadata?: Record<string, unknown>) {
    logger.info(message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>) {
    logger.warn(message, metadata);
  }

  error(message: string, metadata?: Record<string, unknown>) {
    logger.error(message, metadata);
  }
}
