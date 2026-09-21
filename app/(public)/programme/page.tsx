import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatIstRange } from "@/lib/editions";
import { getCurrentUser } from "@/lib/auth/session";
import { getHappeningNow, getUpNext, isLiveStatus } from "@/lib/live";
import { cancelRsvpAction, rsvpAction } from "./actions";
import { pageMetadata } from "@/lib/seo";
import { userHasLiveEventTicket } from "@/lib/conference-access";
import { PROGRAMME_SCHEDULE_PUBLISHED } from "@/lib/programme";
import { PublicChrome } from "@/components/PublicChrome";
import { PageHero } from "@/components/site/PageHero";
import { ProgrammeOutline } from "@/components/site/ProgrammeOutline";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Programme",
  description:
    "IITB INV.ENT 2027 programme: research papers, posters, pitches, workshops, and sessions, 30-31 January 2027, IIT Bombay.",
  path: "/programme",
});

export default async function ProgrammePage() {
  const user = await getCurrentUser().catch(() => null);
  let edition: Awaited<ReturnType<typeof prisma.edition.findFirst>> = null;
  try {
    edition = await prisma.edition.findFirst({
      where: { isCurrent: true },
    });
  } catch {
    edition = null;
  }
  const live = edition ? isLiveStatus(edition.status) : false;
  const showSchedule = PROGRAMME_SCHEDULE_PUBLISHED || live;

  if (!showSchedule) {
    return (
      <PublicChrome crumbs={[{ href: "/programme", label: "Programme" }]}>
        <main id="main">
          <PageHero
            kicker="30–31 January 2027"
            title="Programme"
            lede="Two days. One ecosystem. A preliminary outline — the detailed agenda will be published closer to the conference."
          />
          <div className="site-shell editorial">
            <p className="site-notice">
              Preliminary. The detailed agenda will be published closer to the
              conference.
            </p>
            <ProgrammeOutline />
            <div className="cta-row" style={{ justifyContent: "flex-start" }}>
              <Link className="site-btn site-btn-ghost" href="/workshops">
                Workshop →
              </Link>
              <Link className="site-btn site-btn-ghost" href="/research">
                Research →
              </Link>
            </div>
          </div>
        </main>
      </PublicChrome>
    );
  }

  if (!edition) {
    return (
      <PublicChrome crumbs={[{ href: "/programme", label: "Programme" }]}>
        <main id="main">
          <PageHero title="Programme" lede="No current edition configured." />
        </main>
      </PublicChrome>
    );
  }

  const now = new Date();
  const canRsvp = user
    ? await userHasLiveEventTicket(user.id, edition.id)
    : false;
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
    <PublicChrome crumbs={[{ href: "/programme", label: "Programme" }]}>
      <main id="main">
        <PageHero
          kicker={`${edition.name} · Asia/Kolkata${live ? " · LIVE" : ""}`}
          title="Programme"
          lede={`${edition.venueName}. Confirmed ticket holders can RSVP for capped sessions.`}
        />
        <div className="site-shell editorial">
          {live ? (
            <section className="site-notice">
              <p className="site-kicker is-green">
                Happening now ·{" "}
                {now.toLocaleTimeString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                IST
              </p>
              {happening.length === 0 ? (
                <p>No session in progress.</p>
              ) : (
                happening.map((s) => (
                  <div key={s.id}>
                    <p>
                      <strong>{s.title}</strong>
                    </p>
                    <p>
                      {s.room}
                      {s.floor ? ` · ${s.floor}` : ""}
                    </p>
                  </div>
                ))
              )}
              <p className="site-kicker" style={{ marginTop: 16 }}>
                Up next
              </p>
              {upNext.length === 0 ? (
                <p>Nothing in the next 90 minutes.</p>
              ) : (
                upNext.map((s) => (
                  <div key={s.id}>
                    <span>{formatIstRange(s.startsAt, s.endsAt)}</span> — {s.title}
                    {s.room ? ` · ${s.room}` : ""}
                  </div>
                ))
              )}
            </section>
          ) : null}

          <div>
            {sessions.map((s) => {
              const mine = rsvpBySession.get(s.id);
              const going = s._count.rsvps;
              const full = s.capacity != null && going >= s.capacity;
              return (
                <article
                  key={s.id}
                  className="grid gap-3 border-b border-line px-0 py-6 last:border-b-0 sm:grid-cols-[11rem_1fr]"
                >
                  <time className="text-sm font-semibold">
                    {formatIstRange(s.startsAt, s.endsAt)}
                  </time>
                  <div>
                    <h2 className="font-semibold">
                      <Link href={`/programme/${s.slug}`} prefetch={false}>
                        {s.title}
                      </Link>
                    </h2>
                    <p className="mt-0.5 text-xs uppercase tracking-[0.1em] text-mute">
                      {s.room}
                      {s.floor ? ` · ${s.floor}` : ""} ·{" "}
                      {s.format.replaceAll("_", " ")}
                      {s.capacity != null
                        ? ` · ${going}/${s.capacity} going`
                        : ` · ${going} going`}
                    </p>
                    {s.speakers.length > 0 ? (
                      <ul className="mt-2 space-y-1 text-sm">
                        {s.speakers.map((ss) => (
                          <li key={ss.speakerId}>
                            <span className="font-medium">{ss.speaker.name}</span>
                            {ss.role ? (
                              <span className="text-mute"> ({ss.role})</span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    <div className="mt-3">
                      {!canRsvp ? (
                        <p className="text-sm text-mute">
                          Session RSVP opens after organisers select your abstract
                          and you pay the category fee.
                        </p>
                      ) : mine && mine.status !== "CANCELLED" ? (
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-sm font-semibold text-ent">
                            {mine.status === "GOING"
                              ? "You're going"
                              : `Waitlist #${mine.position ?? "?"}`}
                          </span>
                          <form action={cancelRsvpAction}>
                            <input type="hidden" name="sessionId" value={s.id} />
                            <button type="submit" className="text-sm underline">
                              Cancel
                            </button>
                          </form>
                        </div>
                      ) : (
                        <form action={rsvpAction}>
                          <input type="hidden" name="sessionId" value={s.id} />
                          <button type="submit" className="site-btn site-btn-sm">
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
        </div>
      </main>
    </PublicChrome>
  );
}
