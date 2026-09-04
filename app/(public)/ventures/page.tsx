import Link from "next/link";
import { VentureKind } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { VentureCard } from "@/components/VentureCard";
import { VENTURE_KIND_LABEL } from "@/lib/ventures";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ kind?: string }>;

export default async function VenturesDirectoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const kind =
    sp.kind === "STARTUP" || sp.kind === "PROJECT" || sp.kind === "IDEA"
      ? (sp.kind as VentureKind)
      : undefined;

  const user = await getCurrentUser();
  const ventures = await prisma.venture.findMany({
    where: {
      deletedAt: null,
      isPublished: true,
      ...(kind ? { kind } : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: { user: { select: { name: true } } },
    take: 200,
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
        IIT Bombay · Inv.ent
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-wide text-teal-deep">
        Startups &amp; projects
      </h1>
      <p className="mt-3 text-ink-soft">
        Explore startups, projects, and ideas from the community. Read about
        them here first — open external links only when you choose.
      </p>
      <p className="mt-2 text-sm text-mute">
        <Link href="/" className="underline-offset-2 hover:underline">
          ← Home
        </Link>
        {" · "}
        <Link href="/programme" className="underline-offset-2 hover:underline">
          Programme
        </Link>
        {" · "}
        {user ? (
          <Link
            href="/dashboard/ventures"
            className="underline-offset-2 hover:underline"
          >
            Add yours
          </Link>
        ) : (
          <Link
            href={`/login?callbackUrl=${encodeURIComponent("/dashboard/ventures")}`}
            className="underline-offset-2 hover:underline"
          >
            Sign in to add yours
          </Link>
        )}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterChip href="/ventures" active={!kind} label="All" />
        {(Object.keys(VENTURE_KIND_LABEL) as VentureKind[]).map((k) => (
          <FilterChip
            key={k}
            href={`/ventures?kind=${k}`}
            active={kind === k}
            label={VENTURE_KIND_LABEL[k]}
          />
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {ventures.length === 0 ? (
          <p className="text-ink-soft sm:col-span-2">
            Nothing published yet. Be the first to add a startup, project, or
            idea.
          </p>
        ) : (
          ventures.map((v) => (
            <VentureCard
              key={v.id}
              venture={{
                id: v.id,
                name: v.name,
                slug: v.slug,
                kind: v.kind,
                tagline: v.tagline,
                description: v.description,
                websiteUrl: v.websiteUrl,
                logoUrl: v.logoUrl,
                ownerName: v.user.name,
              }}
            />
          ))
        )}
      </div>
    </main>
  );
}

function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-teal-deep px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white"
          : "rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-teal-deep hover:border-teal"
      }
    >
      {label}
    </Link>
  );
}
