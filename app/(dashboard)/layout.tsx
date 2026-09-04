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
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-3">
          <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold">
            <Link href="/" className="text-teal-deep">
              Inv.ent
            </Link>
            <Link href="/dashboard" className="text-ink-soft hover:text-teal-deep">
              Dashboard
            </Link>
            <Link href="/dashboard/profile" className="text-ink-soft hover:text-teal-deep">
              Profile
            </Link>
            <Link href="/dashboard/ventures" className="text-ink-soft hover:text-teal-deep">
              Ventures
            </Link>
            <Link href="/ventures" className="text-ink-soft hover:text-teal-deep">
              Directory
            </Link>
            <Link href="/programme" className="text-ink-soft hover:text-teal-deep">
              Programme
            </Link>
            {isAdminEmail(user.email) ? (
              <Link href="/admin" className="text-ink-soft hover:text-teal-deep">
                Admin
              </Link>
            ) : null}
          </nav>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm font-semibold text-mute underline-offset-2 hover:text-teal-deep hover:underline"
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
