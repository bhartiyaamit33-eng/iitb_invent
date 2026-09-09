import { sendEmail } from "@/lib/email/ses";
import {
  accountCreatedEmail,
  colloquiumApplicationCopyEmail,
  colloquiumOrganiserNotifyEmail,
  colloquiumStatusUpdateEmail,
  connectionRequestEmail,
  magicLinkEmail,
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

export async function sendColloquiumApplicationCopy(opts: {
  to: string;
  name: string;
  email: string;
  phone: string;
  institution: string;
  professional: string;
  phdYear: string;
  seekingPostdoc: string;
  participation: string;
  paperTitle: string;
  abstractFileName: string;
  eventName: string;
  userId?: string | null;
  applicationId?: string;
}) {
  const tpl = colloquiumApplicationCopyEmail(opts);
  return sendEmail({
    to: opts.to,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
    action: "email.colloquium_application_copy",
    actorId: opts.userId ?? null,
    entityType: "ColloquiumApplication",
    entityId: opts.applicationId ?? null,
  });
}

export async function sendColloquiumOrganiserNotify(opts: {
  to: string;
  name: string;
  email: string;
  institution: string;
  participation: string;
  paperTitle: string;
  eventName: string;
  adminUrl: string;
  applicationId?: string;
}) {
  const tpl = colloquiumOrganiserNotifyEmail(opts);
  return sendEmail({
    to: opts.to,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
    action: "email.colloquium_application_notify",
    entityType: "ColloquiumApplication",
    entityId: opts.applicationId ?? null,
  });
}

export async function sendColloquiumStatusUpdate(opts: {
  to: string;
  name: string;
  statusLabel: string;
  message: string;
  includePayment: boolean;
  amountLabel: string;
  paymentUrl: string;
  dashboardUrl: string;
  eventName: string;
  userId?: string | null;
  applicationId?: string;
}) {
  const tpl = colloquiumStatusUpdateEmail(opts);
  return sendEmail({
    to: opts.to,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
    action: "email.colloquium_status_update",
    actorId: opts.userId ?? null,
    entityType: "ColloquiumApplication",
    entityId: opts.applicationId ?? null,
  });
}
