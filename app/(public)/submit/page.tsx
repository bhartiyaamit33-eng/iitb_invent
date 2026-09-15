import { redirect } from "next/navigation";
import { noIndex } from "@/lib/seo";

export const metadata = noIndex;

/** Public alias for the call-for-papers form at the bottom of /conference. */
export default function SubmitRedirectPage() {
  redirect("/conference#submit");
}
