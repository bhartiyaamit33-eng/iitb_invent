import { Role } from "@prisma/client";

/** Bootstrap allowlist used when provisioning the first administrator. */
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
 * Roles are stored in the database and refreshed on every request.
 */
export function requireRole(
  user: AuthUser | null | undefined,
  roles: Role | Role[],
): AuthUser {
  if (!user) {
    throw new AuthError("Authentication required", 401);
  }

  const needed = Array.isArray(roles) ? roles : [roles];

  if (needed.includes(user.role)) {
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
