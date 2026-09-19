import { redirect } from "next/navigation";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Programme",
  description:
    "IITB INV.ENT 2027 programme — coming soon. 30-31 January 2027, IIT Bombay.",
  path: "/programme",
});

export default function SessionDetailPage() {
  redirect("/programme");
}
