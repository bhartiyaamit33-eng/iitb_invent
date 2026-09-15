import { sendEmail } from "@/lib/email/ses";
import { prisma } from "@/lib/db";
import { siteOrigin } from "@/lib/ticket";
import {
  accountCreatedEmail,
  conferenceApplicationCopyEmail,
  conferenceOrganiserNotifyEmail,
  conferenceStatusUpdateEmail,
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
  applyUrl?: string;
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

/** Account-created note after email signup or OAuth. Not an event place. */
export async function sendSignupThankYouForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });
  if (!user?.email) {
    return { ok: false as const, error: "User has no email" };
  }

  const origin = siteOrigin();
  return sendAccountCreated({
    to: user.email,
    name: user.name?.trim() || "there",
    dashboardUrl: `${origin}/dashboard`,
    applyUrl: `${origin}/conference`,
    userId: user.id,
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

export async function sendConferenceApplicationCopy(opts: {
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
  isPaperOrPoster?: boolean;
  participationCategory?: string;
}) {
  const tpl = conferenceApplicationCopyEmail(opts);
  return sendEmail({
    to: opts.to,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
    action: "email.conference_application_copy",
    actorId: opts.userId ?? null,
    entityType: "ConferenceApplication",
    entityId: opts.applicationId ?? null,
  });
}

export async function sendConferenceOrganiserNotify(opts: {
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
  const tpl = conferenceOrganiserNotifyEmail(opts);
  return sendEmail({
    to: opts.to,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
    action: "email.conference_application_notify",
    entityType: "ConferenceApplication",
    entityId: opts.applicationId ?? null,
  });
}

export async function sendConferenceStatusUpdate(opts: {
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
  const tpl = conferenceStatusUpdateEmail(opts);
  return sendEmail({
    to: opts.to,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
    action: "email.conference_status_update",
    actorId: opts.userId ?? null,
    entityType: "ConferenceApplication",
    entityId: opts.applicationId ?? null,
  });
}
