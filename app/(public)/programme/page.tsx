import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatIstRange } from "@/lib/editions";
import { getCurrentUser } from "@/lib/auth/session";
import { getHappeningNow, getUpNext, isLiveStatus } from "@/lib/live";
import { cancelRsvpAction, rsvpAction } from "./actions";
import { PageHero } from "@/components/site/PageHero";
import { SiteShell } from "@/components/site/SiteShell";
import { pageMetadata } from "@/lib/seo";
import { userHasLiveEventTicket } from "@/lib/conference-access";
import { EVENT_DATES, PROGRAMME_DAYS } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Programme",
  description:
    "IITB INV.ENT 2027 programme: research papers, posters, pitches, workshops, and sessions, 30-31 January 2027, IIT Bombay.",
  path: "/programme",
});

/** Shape of the two days, shown until sessions are published in admin. */
function ProgrammeShape() {
  return (
    <div className="days-grid" data-testid="programme-shape">
      {PROGRAMME_DAYS.map((day) => (
        <article className="day-col" key={day.id}>
          <p className="site-kicker is-blue">{day.kicker}</p>
          <p className="date">{day.date}</p>
          <h3>{day.title}</h3>
          <p className="lead">{day.lead}</p>
          <ul>
            {day.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

export default async function ProgrammePage() {
  const user = await getCurrentUser();
  const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });

  if (!edition) {
    return (
      <SiteShell crumbs={[{ href: "/programme", label: "Programme" }]}>
        <PageHero
          kicker={EVENT_DATES}
          title="Programme"
          lede="The full session grid is published here as it is confirmed. Below is the shape of the two days."
        />
        <section className="site-section is-tight">
          <div className="site-shell">
            <ProgrammeShape />
          </div>
        </section>
      </SiteShell>
    );
  }

  const live = isLiveStatus(edition.status);
  const now = new Date();
  const canRsvp = user ? await userHasLiveEventTicket(user.id, edition.id) : false;
  const [sessions, happening, upNext, myRsvps] = await Promise.all([
    prisma.session_.findMany({
      where: { editionId: edition.id, isPublished: true, deletedAt: null },
      orderBy: [{ startsAt: "asc" }, { sortOrder: "asc" }],
      include: {
        speakers: { include: { speaker: true } },
        _count: { select: { rsvps: { where: { status: "GOING" } } } },
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
    <SiteShell crumbs={[{ href: "/programme", label: "Programme" }]}>
      <PageHero
        kicker={`${edition.name} · Asia/Kolkata${live ? " · LIVE" : ""}`}
        title="Programme"
        lede={`${edition.venueName}. Confirmed ticket holders can RSVP for capped sessions.`}
        meta={[`Conference · ${EVENT_DATES}`, "Venue · IIT Bombay"]}
      >
        <div className="cta-row" style={{ justifyContent: "flex-start" }}>
          <Link className="site-btn site-btn-ghost" href="/research">
            Call for papers →
          </Link>
          <Link className="site-btn site-btn-ghost" href="/workshop">
            Workshops
          </Link>
          {live ? (
            <Link className="site-btn site-btn-ghost" href="/now">
              Now screen
            </Link>
          ) : null}
        </div>
      </PageHero>

      {live ? (
        <section className="site-section is-tight" aria-labelledby="now-heading">
          <div className="site-shell">
            <p className="site-kicker is-green">
              Happening now ·{" "}
              {now.toLocaleTimeString("en-IN", {
                timeZone: "Asia/Kolkata",
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              IST
            </p>
            <h2 id="now-heading" className="sr-only">
              Happening now
            </h2>
            {happening.length === 0 ? (
              <p className="lead">No session in progress.</p>
            ) : (
              happening.map((session) => (
                <div key={session.id} style={{ marginBottom: 16 }}>
                  <p
                    className="site-serif"
                    style={{ margin: 0, fontSize: "1.6rem", color: "var(--navy)" }}
                  >
                    {session.title}
                  </p>
                  <p className="site-kicker" style={{ margin: "6px 0 0" }}>
                    {session.room}
                    {session.floor ? ` · ${session.floor}` : ""}
                  </p>
                </div>
              ))
            )}
            <p className="site-kicker" style={{ marginTop: 28 }}>
              Up next
            </p>
            {upNext.length === 0 ? (
              <p className="lead">Nothing in the next 90 minutes.</p>
            ) : (
              upNext.map((session) => (
                <p key={session.id} style={{ margin: "0 0 6px", color: "var(--ink-soft)" }}>
                  <span style={{ color: "var(--blue)" }}>
                    {formatIstRange(session.startsAt, session.endsAt)}
                  </span>{" "}
                  — {session.title}
                  {session.room ? ` · ${session.room}` : ""}
                </p>
              ))
            )}
          </div>
        </section>
      ) : null}

      <section className="site-section is-rule" aria-labelledby="sessions-heading">
        <div className="site-shell">
          <p className="site-kicker">Sessions</p>
          <h2 id="sessions-heading">The grid</h2>

          {sessions.length === 0 ? (
            <>
              <p className="lead">
                Individual sessions are published here as they are confirmed. Below is the
                shape of the two days.
              </p>
              <ProgrammeShape />
            </>
          ) : (
            <div
              style={{ marginTop: 36, borderTop: "1px solid var(--rule)" }}
              data-testid="programme-sessions"
            >
              {sessions.map((session) => {
                const mine = rsvpBySession.get(session.id);
                const going = session._count.rsvps;
                const full = session.capacity != null && going >= session.capacity;
                return (
                  <article
                    key={session.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 11rem) 1fr",
                      gap: 24,
                      padding: "26px 0",
                      borderBottom: "1px solid var(--rule)",
                    }}
                    className="programme-row"
                  >
                    <time
                      className="site-serif"
                      style={{ fontSize: "1.3rem", color: "var(--blue)" }}
                    >
                      {formatIstRange(session.startsAt, session.endsAt)}
                    </time>
                    <div>
                      <h3
                        className="site-serif"
                        style={{
                          margin: 0,
                          fontSize: "1.5rem",
                          fontWeight: 400,
                          color: "var(--navy)",
                        }}
                      >
                        <Link href={`/programme/${session.slug}`} prefetch={false}>
                          {session.title}
                        </Link>
                      </h3>
                      <p className="site-kicker" style={{ margin: "10px 0 0" }}>
                        {session.room}
                        {session.floor ? ` · ${session.floor}` : ""} ·{" "}
                        {session.format.replaceAll("_", " ")}
                        {session.capacity != null
                          ? ` · ${going}/${session.capacity} going`
                          : ` · ${going} going`}
                      </p>
                      {session.speakers.length > 0 ? (
                        <ul
                          style={{
                            margin: "14px 0 0",
                            padding: 0,
                            listStyle: "none",
                            color: "var(--ink-soft)",
                            fontSize: 15,
                          }}
                        >
                          {session.speakers.map((link) => (
                            <li key={link.speakerId} style={{ padding: "2px 0" }}>
                              <span style={{ color: "var(--ink)" }}>
                                {link.speaker.name}
                              </span>
                              {link.role ? (
                                <span style={{ color: "var(--mute)" }}> ({link.role})</span>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      <div style={{ marginTop: 18 }}>
                        {!canRsvp ? (
                          <p style={{ margin: 0, fontSize: 14, color: "var(--mute)" }}>
                            Session RSVP opens after organisers select your abstract and
                            you pay the category fee.
                          </p>
                        ) : mine && mine.status !== "CANCELLED" ? (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              alignItems: "center",
                              gap: 16,
                            }}
                          >
                            <span
                              className="site-kicker"
                              style={{ margin: 0, color: "var(--green)" }}
                            >
                              {mine.status === "GOING"
                                ? "You’re going"
                                : `Waitlist #${mine.position ?? "?"}`}
                            </span>
                            <form action={cancelRsvpAction}>
                              <input type="hidden" name="sessionId" value={session.id} />
                              <button
                                type="submit"
                                className="site-btn site-btn-ghost site-btn-sm"
                              >
                                Cancel
                              </button>
                            </form>
                          </div>
                        ) : (
                          <form action={rsvpAction}>
                            <input type="hidden" name="sessionId" value={session.id} />
                            <button type="submit" className="site-btn site-btn-sm">
                              {full && session.waitlistOpen
                                ? "Join waitlist"
                                : full
                                  ? "Full"
                                  : session.rsvpRequired
                                    ? "RSVP"
                                    : "I’m going"}
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
