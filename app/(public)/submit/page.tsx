import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { noIndex } from "@/lib/seo";

export const metadata = noIndex;

export default async function SubmitRedirectPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?callbackUrl=/dashboard/submissions");
  }
  redirect("/dashboard/submissions");
}
