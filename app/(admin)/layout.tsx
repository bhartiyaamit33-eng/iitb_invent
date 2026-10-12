import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { AuthError, requireRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { noIndex } from "@/lib/seo";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SignOutForm } from "@/components/SignOutForm";
import "@/app/admin.css";

export const metadata: Metadata = { ...noIndex, title: "Admin" };

/**
 * Server-side lock for all `/admin/*` routes.
 * ADMIN grants are stored in the database and checked on every request.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/admin")}`);
  }

  try {
    requireRole(user, Role.ADMIN);
  } catch (err) {
    const message = err instanceof AuthError ? err.message : "Admin access denied";
    return (
      <main className="adm-denied">
        <div>
          <h1 className="adm-title" style={{ fontSize: 26 }}>
            This area is for organisers
          </h1>
          <p className="adm-desc" style={{ margin: "10px auto 0" }}>
            {message}. You are signed in as {user.email}. Ask an administrator to
            grant your account access, or sign in with a different account.
          </p>
          <div className="adm-actions" style={{ justifyContent: "center", marginTop: 20 }}>
            <Link href="/dashboard" className="adm-btn">
              Go to your dashboard
            </Link>
            <SignOutForm buttonClassName="adm-btn is-quiet">Sign out</SignOutForm>
          </div>
        </div>
      </main>
    );
  }

  const edition = await prisma.edition.findFirst({
    where: { isCurrent: true },
    select: { id: true, name: true },
  });
  const [awaitingDecision, unconfirmedPayments] = await Promise.all([
    edition
      ? prisma.conferenceApplication.count({
          where: { editionId: edition.id, status: "RECEIVED" },
        })
      : 0,
    prisma.gatewayPayment.count({
      where: { verified: false, imtStatus: { in: ["S", "DIRECT_RECON"] } },
    }),
  ]);

  return (
    <div className="adm">
      <AdminSidebar
        editionName={edition?.name ?? null}
        userName={user.name}
        userEmail={user.email}
        awaitingDecision={awaitingDecision}
        unconfirmedPayments={unconfirmedPayments}
      />
      <main className="adm-main" id="main">
        {children}
      </main>
    </div>
  );
}
