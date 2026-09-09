import { prisma } from "@/lib/db";
import {
  applicationStatusLabel,
  formatInrFromPaise,
  statusRequiresPayment,
} from "@/lib/conference";
import { conferencePayPath } from "@/lib/conference-server";

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

export function applicationFeeDue(app: {
  status: Parameters<typeof statusRequiresPayment>[0];
  paymentStatus: string;
}): boolean {
  return statusRequiresPayment(app.status) && app.paymentStatus === "UNPAID";
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
        body: `${applicationStatusLabel(app.status)} · ${formatInrFromPaise(app.paymentAmountPaise)}. Open PayU from this notice — you do not need to apply again.`,
        href,
      });
    }
  } catch (err) {
    console.error("[conference] attach", err);
  }
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
    ? "You're selected — pay the registration fee"
    : `Application update: ${opts.statusLabel}`;
  const body = opts.paymentDue
    ? `${opts.message}\n\nFee ${opts.amountLabel}. Pay through the IIT Bombay PayU gateway from your dashboard. You do not fill the application form again.`
    : opts.message;

  await notifyUser({ userId, title, body, href });
}
