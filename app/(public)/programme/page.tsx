import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatIstRange } from "@/lib/editions";
import { getCurrentUser } from "@/lib/auth/session";
import { getHappeningNow, getUpNext, isLiveStatus } from "@/lib/live";
import { cancelRsvpAction, rsvpAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ProgrammePage() {
  const user = await getCurrentUser();
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

  const live = isLiveStatus(edition.status);
  const now = new Date();
  const [sessions, happening, upNext, myRsvps] = await Promise.all([
    prisma.session_.findMany({
      where: {
        editionId: edition.id,
        isPublished: true,
        deletedAt: null,
      },
      orderBy: [{ startsAt: "asc" }, { sortOrder: "asc" }],
      include: {
        speakers: { include: { speaker: true } },
        _count: {
          select: { rsvps: { where: { status: "GOING" } } },
        },
      },
    }),
    live ? getHappeningNow(edition.id, now) : Promise.resolve([]),
    live ? getUpNext(edition.id, now) : Promise.resolve([]),
    user
      ? prisma.rsvp.findMany({
          where: {
            userId: user.id,
            status: { in: ["GOING", "WAITLISTED"] },
            session: { editionId: edition.id },
          },
        })
      : Promise.resolve([]),
  ]);

  const rsvpBySession = new Map(myRsvps.map((r) => [r.sessionId, r]));

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
        {edition.name} · Asia/Kolkata
        {live ? " · LIVE" : ""}
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-wide text-teal-deep">
        Programme
      </h1>
      <p className="mt-3 text-ink-soft">
        {edition.venueName}. RSVP for capped sessions — waitlist opens when full.
      </p>
      <p className="mt-2 text-sm text-mute">
        <Link href="/" className="underline-offset-2 hover:underline">
          ← Home
        </Link>
        {" · "}
        <Link href="/dashboard" className="underline-offset-2 hover:underline">
          Dashboard
        </Link>
        {" · "}
        <Link
          href={`/${edition.slug}/attendees`}
          className="underline-offset-2 hover:underline"
        >
          Directory
        </Link>
        {live ? (
          <>
            {" · "}
            <Link href="/now" className="underline-offset-2 hover:underline">
              Now screen
            </Link>
          </>
        ) : null}
      </p>

      {live ? (
        <section className="mt-8 space-y-4 rounded-xl border border-ent/30 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ent">
            Happening now ·{" "}
            {now.toLocaleTimeString("en-IN", {
              timeZone: "Asia/Kolkata",
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            IST
          </p>
          {happening.length === 0 ? (
            <p className="text-sm text-ink-soft">No session in progress.</p>
          ) : (
            happening.map((s) => (
              <div key={s.id}>
                <p className="font-semibold text-ink">{s.title}</p>
                <p className="text-sm text-mute">
                  {s.room}
                  {s.floor ? ` · ${s.floor}` : ""}
                </p>
              </div>
            ))
          )}
          <p className="pt-2 text-xs font-semibold uppercase tracking-[0.14em] text-mute">
            Up next
          </p>
          {upNext.length === 0 ? (
            <p className="text-sm text-ink-soft">Nothing in the next 90 minutes.</p>
          ) : (
            upNext.map((s) => (
              <div key={s.id} className="text-sm">
                <span className="font-semibold text-teal-deep">
                  {formatIstRange(s.startsAt, s.endsAt)}
                </span>{" "}
                — {s.title}
                {s.room ? ` · ${s.room}` : ""}
              </div>
            ))
          )}
        </section>
      ) : null}

      <div className="mt-10 overflow-hidden rounded-xl border border-line bg-white">
        {sessions.map((s) => {
          const mine = rsvpBySession.get(s.id);
          const going = s._count.rsvps;
          const full = s.capacity != null && going >= s.capacity;
          return (
            <article
              key={s.id}
              className="grid gap-3 border-b border-line px-5 py-4 last:border-b-0 sm:grid-cols-[11rem_1fr]"
            >
              <time className="text-sm font-semibold text-teal-deep">
                {formatIstRange(s.startsAt, s.endsAt)}
              </time>
              <div>
                <h2 className="font-semibold text-ink">
                  <Link
                    href={`/programme/${s.slug}`}
                    prefetch={false}
                    className="underline-offset-2 hover:underline"
                  >
                    {s.title}
                  </Link>
                </h2>
                <p className="mt-0.5 text-xs uppercase tracking-[0.1em] text-mute">
                  {s.room}
                  {s.floor ? ` · ${s.floor}` : ""} · {s.format.replaceAll("_", " ")}
                  {s.capacity != null
                    ? ` · ${going}/${s.capacity} going`
                    : ` · ${going} going`}
                </p>
                {s.speakers.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-sm text-ink-soft">
                    {s.speakers.map((ss) => (
                      <li key={ss.speakerId}>
                        <span className="font-medium text-ink">
                          {ss.speaker.name}
                        </span>
                        {ss.role ? (
                          <span className="text-mute"> ({ss.role})</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="mt-3">
                  {!user ? (
                    <Link
                      href={`/login?callbackUrl=${encodeURIComponent("/programme")}`}
                      className="text-sm font-semibold text-teal-deep underline-offset-2 hover:underline"
                    >
                      Sign in to RSVP
                    </Link>
                  ) : mine && mine.status !== "CANCELLED" ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-semibold text-ent">
                        {mine.status === "GOING"
                          ? "You're going"
                          : `Waitlist #${mine.position ?? "?"}`}
                      </span>
                      <form action={cancelRsvpAction}>
                        <input type="hidden" name="sessionId" value={s.id} />
                        <button
                          type="submit"
                          className="text-sm text-mute underline-offset-2 hover:underline"
                        >
                          Cancel
                        </button>
                      </form>
                    </div>
                  ) : (
                    <form action={rsvpAction}>
                      <input type="hidden" name="sessionId" value={s.id} />
                      <button
                        type="submit"
                        className="rounded-md bg-teal-deep px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white hover:bg-teal"
                      >
                        {full && s.waitlistOpen
                          ? "Join waitlist"
                          : full
                            ? "Full"
                            : s.rsvpRequired
                              ? "RSVP"
                              : "I'm going"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
