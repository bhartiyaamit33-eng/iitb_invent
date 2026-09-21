import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { formatIstRange } from "@/lib/editions";
import { getCurrentUser } from "@/lib/auth/session";
import { googleCalendarUrl } from "@/lib/calendar";
import { fillConnectNote, firstNameFromFullName } from "@/lib/connect";
import { ConnectOnLinkedIn } from "@/components/ConnectOnLinkedIn";
import { PageHero } from "@/components/site/PageHero";
import { SiteShell } from "@/components/site/SiteShell";
import { cancelRsvpAction, rsvpAction } from "../actions";
import { pageMetadata } from "@/lib/seo";
import { userHasLiveEventTicket } from "@/lib/conference-access";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
  if (!edition) return { title: "Session" };
  const session = await prisma.session_.findFirst({
    where: { editionId: edition.id, slug, isPublished: true, deletedAt: null },
    select: { title: true, description: true },
  });
  if (!session) return { title: "Session" };
  return pageMetadata({
    title: session.title,
    description:
      session.description?.slice(0, 160) ||
      `${session.title} at IITB INV.ENT, IIT Bombay.`,
    path: `/programme/${slug}`,
  });
}

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
  if (!edition) notFound();

  const session = await prisma.session_.findFirst({
    where: { editionId: edition.id, slug, isPublished: true, deletedAt: null },
    include: {
      speakers: { include: { speaker: true } },
      track: true,
      _count: { select: { rsvps: { where: { status: "GOING" } } } },
    },
  });
  if (!session) notFound();

  const canRsvp = user ? await userHasLiveEventTicket(user.id, edition.id) : false;
  const myRsvp = user
    ? await prisma.rsvp.findUnique({
        where: { userId_sessionId: { userId: user.id, sessionId: session.id } },
      })
    : null;

  const me = user
    ? await prisma.user.findUnique({
        where: { id: user.id },
        include: { profile: true },
      })
    : null;

  const going = session._count.rsvps;
  const full = session.capacity != null && going >= session.capacity;
  const location = [session.room, session.floor, edition.venueName]
    .filter(Boolean)
    .join(" · ");
  const gcal = googleCalendarUrl({
    title: `${session.title} · ${edition.name}`,
    description: session.description,
    location,
    startsAt: session.startsAt,
    endsAt: session.endsAt,
  });
  const eventDateShort = edition.startsAt.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  return (
    <SiteShell
      crumbs={[
        { href: "/programme", label: "Programme" },
        { href: `/programme/${session.slug}`, label: session.title },
      ]}
    >
      <PageHero
        kicker={session.track ? session.track.name : "Session"}
        title={session.title}
        lede={session.description || undefined}
        meta={[
          formatIstRange(session.startsAt, session.endsAt),
          location || edition.venueName,
          session.format.replaceAll("_", " "),
          session.capacity != null
            ? `${going}/${session.capacity} going`
            : `${going} going`,
        ]}
      >
        <div className="cta-row" style={{ justifyContent: "flex-start" }}>
          <a
            className="site-btn site-btn-ghost site-btn-sm"
            href={gcal}
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Calendar
          </a>
          <a
            className="site-btn site-btn-ghost site-btn-sm"
            href={`/api/calendar/${session.slug}.ics`}
          >
            Download .ics
          </a>
        </div>

        <div style={{ marginTop: 28 }}>
          {!canRsvp ? (
            <p style={{ margin: 0, fontSize: 14, color: "var(--mute)" }}>
              Session RSVP opens after organisers select your abstract and you pay the
              category fee.
            </p>
          ) : myRsvp && myRsvp.status !== "CANCELLED" ? (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 16,
              }}
            >
              <span className="site-kicker" style={{ margin: 0, color: "var(--green)" }}>
                {myRsvp.status === "GOING"
                  ? "You’re going"
                  : `Waitlist #${myRsvp.position ?? "?"}`}
              </span>
              <form action={cancelRsvpAction}>
                <input type="hidden" name="sessionId" value={session.id} />
                <button type="submit" className="site-btn site-btn-ghost site-btn-sm">
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
      </PageHero>

      <section className="site-section is-tight" aria-labelledby="speakers-heading">
        <div className="site-shell">
          <p className="site-kicker">On this session</p>
          <h2 id="speakers-heading">Speakers &amp; presenters</h2>
          {session.speakers.length === 0 ? (
            <p className="lead">
              Presenters appear here once organisers add them to this session.
            </p>
          ) : (
            <ul
              style={{
                margin: "28px 0 0",
                padding: 0,
                listStyle: "none",
                borderTop: "1px solid var(--rule)",
              }}
            >
              {session.speakers.map(({ speaker, role }) => {
                const note =
                  me && speaker.linkedinUrl
                    ? fillConnectNote(edition.connectNoteTemplate, {
                        firstName: firstNameFromFullName(speaker.name),
                        senderName: me.name,
                        senderHeadline: me.profile?.headline ?? "",
                        eventName: edition.name,
                        eventDateShort,
                        sessionName: session.title,
                      })
                    : "";
                return (
                  <li
                    key={speaker.id}
                    style={{
                      display: "flex",
                      gap: 24,
                      padding: "26px 0",
                      borderBottom: "1px solid var(--rule)",
                    }}
                  >
                    {speaker.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={speaker.photoUrl}
                        alt=""
                        className="speaker-photo"
                        style={{ marginBottom: 0, flex: "none" }}
                      />
                    ) : (
                      <div
                        className="site-serif"
                        style={{
                          display: "grid",
                          placeItems: "center",
                          flex: "none",
                          width: 72,
                          height: 72,
                          border: "1px solid var(--rule)",
                          fontSize: "1.6rem",
                          color: "var(--navy)",
                        }}
                        aria-hidden="true"
                      >
                        {speaker.name.slice(0, 1)}
                      </div>
                    )}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p
                        className="site-serif"
                        style={{ margin: 0, fontSize: "1.35rem", color: "var(--navy)" }}
                      >
                        {speaker.name}
                      </p>
                      <p className="site-kicker" style={{ margin: "8px 0 0" }}>
                        {[role, speaker.title, speaker.organisation]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      {speaker.bio ? (
                        <p
                          style={{
                            margin: "12px 0 0",
                            fontSize: 15,
                            lineHeight: 1.7,
                            color: "var(--ink-soft)",
                            maxWidth: "62ch",
                          }}
                        >
                          {speaker.bio}
                        </p>
                      ) : null}
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 12,
                          marginTop: 16,
                        }}
                      >
                        {speaker.linkedinUrl && note ? (
                          <ConnectOnLinkedIn
                            linkedinUrl={speaker.linkedinUrl}
                            note={note}
                          />
                        ) : speaker.linkedinUrl ? (
                          <a
                            href={speaker.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "var(--blue)", fontSize: 14 }}
                          >
                            LinkedIn
                          </a>
                        ) : null}
                        {speaker.websiteUrl ? (
                          <a
                            href={speaker.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "var(--mute)", fontSize: 14 }}
                          >
                            Website
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="cta-row" style={{ justifyContent: "flex-start" }}>
            <Link className="site-btn site-btn-ghost" href="/programme">
              ← All sessions
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
