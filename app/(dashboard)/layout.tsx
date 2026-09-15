import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { SignOutForm } from "@/components/SignOutForm";
import { attachConferenceToUser } from "@/lib/conference-access";
import { Role } from "@prisma/client";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = noIndex;

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/dashboard")}`);
  }

  await attachConferenceToUser({ id: user.id, email: user.email });

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-3">
          <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold">
            <Link href="/" className="text-teal-deep">
              IITB INV.ENT
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
            <Link href="/conference" className="text-ink-soft hover:text-teal-deep">
              Conference
            </Link>
            {user.role === Role.REVIEWER || user.role === Role.ADMIN ? (
              <Link
                href="/dashboard/reviews"
                className="text-ink-soft hover:text-teal-deep"
              >
                Reviews
              </Link>
            ) : null}
            {user.role === Role.ADMIN ? (
              <Link href="/admin" className="text-ink-soft hover:text-teal-deep">
                Admin
              </Link>
            ) : null}
          </nav>
          <SignOutForm buttonClassName="text-sm font-semibold text-mute underline-offset-2 hover:text-teal-deep hover:underline" />
        </div>
      </header>
      {children}
    </div>
  );
}
