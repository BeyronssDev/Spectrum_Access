import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { defineSecret } from "firebase-functions/params";
import type { CallableOptions } from "firebase-functions/v2/https";
import { createEventHandlers } from "../application/events.js";
import { createUseCases } from "../application/use-cases.js";
import { SmtpEmailGateway } from "../infrastructure/email/smtp-email-gateway.js";
import { FirebaseAuthGateway } from "../infrastructure/firebase/auth-gateway.js";
import { FirebaseClock } from "../infrastructure/firebase/clock.js";
import { GooglePlacesGateway } from "../infrastructure/firebase/google-places-gateway.js";
import { FirebaseLogger } from "../infrastructure/firebase/logger.js";
import { FirestoreSpectrumRepository } from "../infrastructure/firebase/repository.js";

initializeApp();

const clock = new FirebaseClock();
const logger = new FirebaseLogger();
const repository = new FirestoreSpectrumRepository(getFirestore());
const auth = new FirebaseAuthGateway(getAuth());

export const googlePlacesApiKey = defineSecret("GOOGLE_PLACES_API_KEY");
export const smtpPassword = defineSecret("SMTP_PASSWORD");
const places = new GooglePlacesGateway(process.env.GOOGLE_PLACES_API_KEY ?? process.env.GOOGLE_MAPS_API_KEY);
const email = new SmtpEmailGateway({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
  password: process.env.SMTP_PASSWORD,
  from: process.env.SMTP_FROM
});

export const functionRegion = process.env.FUNCTIONS_REGION ?? "europe-west1";
export const callableOptions = {
  region: functionRegion,
  secrets: [googlePlacesApiKey],
  enforceAppCheck: true
} satisfies CallableOptions;
export const passwordResetCallableOptions = {
  region: functionRegion,
  secrets: [smtpPassword],
  enforceAppCheck: true
} satisfies CallableOptions;
export const replayProtectedCallableOptions = {
  ...callableOptions,
  consumeAppCheckToken: true
} satisfies CallableOptions;

export const useCases = createUseCases({
  auth,
  clock,
  email,
  appPublicUrl: process.env.APP_PUBLIC_URL,
  places,
  repository
});
export const eventHandlers = createEventHandlers({ clock, logger, repository });
