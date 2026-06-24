import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { createEventHandlers } from "../application/events.js";
import { createUseCases } from "../application/use-cases.js";
import { FirebaseAuthGateway } from "../infrastructure/firebase/auth-gateway.js";
import { FirebaseClock } from "../infrastructure/firebase/clock.js";
import { FirebaseLogger } from "../infrastructure/firebase/logger.js";
import { FirestoreSpectrumRepository } from "../infrastructure/firebase/repository.js";

initializeApp();

const clock = new FirebaseClock();
const logger = new FirebaseLogger();
const repository = new FirestoreSpectrumRepository(getFirestore());
const auth = new FirebaseAuthGateway(getAuth());

export const functionRegion = process.env.FUNCTIONS_REGION ?? "europe-west1";
export const callableOptions = { region: functionRegion };

export const useCases = createUseCases({ auth, clock, repository });
export const eventHandlers = createEventHandlers({ clock, logger, repository });
