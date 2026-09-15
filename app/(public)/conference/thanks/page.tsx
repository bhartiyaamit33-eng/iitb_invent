import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Application received · INV.ENT",
};

export default async function ConferenceThanksPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard?submitted=1");
  }
  redirect(`/login?callbackUrl=${encodeURIComponent("/dashboard?submitted=1")}`);
}
