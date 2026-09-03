import { Role } from "@prisma/client";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { isAdminEmail } from "@/lib/auth/roles";

/** After OAuth/credentials sign-in: ensure Profile + current-edition Registration. */
export async function ensureAttendeeReady(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true, image: true, profile: true },
  });
  if (!user) return;

  // Defence: strip ADMIN if not allowlisted
  if (user.role === Role.ADMIN && !isAdminEmail(user.email)) {
    await prisma.user.update({
      where: { id: userId },
      data: { role: Role.ATTENDEE },
    });
  }

  if (!user.profile) {
    await prisma.profile.create({
      data: { userId, completeness: user.image ? 10 : 0 },
    });
  }

  const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
  if (!edition) return;

  const existing = await prisma.registration.findUnique({
    where: {
      userId_editionId: { userId, editionId: edition.id },
    },
  });
  if (existing) return;

  await prisma.registration.create({
    data: {
      userId,
      editionId: edition.id,
      status: "CONFIRMED",
      ticketCode: `INV${String(edition.year).slice(2)}-${randomBytes(3).toString("hex").toUpperCase()}`,
      qrToken: randomBytes(24).toString("hex"),
      source: "oauth",
    },
  });
}

/** Default post-login destination for attendees (never admin CMS). */
export function attendeeHome(callbackUrl?: string | null): string {
  const raw = callbackUrl?.trim() ?? "";
  if (raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/admin")) {
    if (raw === "/" || raw === "/login" || raw === "/signup") return "/dashboard";
    return raw;
  }
  return "/dashboard";
}
