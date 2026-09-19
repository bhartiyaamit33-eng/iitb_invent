import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { noIndex } from "@/lib/seo";
import { LOGIN_TO_SUBMIT_HREF, SUBMIT_HREF } from "@/lib/landing";

export const metadata = noIndex;

/** Public alias for the call-for-papers form. Requires login first. */
export default async function SubmitRedirectPage() {
  const user = await getCurrentUser();
  redirect(user ? SUBMIT_HREF : LOGIN_TO_SUBMIT_HREF);
}
