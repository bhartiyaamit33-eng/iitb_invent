import Link from "next/link";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/sessions", label: "Programme" },
  { href: "/admin/speakers", label: "Speakers" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/faqs", label: "FAQs" },
  { href: "/admin/stats", label: "Stats" },
  { href: "/admin/editions", label: "Editions" },
];

export function AdminNav() {
  return (
    <nav className="flex flex-wrap gap-2 border-b border-line bg-paper px-6 py-3">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-teal-deep hover:border-teal"
        >
          {l.label}
        </Link>
      ))}
      <Link
        href="/programme"
        className="rounded-full border border-transparent px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-mute hover:text-teal-deep"
      >
        Public programme ↗
      </Link>
    </nav>
  );
}
