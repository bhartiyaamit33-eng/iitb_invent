import { Role } from "@prisma/client";

/**
 * Hard allowlist for ADMIN (and elevation to ADMIN).
 * Override with comma-separated ADMIN_EMAILS in env.
 * Attendees/speakers must never pass requireRole("ADMIN").
 */
export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "admin@iitbinvent.com";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}

/** Only allowlisted emails may hold or be promoted to ADMIN. */
export function canHoldAdminRole(email: string): boolean {
  return isAdminEmail(email);
}

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 403) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

/**
 * Server-side gate for privileged routes / mutations.
 * - If Role.ADMIN is among allowed roles, allowlisted ADMIN emails pass
 * - Other listed roles (e.g. ORGANISER) pass on exact role match
 * - ATTENDEE / SPEAKER / VOLUNTEER never satisfy ADMIN
 */
export function requireRole(
  user: AuthUser | null | undefined,
  roles: Role | Role[],
): AuthUser {
  if (!user) {
    throw new AuthError("Authentication required", 401);
  }

  // Defence in depth: never honour ADMIN without allowlist.
  if (user.role === Role.ADMIN && !isAdminEmail(user.email)) {
    throw new AuthError("Admin access denied", 403);
  }

  const needed = Array.isArray(roles) ? roles : [roles];

  if (user.role === Role.ADMIN && needed.includes(Role.ADMIN) && isAdminEmail(user.email)) {
    return user;
  }

  if (user.role !== Role.ADMIN && needed.includes(user.role)) {
    return user;
  }

  if (needed.includes(Role.ADMIN)) {
    throw new AuthError("Admin access denied", 403);
  }

  throw new AuthError("Insufficient role", 403);
}

export function requireAdmin(user: AuthUser | null | undefined): AuthUser {
  return requireRole(user, Role.ADMIN);
}

/** ORGANISER or allowlisted ADMIN. */
export function requireOrganiserOrAdmin(
  user: AuthUser | null | undefined,
): AuthUser {
  return requireRole(user, [Role.ORGANISER, Role.ADMIN]);
}
