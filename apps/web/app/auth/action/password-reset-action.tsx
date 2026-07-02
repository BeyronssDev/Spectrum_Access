"use client";

import { Check, KeyRound, Lock, ShieldCheck } from "lucide-react";
import { confirmPasswordReset, getAuth, verifyPasswordResetCode } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Locale } from "@accessibilitat/shared";
import { requireFirebaseApp } from "../../lib/firebase";
import { OfficialLogo } from "../../platform/ui-elements";

const minimumPasswordLength = 12;

type PasswordResetCopy = {
  checking: string;
  eyebrow: string;
  title: string;
  intro: string;
  emailLabel: string;
  password: string;
  confirmPassword: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successBody: string;
  backToApp: string;
  invalidTitle: string;
  invalidBody: string;
  requiredFields: string;
  passwordMinLength: string;
  passwordsMismatch: string;
  failed: string;
};

const copy: Record<Locale, PasswordResetCopy> = {
  ca: {
    checking: "Comprovant l'enllaç segur...",
    eyebrow: "Seguretat del compte",
    title: "Crea una contrasenya nova",
    intro: "Escriu la nova contrasenya dues vegades per protegir el teu compte de Spectrum Access.",
    emailLabel: "Compte",
    password: "Nova contrasenya",
    confirmPassword: "Repeteix la nova contrasenya",
    submit: "Restablir contrasenya",
    submitting: "Restablint...",
    successTitle: "Contrasenya actualitzada",
    successBody: "Ja pots tornar a entrar a Spectrum Access amb la nova contrasenya.",
    backToApp: "Tornar a Spectrum Access",
    invalidTitle: "Aquest enllaç no és vàlid",
    invalidBody: "L'enllaç pot haver caducat o ja s'ha utilitzat. Demana'n un de nou des de la pantalla d'inici de sessió.",
    requiredFields: "Omple els dos camps de contrasenya.",
    passwordMinLength: "La contrasenya ha de tenir com a mínim 12 caràcters.",
    passwordsMismatch: "Les contrasenyes no coincideixen.",
    failed: "No s'ha pogut restablir la contrasenya. Demana un enllaç nou i torna-ho a provar."
  },
  es: {
    checking: "Comprobando el enlace seguro...",
    eyebrow: "Seguridad de la cuenta",
    title: "Crea una contraseña nueva",
    intro: "Escribe la nueva contraseña dos veces para proteger tu cuenta de Spectrum Access.",
    emailLabel: "Cuenta",
    password: "Nueva contraseña",
    confirmPassword: "Repite la nueva contraseña",
    submit: "Restablecer contraseña",
    submitting: "Restableciendo...",
    successTitle: "Contraseña actualizada",
    successBody: "Ya puedes volver a entrar en Spectrum Access con la nueva contraseña.",
    backToApp: "Volver a Spectrum Access",
    invalidTitle: "Este enlace no es válido",
    invalidBody: "El enlace puede haber caducado o ya se ha utilizado. Pide uno nuevo desde la pantalla de inicio de sesión.",
    requiredFields: "Rellena los dos campos de contraseña.",
    passwordMinLength: "La contraseña debe tener como mínimo 12 caracteres.",
    passwordsMismatch: "Las contraseñas no coinciden.",
    failed: "No se ha podido restablecer la contraseña. Pide un enlace nuevo e inténtalo otra vez."
  },
  en: {
    checking: "Checking the secure link...",
    eyebrow: "Account security",
    title: "Create a new password",
    intro: "Enter the new password twice to protect your Spectrum Access account.",
    emailLabel: "Account",
    password: "New password",
    confirmPassword: "Repeat new password",
    submit: "Reset password",
    submitting: "Resetting...",
    successTitle: "Password updated",
    successBody: "You can now sign in to Spectrum Access with your new password.",
    backToApp: "Back to Spectrum Access",
    invalidTitle: "This link is not valid",
    invalidBody: "The link may have expired or already been used. Request a new one from the sign-in screen.",
    requiredFields: "Fill in both password fields.",
    passwordMinLength: "Password must be at least 12 characters.",
    passwordsMismatch: "Passwords do not match.",
    failed: "We could not reset the password. Request a new link and try again."
  }
};

