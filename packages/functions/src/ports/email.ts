import type { Locale } from "@accessibilitat/shared";

export type PasswordResetEmailInput = {
  to: string;
  displayName?: string;
  resetUrl: string;
  locale: Locale;
};

export interface EmailGateway {
  sendPasswordResetEmail(input: PasswordResetEmailInput): Promise<void>;
}
