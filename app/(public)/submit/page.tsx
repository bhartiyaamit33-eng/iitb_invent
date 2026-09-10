import { redirect } from "next/navigation";
import { noIndex } from "@/lib/seo";

export const metadata = noIndex;

/** Public alias for the call-for-applications form. */
export default function SubmitRedirectPage() {
  redirect("/conference");
}
