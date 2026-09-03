import { auth } from "@/auth";
import type { AuthUser } from "@/lib/auth/roles";
import { isAdminEmail } from "@/lib/auth/roles";
import { Role } from "@prisma/client";

/**
 * Resolve the signed-in user from Auth.js (JWT session).
 * Falls back to null when unauthenticated.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return null;

  const email = session.user.email.trim().toLowerCase();
  let role = session.user.role ?? Role.ATTENDEE;
  // Defence in depth: strip ADMIN if email left the allowlist.
  if (role === Role.ADMIN && !isAdminEmail(email)) {
    role = Role.ATTENDEE;
  }

  return {
    id: session.user.id,
    email,
    name: session.user.name ?? "",
    role,
  };
}
