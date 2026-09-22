import { getCurrentUser } from "@/lib/auth/session";
import { REGISTER_HREF, registerHrefFor } from "@/lib/landing";

export type SiteChrome = {
  signedInName: string | null;
  registerHref: string;
};

/**
 * Header/footer state for every public page. Registration is the same desk as
 * submission, so "Register" lands on the form (via login when signed out).
 */
export async function getSiteChrome(): Promise<SiteChrome> {
  const user = await getCurrentUser().catch(() => null);
  const signedInName = user
    ? user.name.trim().split(/\s+/)[0] || user.name || "Account"
    : null;
  return {
    signedInName,
    registerHref: signedInName ? "/dashboard" : registerHrefFor(false),
  };
}

export { REGISTER_HREF };
