import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import {
  applicationStatusLabel,
  formatInrFromPaise,
  statusRequiresPayment,
} from "@/lib/conference";
import { conferencePayPath } from "@/lib/conference-server";
import { sendRegistrationConfirmed } from "@/lib/email/transactions";

export const CONFERENCE_TOKEN_COOKIE = "invent_conference_token";

export function conferenceCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 400,
    secure: process.env.NODE_ENV === "production",
  };
}

/** Same flags as the guest cookie so browsers actually drop it on logout. */
export function conferenceCookieClearOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    secure: process.env.NODE_ENV === "production",
  };
}

export function applicationFeeDue(app: {
  status: Parameters<typeof statusRequiresPayment>[0];
  paymentStatus: string;
}): boolean {
  return statusRequiresPayment(app.status) && app.paymentStatus === "UNPAID";
}

/** Amount and payment link are only for people organisers have selected. */
export function applicationPaymentVisible(app: {
  status: Parameters<typeof statusRequiresPayment>[0];
  paymentStatus: string;
}): boolean {
  return (
    statusRequiresPayment(app.status) && app.paymentStatus !== "NOT_REQUIRED"
  );
}

/** Ticket and check-in only after organisers select you and the fee is paid or waived. */
export function applicationGrantsTicket(app: {
  status: Parameters<typeof statusRequiresPayment>[0];
  paymentStatus: string;
}): boolean {
  return (
    statusRequiresPayment(app.status) &&
    (app.paymentStatus === "PAID" || app.paymentStatus === "WAIVED")
  );
}

export async function notifyUser(opts: {
  userId: string;
  title: string;
  body: string;
  href?: string | null;
}): Promise<void> {
  try {
    await prisma.userNotification.create({
      data: {
        userId: opts.userId,
        title: opts.title,
        body: opts.body,
        href: opts.href ?? null,
      },
    });
  } catch (err) {
    console.error("[conference] notify", err);
  }
}

/**
 * Mint (or reuse) the event Registration once an application is paid or waived.
 * Login and signup must not create this row.
 */
export async function issueEventTicketForApplication(
  applicationId: string,
  opts?: { notify?: boolean },
) {
  const application = await prisma.conferenceApplication.findUnique({
    where: { id: applicationId },
    include: { edition: true },
  });
  if (!application?.userId) return null;
  if (!applicationGrantsTicket(application)) return null;

  const existing = await prisma.registration.findUnique({
    where: {
      userId_editionId: {
        userId: application.userId,
        editionId: application.editionId,
      },
    },
  });
  const registration =
    existing ??
    (await prisma.registration.create({
      data: {
        userId: application.userId,
        editionId: application.editionId,
        status: "CONFIRMED",
        ticketCode: `INV${String(application.edition.year).slice(2)}-${randomBytes(3).toString("hex").toUpperCase()}`,
        qrToken: randomBytes(24).toString("hex"),
        source: "conference-payment",
      },
    }));

  if (existing && existing.source !== "conference-payment") {
    await prisma.registration.update({
      where: { id: existing.id },
      data: { source: "conference-payment", status: "CONFIRMED" },
    });
  }

  if (opts?.notify && !existing) {
    const user = await prisma.user.findUnique({
      where: { id: application.userId },
      select: { email: true, name: true },
    });
    await notifyUser({
      userId: application.userId,
      title: "Your INV.ENT ticket is ready",
      body: "Payment is confirmed. Your event ticket and QR code are on the dashboard. An account or an abstract is not a ticket; this confirmation is.",
      href: "/dashboard",
    });
    if (user?.email) {
      void sendRegistrationConfirmed({
        to: user.email,
        name: user.name?.trim() || application.name,
        editionName: application.edition.name,
        ticketCode: registration.ticketCode,
        eventDate: application.edition.startsAt.toISOString().slice(0, 10),
        userId: application.userId,
        registrationId: registration.id,
      }).catch(() => undefined);
    }
  }

  return registration;
}

