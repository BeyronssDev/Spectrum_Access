import { FieldValue } from "firebase-admin/firestore";
import type { Clock } from "../../ports/clock.js";

export class FirebaseClock implements Clock {
  now() {
    return FieldValue.serverTimestamp();
  }
}
