import { prisma } from "@/lib/db";
import type { AuthUser } from "@/lib/auth/roles";
import { isAdminEmail } from "@/lib/auth/roles";
import { Role } from "@prisma/client";

/**
 * Session lookup for M1.
 * Full Auth.js wiring lands in M3 — until then we resolve via:
 * 1) `x-invent-user-email` header (trusted only behind our own server tests), or
 * 2) nothing → null (admin routes 401/403).
 *
 * When Auth.js is live, replace this with `auth()` from next-auth.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  // Dynamic import of headers keeps this usable from Server Components.
  const { headers } = await import("next/headers");
  const h = await headers();
  const email =
    h.get("x-invent-user-email")?.trim().toLowerCase() ||
    h.get("x-user-email")?.trim().toLowerCase() ||
    null;

  if (!email) return null;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!user || user.role === undefined) return null;

  // Defence in depth: strip ADMIN if email left the allowlist.
  if (user.role === Role.ADMIN && !isAdminEmail(user.email)) {
    return { ...user, role: Role.ATTENDEE };
  }

  return user;
}