export async function findMyConferenceApplication(opts: {
  userId?: string | null;
  email?: string | null;
  cookieToken?: string | null;
}) {
  const email = opts.email?.trim().toLowerCase() || null;
  const or: Array<
    | { userId: string }
    | { email: string }
    | { paymentToken: string }
  > = [];
  if (opts.userId) or.push({ userId: opts.userId });
  if (email) or.push({ email });
  // Cookie is only a guest fallback. A signed-in user must not inherit
  // another browser's leftover payment token.
  if (or.length === 0 && opts.cookieToken) {
    or.push({ paymentToken: opts.cookieToken });
  }
  if (or.length === 0) return null;

  return prisma.conferenceApplication.findFirst({
    where: { OR: or, edition: { isCurrent: true } },
    orderBy: { createdAt: "desc" },
  });
}

/** Link guest applications to this account and surface a pay notice if one is due. */
export async function attachConferenceToUser(user: {
  id: string;
  email: string;
}): Promise<void> {
  try {
    const email = user.email.trim().toLowerCase();
    await prisma.conferenceApplication.updateMany({
      where: { email },
      data: { userId: user.id },
    });

    const due = await prisma.conferenceApplication.findMany({
      where: {
        email,
        paymentStatus: "UNPAID",
        status: {
          in: ["SHORTLISTED_PAPER", "SHORTLISTED_POSTER", "ATTENDEE"],
        },
      },
    });

    for (const app of due) {
      const href = conferencePayPath(app.paymentToken, true);
      const existing = await prisma.userNotification.findFirst({
        where: { userId: user.id, href },
      });
      if (existing) continue;
      await notifyUser({
        userId: user.id,
        title: "Pay your conference registration fee",
        body: `${applicationStatusLabel(app.status)} · ${formatInrFromPaise(app.paymentAmountPaise)}. Open IIT Bombay Online Pay from this notice. You do not need to apply again.`,
        href,
      });
    }

    const ready = await prisma.conferenceApplication.findMany({
      where: {
        email,
        paymentStatus: { in: ["PAID", "WAIVED"] },
        status: {
          in: ["SHORTLISTED_PAPER", "SHORTLISTED_POSTER", "ATTENDEE"],
        },
      },
      select: { id: true },
    });
    for (const app of ready) {
      await issueEventTicketForApplication(app.id);
    }
  } catch (err) {
    console.error("[conference] attach", err);
  }
}

export async function userHasLiveEventTicket(
  userId: string,
  editionId: string,
): Promise<boolean> {
  const app = await prisma.conferenceApplication.findFirst({
    where: {
      userId,
      editionId,
      paymentStatus: { in: ["PAID", "WAIVED"] },
      status: {
        in: ["SHORTLISTED_PAPER", "SHORTLISTED_POSTER", "ATTENDEE"],
      },
    },
    select: { id: true },
  });
  return Boolean(app);
}

export async function revokeEventTicketIfUnqualified(
  userId: string,
  editionId: string,
): Promise<void> {
  if (await userHasLiveEventTicket(userId, editionId)) return;
  await prisma.registration.updateMany({
    where: {
      userId,
      editionId,
      source: "conference-payment",
      deletedAt: null,
    },
    data: { status: "CANCELLED" },
  });
}

export async function notifyApplicationStatus(opts: {
  userId?: string | null;
  email: string;
  name: string;
  statusLabel: string;
  message: string;
  paymentDue: boolean;
  amountLabel: string;
  paymentPath?: string;
}): Promise<void> {
  let userId = opts.userId ?? null;
  if (!userId) {
    const found = await prisma.user.findUnique({
      where: { email: opts.email.trim().toLowerCase() },
      select: { id: true },
    });
    userId = found?.id ?? null;
  }
  if (!userId) return;

  const href = opts.paymentDue && opts.paymentPath ? opts.paymentPath : "/dashboard";
  const title = opts.paymentDue
    ? "You're selected. Pay the registration fee"
    : `Application update: ${opts.statusLabel}`;
  const body = opts.paymentDue
    ? `${opts.message}\n\nFee ${opts.amountLabel}. Pay through IIT Bombay Online Pay from your dashboard. You do not fill the application form again.`
    : opts.message;

  await notifyUser({ userId, title, body, href });
}
