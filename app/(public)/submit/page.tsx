import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export default async function SubmitRedirectPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?callbackUrl=/dashboard/submissions");
  }
  redirect("/dashboard/submissions");
}
