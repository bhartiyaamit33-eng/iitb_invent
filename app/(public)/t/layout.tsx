import type { Metadata } from "next";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = noIndex;

export default function TicketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
