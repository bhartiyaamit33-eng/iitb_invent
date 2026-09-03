import { SessionFormat } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  createSessionAction,
  softDeleteSessionAction,
  updateSessionAction,
} from "../actions";

export const dynamic = "force-dynamic";

function toLocalInput(d: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export default async function AdminSessionsPage() {
  const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
  const sessions = edition
    ? await prisma.session_.findMany({
        where: { editionId: edition.id, deletedAt: null },
        orderBy: [{ startsAt: "asc" }, { sortOrder: "asc" }],
        include: { speakers: { include: { speaker: true } } },
      })
    : [];

  const formats = Object.values(SessionFormat);

  return (
    <main className="px-6 py-10">
      <h1 className="font-display text-4xl tracking-wide text-teal-deep">
        Programme
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        Editable DSSE Day schedule (seeded from 2026 organiser artwork). Changes
        publish to <code>/programme</code> when marked published.
      </p>

      <section className="mt-8 rounded-xl border border-line bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-mute">
          Add session
        </h2>
        <form action={createSessionAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input name="title" placeholder="Title" required className="rounded-md border border-line px-3 py-2" />
          <select name="format" className="rounded-md border border-line px-3 py-2" defaultValue="NETWORKING">
            {formats.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <input name="startsAt" type="datetime-local" required className="rounded-md border border-line px-3 py-2" />
          <input name="endsAt" type="datetime-local" required className="rounded-md border border-line px-3 py-2" />
          <input name="room" placeholder="Room" defaultValue="DSSE Building" className="rounded-md border border-line px-3 py-2" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isPublished" defaultChecked /> Published
          </label>
          <textarea name="description" placeholder="Description" className="sm:col-span-2 rounded-md border border-line px-3 py-2" rows={2} />
          <button type="submit" className="rounded-md bg-teal-deep px-4 py-2 text-sm font-semibold text-white sm:col-span-2">
            Create session
          </button>
        </form>
      </section>

      <div className="mt-8 space-y-4">
        {sessions.map((s) => (
          <form
            key={s.id}
            action={updateSessionAction}
            className="rounded-xl border border-line bg-white p-5"
          >
            <input type="hidden" name="id" value={s.id} />
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="title" defaultValue={s.title} className="rounded-md border border-line px-3 py-2 font-semibold" />
              <select name="format" defaultValue={s.format} className="rounded-md border border-line px-3 py-2">
                {formats.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <input name="startsAt" type="datetime-local" defaultValue={toLocalInput(s.startsAt)} className="rounded-md border border-line px-3 py-2" />
              <input name="endsAt" type="datetime-local" defaultValue={toLocalInput(s.endsAt)} className="rounded-md border border-line px-3 py-2" />
              <input name="room" defaultValue={s.room ?? ""} placeholder="Room" className="rounded-md border border-line px-3 py-2" />
              <input name="floor" defaultValue={s.floor ?? ""} placeholder="Floor" className="rounded-md border border-line px-3 py-2" />
              <input name="sortOrder" type="number" defaultValue={s.sortOrder} className="rounded-md border border-line px-3 py-2" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isPublished" defaultChecked={s.isPublished} /> Published
              </label>
              <textarea name="description" defaultValue={s.description ?? ""} rows={2} className="sm:col-span-2 rounded-md border border-line px-3 py-2" />
            </div>
            {s.speakers.length > 0 ? (
              <p className="mt-3 text-xs text-mute">
                Speakers: {s.speakers.map((x) => x.speaker.name).join(" · ")}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="submit" className="rounded-md bg-teal-deep px-4 py-2 text-sm font-semibold text-white">
                Save
              </button>
              <button
                formAction={softDeleteSessionAction}
                type="submit"
                className="rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-700"
              >
                Soft delete
              </button>
            </div>
          </form>
        ))}
      </div>
    </main>
  );
}
