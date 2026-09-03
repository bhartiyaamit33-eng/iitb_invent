import { prisma } from "@/lib/db";
import { createStatAction, updateStatAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminStatsPage() {
  const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
  const stats = edition
    ? await prisma.editionStat.findMany({
        where: { editionId: edition.id },
        orderBy: { sortOrder: "asc" },
      })
    : [];

  return (
    <main className="px-6 py-10">
      <h1 className="font-display text-4xl tracking-wide text-teal-deep">Stats</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Seeded from{" "}
        <a href="https://www.dsse.iitb.ac.in/" className="underline">
          dsse.iitb.ac.in
        </a>{" "}
        — edit freely for the homepage strip.
      </p>

      <form action={createStatAction} className="mt-8 flex flex-wrap gap-3 rounded-xl border border-line bg-white p-5">
        <input name="label" placeholder="Label" required className="rounded-md border border-line px-3 py-2" />
        <input name="value" placeholder="Value" required className="rounded-md border border-line px-3 py-2" />
        <button type="submit" className="rounded-md bg-teal-deep px-4 py-2 text-sm font-semibold text-white">
          Add
        </button>
      </form>

      <div className="mt-8 space-y-3">
        {stats.map((s) => (
          <form key={s.id} action={updateStatAction} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white p-4">
            <input type="hidden" name="id" value={s.id} />
            <input name="label" defaultValue={s.label} className="rounded-md border border-line px-3 py-2" />
            <input name="value" defaultValue={s.value} className="rounded-md border border-line px-3 py-2 font-semibold text-teal-deep" />
            <input name="sortOrder" type="number" defaultValue={s.sortOrder} className="w-20 rounded-md border border-line px-3 py-2" />
            <button type="submit" className="rounded-md bg-teal-deep px-4 py-2 text-sm font-semibold text-white">
              Save
            </button>
          </form>
        ))}
      </div>
    </main>
  );
}
