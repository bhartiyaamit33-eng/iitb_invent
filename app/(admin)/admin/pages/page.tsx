import { prisma } from "@/lib/db";
import { updatePageAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
  const pages = edition
    ? await prisma.page.findMany({
        where: { editionId: edition.id },
        orderBy: { slug: "asc" },
      })
    : [];

  return (
    <main className="px-6 py-10">
      <h1 className="font-display text-4xl tracking-wide text-teal-deep">Pages</h1>
      <p className="mt-2 text-sm text-ink-soft">Markdown body — about, travel, privacy, code of conduct.</p>
      <div className="mt-8 space-y-4">
        {pages.map((p) => (
          <form key={p.id} action={updatePageAction} className="rounded-xl border border-line bg-white p-5">
            <input type="hidden" name="id" value={p.id} />
            <p className="text-xs uppercase tracking-[0.12em] text-mute">/{p.slug}</p>
            <input name="title" defaultValue={p.title} className="mt-2 w-full rounded-md border border-line px-3 py-2 font-semibold" />
            <textarea name="body" defaultValue={p.body} rows={8} className="mt-3 w-full rounded-md border border-line px-3 py-2 font-mono text-sm" />
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input type="checkbox" name="isPublished" defaultChecked={p.isPublished} /> Published
            </label>
            <button type="submit" className="mt-4 rounded-md bg-teal-deep px-4 py-2 text-sm font-semibold text-white">
              Save
            </button>
          </form>
        ))}
      </div>
    </main>
  );
}
