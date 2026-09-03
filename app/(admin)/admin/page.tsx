import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [
    users,
    registrations,
    sessions,
    speakers,
    pages,
    faqs,
    stats,
    edition,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.registration.count(),
    prisma.session_.count({ where: { deletedAt: null } }),
    prisma.speaker.count({ where: { deletedAt: null } }),
    prisma.page.count(),
    prisma.faq.count(),
    prisma.editionStat.count(),
    prisma.edition.findFirst({ where: { isCurrent: true } }),
  ]);

  const cards = [
    { label: "Users", value: users, href: "/admin/users" },
    { label: "Registrations", value: registrations, href: "/admin/users" },
    { label: "Sessions", value: sessions, href: "/admin/sessions" },
    { label: "Speakers", value: speakers, href: "/admin/speakers" },
    { label: "Pages", value: pages, href: "/admin/pages" },
    { label: "FAQs", value: faqs, href: "/admin/faqs" },
    { label: "Stats", value: stats, href: "/admin/stats" },
  ];

  return (
    <main className="px-6 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
        Admin CMS
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-wide text-teal-deep">
        Overview
      </h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Current edition:{" "}
        <strong className="text-ink">{edition?.name ?? "—"}</strong>. Edit the
        DSSE Day programme mock, speakers, site copy, and every registered user
        from the nav above.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-xl border border-line bg-white p-5 hover:border-teal"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mute">
              {c.label}
            </p>
            <p className="mt-2 text-3xl font-semibold text-teal-deep">{c.value}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
