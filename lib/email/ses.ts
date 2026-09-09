import {
  SESv2Client,
  SendEmailCommand,
} from "@aws-sdk/client-sesv2";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";

const region = process.env.AWS_REGION || process.env.SES_REGION || "ap-south-1";
const from =
  process.env.EMAIL_FROM ||
  process.env.SES_FROM_EMAIL ||
  "conference@iitbinvent.com";

const client = new SESv2Client({ region });

export type EmailAttachment = {
  filename: string;
  contentType: string;
  bytes: Buffer;
};

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
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
    const attachments = input.attachments ?? [];
    const content =
      attachments.length > 0
        ? {
            Raw: {
              Data: buildRawMime({
                from,
                to,
                subject: input.subject,
                html: input.html,
                text: input.text,
                attachments,
              }),
            },
          }
        : {
            Simple: {
              Subject: { Data: input.subject, Charset: "UTF-8" },
              Body: {
                Html: { Data: input.html, Charset: "UTF-8" },
                ...(input.text
                  ? { Text: { Data: input.text, Charset: "UTF-8" } }
                  : {}),
              },
            },
          };

    const out = await client.send(
      new SendEmailCommand({
        FromEmailAddress: from,
        Destination: { ToAddresses: to },
        Content: content,
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

function encodeRfc2047(value: string): string {
  if (/^[\x20-\x7E]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function foldBase64(value: string): string {
  return value.replace(/(.{76})/g, "$1\r\n").trimEnd();
}

function buildRawMime(opts: {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text?: string;
  attachments: EmailAttachment[];
}): Uint8Array {
  const mixed = `----=_Invent_Mixed_${randomBytes(12).toString("hex")}`;
  const alt = `----=_Invent_Alt_${randomBytes(12).toString("hex")}`;
  const toHeader = opts.to.join(", ");
  const lines: string[] = [
    `From: ${opts.from}`,
    `To: ${toHeader}`,
    `Subject: ${encodeRfc2047(opts.subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${mixed}"`,
    "",
    `--${mixed}`,
    `Content-Type: multipart/alternative; boundary="${alt}"`,
    "",
    `--${alt}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: quoted-printable",
    "",
    toQuotedPrintable(opts.text ?? stripHtml(opts.html)),
    `--${alt}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: quoted-printable",
    "",
    toQuotedPrintable(opts.html),
    `--${alt}--`,
  ];

  for (const att of opts.attachments) {
    const safeName = att.filename.replace(/["\r\n]/g, "_");
    lines.push(
      `--${mixed}`,
      `Content-Type: ${att.contentType}; name="${safeName}"`,
      `Content-Disposition: attachment; filename="${safeName}"`,
      "Content-Transfer-Encoding: base64",
      "",
      foldBase64(att.bytes.toString("base64")),
    );
  }

  lines.push(`--${mixed}--`, "");
  return Buffer.from(lines.join("\r\n"), "utf8");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function toQuotedPrintable(input: string): string {
  const buf = Buffer.from(input, "utf8");
  let out = "";
  let lineLen = 0;
  for (const byte of buf) {
    const printable =
      byte === 0x09 || (byte >= 0x20 && byte <= 0x7e && byte !== 0x3d);
    const chunk = printable
      ? String.fromCharCode(byte)
      : `=${byte.toString(16).toUpperCase().padStart(2, "0")}`;
    if (lineLen + chunk.length >= 75) {
      out += "=\r\n";
      lineLen = 0;
    }
    out += chunk;
    lineLen += chunk.length;
  }
  return out;
}
