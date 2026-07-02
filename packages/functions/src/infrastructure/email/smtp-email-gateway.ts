import { createRequire } from "node:module";
import type { Locale } from "@accessibilitat/shared";
import type { EmailGateway, PasswordResetEmailInput } from "../../ports/email.js";

const require = createRequire(import.meta.url);
const { createTransport } = require("nodemailer") as typeof import("nodemailer");

type SmtpEmailGatewayConfig = {
  host?: string;
  port?: string;
  user?: string;
  password?: string;
  from?: string;
  appUrl?: string;
};

type PasswordResetCopy = {
  subject: string;
  preview: string;
  eyebrow: string;
  title: string;
  body: string;
  button: string;
  expires: string;
  ignore: string;
  footer: string;
};

const defaultSender = "security@spectrumaccess.info";
const defaultSmtpHost = "smtp.dondominio.com";
const defaultSmtpPort = 587;

const passwordResetCopy: Record<Locale, PasswordResetCopy> = {
  ca: {
    subject: "Restableix la contrasenya de Spectrum Access",
    preview: "Hem rebut una sol·licitud per canviar la contrasenya del teu compte.",
    eyebrow: "Seguretat del compte",
    title: "Restableix la contrasenya",
    body: "Hem rebut una sol·licitud per canviar la contrasenya del teu compte de Spectrum Access.",
    button: "Crear una contrasenya nova",
    expires: "Aquest enllaç és d'un sol ús i caduca al cap d'una estona.",
    ignore: "Si no ho has demanat tu, pots ignorar aquest correu. La teva contrasenya actual no canviarà.",
    footer: "Spectrum Access envia aquest missatge per protegir l'accés al teu compte."
  },
  es: {
    subject: "Restablece la contraseña de Spectrum Access",
    preview: "Hemos recibido una solicitud para cambiar la contraseña de tu cuenta.",
    eyebrow: "Seguridad de la cuenta",
    title: "Restablece la contraseña",
    body: "Hemos recibido una solicitud para cambiar la contraseña de tu cuenta de Spectrum Access.",
    button: "Crear una contraseña nueva",
    expires: "Este enlace es de un solo uso y caduca al cabo de un rato.",
    ignore: "Si no lo has solicitado tú, puedes ignorar este correo. Tu contraseña actual no cambiará.",
    footer: "Spectrum Access envía este mensaje para proteger el acceso a tu cuenta."
  },
  en: {
    subject: "Reset your Spectrum Access password",
    preview: "We received a request to change the password for your account.",
    eyebrow: "Account security",
    title: "Reset your password",
    body: "We received a request to change the password for your Spectrum Access account.",
    button: "Create a new password",
    expires: "This link can be used once and expires after a short time.",
    ignore: "If you did not request this, you can ignore this email. Your current password will not change.",
    footer: "Spectrum Access sends this message to protect access to your account."
  }
};

export class SmtpEmailGateway implements EmailGateway {
  constructor(private readonly config: SmtpEmailGatewayConfig) {}

  async sendPasswordResetEmail(input: PasswordResetEmailInput): Promise<void> {
    const settings = this.readSettings();
    const transporter = createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.port === 465,
      requireTLS: settings.port === 587,
      auth: {
        user: settings.user,
        pass: settings.password
      }
    });

    const message = buildPasswordResetMessage(input);
    await transporter.sendMail({
      from: {
        name: "Spectrum Access Security",
        address: settings.from
      },
      replyTo: settings.from,
      to: input.to,
      subject: message.subject,
      html: message.html,
      text: message.text
    });
  }

  private readSettings() {
    const host = this.config.host?.trim() || defaultSmtpHost;
    const user = this.config.user?.trim() || defaultSender;
    const from = this.config.from?.trim() || defaultSender;
    const password = this.config.password?.trim();
    const port = Number.parseInt(this.config.port ?? `${defaultSmtpPort}`, 10);

    if (!password) {
      throw new Error("smtp-password-missing");
    }
    if (!Number.isFinite(port) || port < 1 || port > 65535) {
      throw new Error("smtp-port-invalid");
    }

    return { host, user, from, password, port };
  }
}

function buildPasswordResetMessage(input: PasswordResetEmailInput) {
  const copy = passwordResetCopy[input.locale];
  const safeDisplayName = input.displayName?.trim();
  const greeting =
    input.locale === "es"
      ? safeDisplayName
        ? `Hola, ${safeDisplayName}`
        : "Hola"
      : input.locale === "en"
        ? safeDisplayName
          ? `Hi, ${safeDisplayName}`
          : "Hi"
        : safeDisplayName
          ? `Hola, ${safeDisplayName}`
          : "Hola";

  return {
    subject: copy.subject,
    html: passwordResetHtml({
      ...copy,
      greeting,
      resetUrl: input.resetUrl
    }),
    text: passwordResetText({
      ...copy,
      greeting,
      resetUrl: input.resetUrl
    })
  };
}

function passwordResetHtml(input: PasswordResetCopy & { greeting: string; resetUrl: string }) {
  const resetUrl = escapeHtml(input.resetUrl);
  return `<!doctype html>
<html lang="ca">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(input.subject)}</title>
  </head>
  <body style="margin:0;background:#f7f2e8;color:#202426;font-family:Inter,Arial,sans-serif;">
    <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">
      ${escapeHtml(input.preview)}
    </span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f2e8;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fffdf8;border:1px solid #e4d6bb;border-radius:22px;overflow:hidden;">
            <tr>
              <td style="padding:28px 30px 18px;background:#25343c;color:#fffdf8;">
                <div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#dfc27d;">${escapeHtml(input.eyebrow)}</div>
                <div style="margin-top:14px;font-size:25px;line-height:1.2;font-weight:800;">Spectrum Access</div>
              </td>
            </tr>
            <tr>
              <td style="padding:34px 30px 30px;">
                <p style="margin:0 0 10px;font-size:15px;line-height:1.6;color:#526069;">${escapeHtml(input.greeting)},</p>
                <h1 style="margin:0 0 14px;font-size:30px;line-height:1.15;color:#202426;">${escapeHtml(input.title)}</h1>
                <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#3e474c;">${escapeHtml(input.body)}</p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
                  <tr>
                    <td style="border-radius:999px;background:#c6a349;">
                      <a href="${resetUrl}" style="display:inline-block;padding:14px 22px;color:#202426;font-size:15px;font-weight:800;text-decoration:none;border-radius:999px;">
                        ${escapeHtml(input.button)}
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#526069;">${escapeHtml(input.expires)}</p>
                <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#526069;">${escapeHtml(input.ignore)}</p>
                <p style="margin:0;font-size:12px;line-height:1.5;color:#69757c;word-break:break-all;">
                  ${resetUrl}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 30px;background:#f3ead9;border-top:1px solid #e4d6bb;color:#69757c;font-size:12px;line-height:1.5;">
                ${escapeHtml(input.footer)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function passwordResetText(input: PasswordResetCopy & { greeting: string; resetUrl: string }) {
  return `${input.greeting}

${input.title}

${input.body}

${input.button}: ${input.resetUrl}

${input.expires}
${input.ignore}

${input.footer}`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
