import { prisma } from "@/lib/db";
import { createFaqAction, updateFaqAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminFaqsPage() {
  const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
  const faqs = edition
    ? await prisma.faq.findMany({
        where: { editionId: edition.id },
        orderBy: { sortOrder: "asc" },
      })
    : [];

  return (
    <main className="px-6 py-10">
      <h1 className="font-display text-4xl tracking-wide text-teal-deep">FAQs</h1>

      <form action={createFaqAction} className="mt-8 space-y-3 rounded-xl border border-line bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-mute">Add FAQ</h2>
        <input name="question" placeholder="Question" required className="w-full rounded-md border border-line px-3 py-2" />
        <textarea name="answer" placeholder="Answer" rows={3} className="w-full rounded-md border border-line px-3 py-2" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPublished" defaultChecked /> Published
        </label>
        <button type="submit" className="rounded-md bg-teal-deep px-4 py-2 text-sm font-semibold text-white">
          Create
        </button>
      </form>

      <div className="mt-8 space-y-4">
        {faqs.map((f) => (
          <form key={f.id} action={updateFaqAction} className="rounded-xl border border-line bg-white p-5">
            <input type="hidden" name="id" value={f.id} />
            <input name="question" defaultValue={f.question} className="w-full rounded-md border border-line px-3 py-2 font-semibold" />
            <textarea name="answer" defaultValue={f.answer} rows={4} className="mt-3 w-full rounded-md border border-line px-3 py-2" />
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <input name="sortOrder" type="number" defaultValue={f.sortOrder} className="w-24 rounded-md border border-line px-3 py-2" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isPublished" defaultChecked={f.isPublished} /> Published
              </label>
              <button type="submit" className="rounded-md bg-teal-deep px-4 py-2 text-sm font-semibold text-white">
                Save
              </button>
            </div>
          </form>
        ))}
      </div>
    </main>
  );
}
