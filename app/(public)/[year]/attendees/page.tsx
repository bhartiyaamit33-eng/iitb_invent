import { redirect } from "next/navigation";
import { noIndex } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = noIndex;

export default function AttendeesPage() {
  redirect("/dashboard");
}
