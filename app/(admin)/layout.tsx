import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AuthError, requireRole } from "@/lib/auth/roles";
import { Role } from "@prisma/client";
import { logoutAction } from "@/app/(public)/login/actions";
import { AdminNav } from "@/components/admin/AdminNav";

/**
 * Server-side lock for all `/admin/*` routes.
 * Only ADMIN_EMAILS (default admin@iitbinvent.com) with role ADMIN.
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/admin")}`);
  }

  try {
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
        <form action={logoutAction} className="mt-8">
          <button
            type="submit"
            className="text-sm font-semibold text-teal-deep underline-offset-2 hover:underline"
          >
            Sign out
          </button>
        </form>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <p className="text-sm text-mute">
            CMS · <span className="font-medium text-ink">{user.email}</span>
          </p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm font-semibold text-teal-deep underline-offset-2 hover:underline"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
      <AdminNav />
      <div className="mx-auto max-w-6xl">{children}</div>
    </div>
  );
}
