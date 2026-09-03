import { sendEmail } from "@/lib/email/ses";
import {
  connectionRequestEmail,
  magicLinkEmail,
  profileConfirmationEmail,
  registrationConfirmedEmail,
} from "@/emails/templates";

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
