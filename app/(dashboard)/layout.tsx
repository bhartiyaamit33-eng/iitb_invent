import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdminEmail } from "@/lib/auth/roles";
import { logoutAction } from "@/app/(public)/login/actions";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/dashboard")}`);
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-3xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold">
            <Link href="/" className="py-2 text-teal-deep sm:py-0">
              Inv.ent
            </Link>
            <Link href="/dashboard" className="py-2 text-ink-soft hover:text-teal-deep sm:py-0">
              Dashboard
            </Link>
            <Link href="/dashboard/submissions" className="py-2 text-ink-soft hover:text-teal-deep sm:py-0">
              Submissions
            </Link>
            <Link href="/dashboard/profile" className="py-2 text-ink-soft hover:text-teal-deep sm:py-0">
              Profile
            </Link>
            <Link href="/dashboard/ventures" className="py-2 text-ink-soft hover:text-teal-deep sm:py-0">
              Ventures
            </Link>
            <Link href="/ventures" className="py-2 text-ink-soft hover:text-teal-deep sm:py-0">
              Directory
            </Link>
            <Link href="/programme" className="py-2 text-ink-soft hover:text-teal-deep sm:py-0">
              Programme
            </Link>
            {isAdminEmail(user.email) ? (
              <Link href="/admin" className="py-2 text-ink-soft hover:text-teal-deep sm:py-0">
                Admin
              </Link>
            ) : null}
          </nav>
          <form action={logoutAction} className="shrink-0">
            <button
              type="submit"
              className="py-2 text-sm font-semibold text-mute underline-offset-2 hover:text-teal-deep hover:underline sm:py-0"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
