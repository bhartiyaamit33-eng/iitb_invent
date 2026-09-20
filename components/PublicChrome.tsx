import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { signedInLabel } from "@/lib/site";
import { SiteShell } from "@/components/site/SiteShell";

export async function PublicChrome({
  children,
  crumbs,
}: {
  children: ReactNode;
  crumbs?: { href: string; label: string }[];
}) {
  const user = await getCurrentUser().catch(() => null);
  return (
    <SiteShell signedInName={signedInLabel(user)} crumbs={crumbs}>
      {children}
    </SiteShell>
  );
}
