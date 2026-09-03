import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { AuthError, requireRole } from "@/lib/auth/roles";
import { Role } from "@prisma/client";

/**
 * Server-side lock for all `/admin/*` routes.
 * Only ADMIN_EMAILS (default admin@iitbinvent.com) with role ADMIN.
 * Attendees/speakers → 403.
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  try {
    const user = await getCurrentUser();
    requireRole(user, Role.ADMIN);
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 403;
    const message =
      err instanceof AuthError ? err.message : "Admin access denied";
    return (
      <main className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
          {status}
        </p>
        <h1 className="mt-3 font-display text-3xl text-teal-deep">
          Access denied
        </h1>
        <p className="mt-4 text-ink-soft">{message}</p>
        <p className="mt-2 text-sm text-mute">
          Admin UI is limited to allowlisted organisers.
        </p>
      </main>
    );
  }

  return children;
}
