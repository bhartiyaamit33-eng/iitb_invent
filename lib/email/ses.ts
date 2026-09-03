import {
  SESv2Client,
  SendEmailCommand,
} from "@aws-sdk/client-sesv2";
import { prisma } from "@/lib/db";

const region = process.env.AWS_REGION || process.env.SES_REGION || "ap-south-1";
const from =
  process.env.EMAIL_FROM ||
  process.env.SES_FROM_EMAIL ||
  "conference@iitbinvent.com";

const client = new SESv2Client({ region });

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
 * Cost-optimised SES send. Fails gracefully in sandbox when recipient
 * is not a verified identity — logs and returns ok:false (does not throw).
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const to = Array.isArray(input.to) ? input.to : [input.to];
  const action = input.action ?? "email.send";

  try {
    const out = await client.send(
      new SendEmailCommand({
        FromEmailAddress: from,
        Destination: { ToAddresses: to },
        Content: {
          Simple: {
            Subject: { Data: input.subject, Charset: "UTF-8" },
            Body: {
              Html: { Data: input.html, Charset: "UTF-8" },
              ...(input.text
                ? { Text: { Data: input.text, Charset: "UTF-8" } }
                : {}),
            },
          },
        },
      }),
    );

    const messageId = out.MessageId ?? "unknown";
    console.info("[ses] sent", { to, subject: input.subject, messageId, from, region });

    await prisma.auditLog
      .create({
        data: {
          actorId: input.actorId ?? null,
          action,
          entityType: input.entityType ?? "Email",
          entityId: input.entityId ?? null,
          after: { to, subject: input.subject, messageId, from, region },
        },
      })
      .catch((err) => console.warn("[ses] audit log failed", err));

    return { ok: true, messageId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const sandboxHint =
      /not verified|MessageRejected|Email address is not verified/i.test(
        message,
      );

    console.error("[ses] send failed", {
      to,
      subject: input.subject,
      from,
      region,
      message,
      sandboxHint,
    });

    await prisma.auditLog
      .create({
        data: {
          actorId: input.actorId ?? null,
          action: `${action}.failed`,
          entityType: input.entityType ?? "Email",
          entityId: input.entityId ?? null,
          after: { to, subject: input.subject, from, region, error: message, sandboxHint },
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
