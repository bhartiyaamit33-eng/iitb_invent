import { prisma } from "@/lib/db";
import { attachConferenceToUser } from "@/lib/conference-access";

/** After OAuth/credentials sign-in: ensure Profile. Do not mint an event ticket. */
export async function ensureAttendeeReady(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true, image: true, profile: true },
  });
  if (!user) return;

  if (!user.profile) {
    await prisma.profile.create({
      data: { userId, completeness: user.image ? 10 : 0 },
    });
  }

  await attachConferenceToUser({ id: user.id, email: user.email });
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
