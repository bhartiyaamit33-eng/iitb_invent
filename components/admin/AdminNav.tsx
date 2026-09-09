import Link from "next/link";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/submissions", label: "Submissions" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/sessions", label: "Programme" },
  { href: "/admin/speakers", label: "Speakers" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/faqs", label: "FAQs" },
  { href: "/admin/stats", label: "Stats" },
  { href: "/admin/editions", label: "Editions" },
  { href: "/admin/checkin", label: "Check-in" },
];

export function AdminNav() {
  return (
    <nav className="flex gap-2 overflow-x-auto border-b border-line bg-paper px-4 py-3 sm:flex-wrap sm:overflow-visible sm:px-6">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="shrink-0 whitespace-nowrap rounded-full border border-line bg-white px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-teal-deep hover:border-teal sm:py-1.5"
        >
          {l.label}
        </Link>
      ))}
      <Link
        href="/programme"
        className="shrink-0 whitespace-nowrap rounded-full border border-transparent px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-mute hover:text-teal-deep sm:py-1.5"
      >
        Public programme ↗
      </Link>
    </nav>
  );
}
