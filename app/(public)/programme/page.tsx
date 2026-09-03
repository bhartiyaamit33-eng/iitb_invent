import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatIstRange } from "@/lib/editions";

export const dynamic = "force-dynamic";

export default async function ProgrammePage() {
  const edition = await prisma.edition.findFirst({
    where: { isCurrent: true },
  });

  if (!edition) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-4xl text-teal-deep">Programme</h1>
        <p className="mt-4 text-ink-soft">No current edition configured.</p>
      </main>
    );
  }

  const sessions = await prisma.session_.findMany({
    where: {
      editionId: edition.id,
      isPublished: true,
      deletedAt: null,
    },
    orderBy: [{ startsAt: "asc" }, { sortOrder: "asc" }],
    include: {
      speakers: {
        include: { speaker: true },
      },
    },
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
        {edition.name} · Asia/Kolkata
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-wide text-teal-deep">
        Programme
      </h1>
      <p className="mt-3 text-ink-soft">
        {edition.venueName}. Times shown in India Standard Time. Editable by
        organisers in admin.
      </p>
      <p className="mt-2 text-sm text-mute">
        <Link href="/" className="underline-offset-2 hover:underline">
          ← Home
        </Link>
        {" · "}
        <Link href="/login" className="underline-offset-2 hover:underline">
          Login
        </Link>
      </p>

      <div className="mt-10 overflow-hidden rounded-xl border border-line bg-white">
        {sessions.length === 0 ? (
          <p className="p-6 text-ink-soft">No published sessions yet.</p>
        ) : (
          sessions.map((s) => (
            <article
              key={s.id}
              className="grid gap-2 border-b border-line px-5 py-4 last:border-b-0 sm:grid-cols-[11rem_1fr]"
            >
              <time className="text-sm font-semibold text-teal-deep">
                {formatIstRange(s.startsAt, s.endsAt)}
              </time>
              <div>
                <h2 className="font-semibold text-ink">{s.title}</h2>
                {s.room ? (
                  <p className="mt-0.5 text-xs uppercase tracking-[0.1em] text-mute">
                    {s.room}
                    {s.floor ? ` · ${s.floor}` : ""} · {s.format.replaceAll("_", " ")}
                  </p>
                ) : null}
                {s.description ? (
                  <p className="mt-2 text-sm text-ink-soft">{s.description}</p>
                ) : null}
                {s.speakers.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-sm text-ink-soft">
                    {s.speakers.map((ss) => (
                      <li key={ss.speakerId}>
                        <span className="font-medium text-ink">
                          {ss.speaker.name}
                        </span>
                        {ss.speaker.title || ss.speaker.organisation
                          ? ` — ${[ss.speaker.title, ss.speaker.organisation].filter(Boolean).join(", ")}`
                          : ""}
                        {ss.role ? (
                          <span className="text-mute"> ({ss.role})</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}