type ResetState = "checking" | "ready" | "success" | "invalid";

export function PasswordResetAction() {
  const [state, setState] = useState<ResetState>("checking");
  const [accountEmail, setAccountEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [locale, setLocale] = useState<Locale>("ca");
  const c = copy[locale];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextLocale = readLocale(params.get("lang"));
    const code = params.get("oobCode");
    const mode = params.get("mode");
    setLocale(nextLocale);

    if (mode !== "resetPassword" || !code) {
      setState("invalid");
      return;
    }

    const auth = getAuth(requireFirebaseApp());
    auth.languageCode = nextLocale;
    setOobCode(code);
    void verifyPasswordResetCode(auth, code)
      .then((email) => {
        setAccountEmail(email);
        setState("ready");
      })
      .catch(() => setState("invalid"));
  }, []);

  const canSubmit = useMemo(() => state === "ready" && !isSubmitting, [isSubmitting, state]);

  const submit = () => {
    if (!oobCode || !canSubmit) {
      return;
    }

    setMessage(null);
    if (!password || !passwordRepeat) {
      setMessage(c.requiredFields);
      return;
    }
    if (password.length < minimumPasswordLength) {
      setMessage(c.passwordMinLength);
      return;
    }
    if (password !== passwordRepeat) {
      setMessage(c.passwordsMismatch);
      return;
    }

    setIsSubmitting(true);
    const auth = getAuth(requireFirebaseApp());
    void confirmPasswordReset(auth, oobCode, password)
      .then(() => {
        setPassword("");
        setPasswordRepeat("");
        setState("success");
      })
      .catch(() => setMessage(c.failed))
      .finally(() => setIsSubmitting(false));
  };

  return (
    <main className="spectrum-app" data-theme="light" data-focus="false">
      <section className="auth-shell">
        <div className="auth-card panel">
          <div className="auth-toolbar">
            <OfficialLogo size={58} />
            <div className="auth-link-action">
              <ShieldCheck aria-hidden="true" size={16} />
              {c.eyebrow}
            </div>
          </div>
          {state === "checking" ? (
            <StatusContent icon={<KeyRound aria-hidden="true" size={24} />} title={c.checking} />
          ) : null}
          {state === "invalid" ? (
            <StatusContent
              icon={<Lock aria-hidden="true" size={24} />}
              title={c.invalidTitle}
              body={c.invalidBody}
              action={c.backToApp}
            />
          ) : null}
          {state === "success" ? (
            <StatusContent
              icon={<Check aria-hidden="true" size={24} />}
              title={c.successTitle}
              body={c.successBody}
              action={c.backToApp}
            />
          ) : null}
          {state === "ready" ? (
            <>
              <div className="auth-copy">
                <h1>{c.title}</h1>
                <p>{c.intro}</p>
              </div>
              <div className="auth-form">
                <label>
                  <span>{c.emailLabel}</span>
                  <input type="email" value={accountEmail} readOnly />
                </label>
                <label>
                  <span>{c.password}</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </label>
                <label>
                  <span>{c.confirmPassword}</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={passwordRepeat}
                    onChange={(event) => setPasswordRepeat(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        submit();
                      }
                    }}
                  />
                </label>
              </div>
              <button type="button" className="primary-action auth-submit" disabled={!canSubmit} onClick={submit}>
                <KeyRound aria-hidden="true" size={17} />
                {isSubmitting ? c.submitting : c.submit}
              </button>
              {message ? <p className="form-status">{message}</p> : null}
            </>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function StatusContent({
  icon,
  title,
  body,
  action
}: {
  icon: ReactNode;
  title: string;
  body?: string;
  action?: string;
}) {
  return (
    <>
      <div className="auth-copy">
        {icon}
        <h1>{title}</h1>
        {body ? <p>{body}</p> : null}
      </div>
      {action ? (
        <a className="primary-action auth-submit" href="/">
          {action}
        </a>
      ) : null}
    </>
  );
}

function readLocale(value: string | null): Locale {
  return value === "es" || value === "en" || value === "ca" ? value : "ca";
}
