import { sendEmail } from "@/lib/email/ses";
import { formatInr } from "@/lib/payments/pricing";
import {
  accountCreatedEmail,
  connectionRequestEmail,
  magicLinkEmail,
  paymentLinkEmail,
  paymentReceiptEmail,
  profileConfirmationEmail,
  registrationConfirmedEmail,
} from "@/emails/templates";

export async function sendAccountCreated(opts: {
  to: string;
  name: string;
  editionName?: string | null;
  dashboardUrl: string;
  ticketCode?: string | null;
  eventDate?: string | null;
  userId?: string;
}) {
  const tpl = accountCreatedEmail(opts);
  return sendEmail({
    to: opts.to,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
    action: "email.account_created",
    actorId: opts.userId ?? null,
    entityType: "User",
    entityId: opts.userId ?? null,
  });
}

export async function sendRegistrationConfirmed(opts: {
  to: string;
  name: string;
  editionName: string;
  ticketCode: string;
  eventDate: string;
  userId?: string;
  registrationId?: string;
}) {
  const tpl = registrationConfirmedEmail(opts);
  return sendEmail({
    to: opts.to,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
    action: "email.registration_confirmed",
    actorId: opts.userId ?? null,
    entityType: "Registration",
    entityId: opts.registrationId ?? null,
  });
}

export async function sendProfileConfirmation(opts: {
  to: string;
  name: string;
  isFirstSave: boolean;
  userId?: string;
}) {
  const tpl = profileConfirmationEmail(opts);
  return sendEmail({
    to: opts.to,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
    action: opts.isFirstSave
      ? "email.profile_created"
      : "email.profile_updated",
    actorId: opts.userId ?? null,
    entityType: "Profile",
    entityId: opts.userId ?? null,
  });
}

/** Stub Auth.js magic-link sender — wire as EmailProvider sendVerificationRequest. */
export async function sendMagicLink(opts: {
  to: string;
  url: string;
  name?: string;
}) {
  const tpl = magicLinkEmail(opts);
  return sendEmail({
    to: opts.to,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
    action: "email.magic_link",
    entityType: "Auth",
  });
}

export async function sendConnectionRequest(opts: {
  to: string;
  toName: string;
  fromName: string;
  fromEmail: string;
  fromPhone?: string | null;
  fromLinkedIn?: string | null;
  fromHeadline?: string | null;
  message: string;
  editionName: string;
  actorId?: string;
  requestId?: string;
}) {
  const tpl = connectionRequestEmail(opts);
  return sendEmail({
    to: opts.to,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
    action: "email.connection_request",
    actorId: opts.actorId ?? null,
    entityType: "ConnectionRequest",
    entityId: opts.requestId ?? null,
  });
}

export async function sendPaymentLinkEmail(opts: {
  to: string;
  name: string;
  editionName: string;
  kindLabel: string;
  title: string;
  categoryLabel: string;
  amountInr: string;
  purpose: string;
  payUrl: string;
  userId?: string;
  paymentId?: string;
}) {
  const tpl = paymentLinkEmail({
    ...opts,
    amountFormatted: formatInr(opts.amountInr),
  });
  return sendEmail({
    to: opts.to,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
    action: "email.payment_link",
    actorId: opts.userId ?? null,
    entityType: "Payment",
    entityId: opts.paymentId ?? null,
  });
}

export async function sendPaymentReceiptEmail(opts: {
  to: string;
  name: string;
  editionName: string;
  invoiceNumber: string;
  purpose: string;
  amountInr: string;
  transId?: string | null;
  refNo?: string | null;
  receiptUrl: string;
  userId?: string;
  paymentId?: string;
  pdf: Buffer;
  filename: string;
}) {
  const tpl = paymentReceiptEmail({
    name: opts.name,
    editionName: opts.editionName,
    invoiceNumber: opts.invoiceNumber,
    purpose: opts.purpose,
    amountFormatted: formatInr(opts.amountInr),
    transId: opts.transId,
    refNo: opts.refNo,
    receiptUrl: opts.receiptUrl,
  });
  return sendEmail({
    to: opts.to,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
    attachments: [
      {
        filename: opts.filename,
        contentType: "application/pdf",
        bytes: opts.pdf,
      },
    ],
    action: "email.payment_receipt",
    actorId: opts.userId ?? null,
    entityType: "Payment",
    entityId: opts.paymentId ?? null,
  });
}
