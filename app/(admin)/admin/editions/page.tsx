import { prisma } from "@/lib/db";
import { setEditionCurrentAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminEditionsPage() {
  const editions = await prisma.edition.findMany({
    orderBy: { year: "desc" },
    include: {
      _count: {
        select: {
          sessions: true,
          speakers: true,
          registrations: true,
          pages: true,
        },
      },
    },
  });

  return (
    <main className="px-6 py-10">
      <h1 className="font-display text-4xl tracking-wide text-teal-deep">
        Editions
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Flip <code>isCurrent</code> to change what the public programme renders.
      </p>

      <div className="mt-8 space-y-4">
        {editions.map((e) => (
          <div key={e.id} className="rounded-xl border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-ink">
                  {e.name}{" "}
                  {e.isCurrent ? (
                    <span className="ml-2 rounded-full bg-ent/15 px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.1em] text-ent">
                      Current
                    </span>
                  ) : null}
                </h2>
                <p className="mt-1 text-sm text-ink-soft">
                  {e.status} · {e.venueName}
                </p>
                <p className="mt-2 text-xs text-mute">
                  {e._count.sessions} sessions · {e._count.speakers} speakers ·{" "}
                  {e._count.registrations} registrations · {e._count.pages} pages
                </p>
              </div>
              {!e.isCurrent ? (
                <form action={setEditionCurrentAction}>
                  <input type="hidden" name="id" value={e.id} />
                  <button
                    type="submit"
                    className="rounded-md border border-teal px-4 py-2 text-sm font-semibold text-teal-deep"
                  >
                    Set current
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
