import {
  SESv2Client,
  SendEmailCommand,
} from "@aws-sdk/client-sesv2";
import nodemailer, { type Transporter } from "nodemailer";
import { prisma } from "@/lib/db";

/**
 * Outgoing mail. With SMTP_HOST set, mail goes through that relay (the IIT
 * Bombay relay smtp-auth.iitb.ac.in:587 with an LDAP login, as on the
 * department's other sites); otherwise through AWS SES.
 */
const region = process.env.AWS_REGION || process.env.SES_REGION || "ap-south-1";
const from =
  process.env.EMAIL_FROM ||
  process.env.SES_FROM_EMAIL ||
  "conference@iitbinvent.com";
const fromName = process.env.EMAIL_FROM_NAME || "IITB INV.ENT";

const client = new SESv2Client({ region });

let smtp: Transporter | null | undefined;

function smtpTransport(): Transporter | null {
  if (smtp !== undefined) return smtp;
  const host = (process.env.SMTP_HOST || "").trim();
  if (!host) return (smtp = null);
  const port = Number(process.env.SMTP_PORT || 587);
  smtp = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || "" }
      : undefined,
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 30_000,
  });
  return smtp;
}

/** Which route mail takes, for logs and the audit trail. */
function transportName(): string {
  return smtpTransport() ? `smtp:${process.env.SMTP_HOST}` : `ses:${region}`;
}

async function deliver(input: SendEmailInput, to: string[]): Promise<string> {
  const transport = smtpTransport();
  if (transport) {
    const info = await transport.sendMail({
      from: { name: fromName, address: from },
      to,
      subject: input.subject,
      html: input.html,
      ...(input.text ? { text: input.text } : {}),
    });
    return info.messageId || "unknown";
  }
  const out = await client.send(
    new SendEmailCommand({
      FromEmailAddress: from,
      Destination: { ToAddresses: to },
      Content: {
        Simple: {
          Subject: { Data: input.subject, Charset: "UTF-8" },
          Body: {
            Html: { Data: input.html, Charset: "UTF-8" },
            ...(input.text ? { Text: { Data: input.text, Charset: "UTF-8" } } : {}),
          },
        },
      },
    }),
  );
  return out.MessageId ?? "unknown";
}

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  /** Audit / log context */
  action?: string;
  actorId?: string | null;
  entityType?: string;
  entityId?: string | null;
};

export type SendEmailResult =
  | { ok: true; messageId: string }
  | { ok: false; error: string; sandboxHint?: boolean };

/**
 * Send one email. Never throws: a failure is logged, written to the audit
 * trail and returned as ok:false (e.g. an SES sandbox or relay refusal).
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const to = Array.isArray(input.to) ? input.to : [input.to];
  const action = input.action ?? "email.send";
  const via = transportName();

  try {
    const messageId = await deliver(input, to);
    console.info("[mail] sent", { to, subject: input.subject, messageId, from, via });

    await prisma.auditLog
      .create({
        data: {
          actorId: input.actorId ?? null,
          action,
          entityType: input.entityType ?? "Email",
          entityId: input.entityId ?? null,
          after: { to, subject: input.subject, messageId, from, via },
        },
      })
      .catch((err) => console.warn("[mail] audit log failed", err));

    return { ok: true, messageId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const sandboxHint =
      /not verified|MessageRejected|Email address is not verified/i.test(
        message,
      );

    console.error("[mail] send failed", { to, subject: input.subject, from, via, message, sandboxHint });

    await prisma.auditLog
      .create({
        data: {
          actorId: input.actorId ?? null,
          action: `${action}.failed`,
          entityType: input.entityType ?? "Email",
          entityId: input.entityId ?? null,
          after: { to, subject: input.subject, from, via, error: message, sandboxHint },
        },
      })
      .catch(() => undefined);

    return { ok: false, error: message, sandboxHint };
  }
}

export function getEmailFromAddress(): string {
  return from;
}

export function getSesRegion(): string {
  return region;
}
