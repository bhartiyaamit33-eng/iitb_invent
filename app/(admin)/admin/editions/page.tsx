import { EditionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  setEditionCurrentAction,
  setEditionSpeakersPublishedAction,
  setEditionStatusAction,
} from "../actions";

export const dynamic = "force-dynamic";

const STATUSES = Object.values(EditionStatus);

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
        Set status to <strong>LIVE</strong> to enable Happening now /{" "}
        <code>/now</code> lobby screen. Flip current edition for the public site.
      </p>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        <strong>Speaker line-up</strong> controls whether speaker names appear on{" "}
        <code>/speakers</code> and the programme. It is off until you publish, so a
        line-up carried over from a previous edition is never shown as this year&apos;s.
        Toggling it never edits or deletes a speaker.
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
                <p className="mt-1 text-sm text-ink-soft">{e.venueName}</p>
                <p className="mt-2 text-xs text-mute">
                  {e._count.sessions} sessions · {e._count.speakers} speakers ·{" "}
                  {e._count.registrations} registrations · {e._count.pages} pages
                </p>
                <p className="mt-1 text-xs font-semibold text-mute">
                  Speaker line-up:{" "}
                  {e.speakersPublished ? (
                    <span className="text-ent">published</span>
                  ) : (
                    <span className="text-amber-800">hidden (shows “coming soon”)</span>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <form action={setEditionStatusAction} className="flex gap-2">
                  <input type="hidden" name="id" value={e.id} />
                  <select
                    name="status"
                    defaultValue={e.status}
                    className="rounded-md border border-line px-3 py-2 text-sm"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded-md border border-teal px-3 py-2 text-sm font-semibold text-teal-deep"
                  >
                    Set status
                  </button>
                </form>
                <form action={setEditionSpeakersPublishedAction}>
                  <input type="hidden" name="id" value={e.id} />
                  <input
                    type="hidden"
                    name="speakersPublished"
                    value={e.speakersPublished ? "false" : "true"}
                  />
                  <button
                    type="submit"
                    className="rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink-soft hover:border-teal"
                  >
                    {e.speakersPublished ? "Hide speakers" : "Publish speakers"}
                  </button>
                </form>
                {!e.isCurrent ? (
                  <form action={setEditionCurrentAction}>
                    <input type="hidden" name="id" value={e.id} />
                    <button
                      type="submit"
                      className="rounded-md bg-teal-deep px-4 py-2 text-sm font-semibold text-white"
                    >
                      Set current
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
