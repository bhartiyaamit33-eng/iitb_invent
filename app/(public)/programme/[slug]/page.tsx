import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatIstRange } from "@/lib/editions";
import { getCurrentUser } from "@/lib/auth/session";
import { googleCalendarUrl } from "@/lib/calendar";
import { fillConnectNote, firstNameFromFullName } from "@/lib/connect";
import { ConnectOnLinkedIn } from "@/components/ConnectOnLinkedIn";
import { cancelRsvpAction, rsvpAction } from "../actions";

export const dynamic = "force-dynamic";

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
    where: {
      editionId: edition.id,
      slug,
      isPublished: true,
      deletedAt: null,
    },
    include: {
      speakers: {
        include: { speaker: true },
      },
      track: true,
      _count: { select: { rsvps: { where: { status: "GOING" } } } },
    },
  });
  if (!session) notFound();

  const myRsvp = user
    ? await prisma.rsvp.findUnique({
        where: {
          userId_sessionId: { userId: user.id, sessionId: session.id },
        },
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
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
        <Link href="/programme" className="underline-offset-2 hover:underline">
          Programme
        </Link>
        {session.track ? ` · ${session.track.name}` : ""}
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-wide text-teal-deep">
        {session.title}
      </h1>
      <p className="mt-3 text-sm font-semibold text-teal-deep">
        {formatIstRange(session.startsAt, session.endsAt)}
      </p>
      <p className="mt-1 text-sm text-mute">
        {location || edition.venueName} ·{" "}
        {session.format.replaceAll("_", " ")}
        {session.capacity != null
          ? ` · ${going}/${session.capacity} going`
          : ` · ${going} going`}
      </p>

      {session.description ? (
        <p className="mt-6 whitespace-pre-wrap text-ink-soft">
          {session.description}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={gcal}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-teal-deep hover:bg-white"
        >
          Google Calendar
        </a>
        <a
          href={`/api/calendar/${session.slug}.ics`}
          className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-teal-deep hover:bg-white"
        >
          Download .ics
        </a>
      </div>

      <div className="mt-6">
        {!user ? (
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(`/programme/${session.slug}`)}`}
            className="text-sm font-semibold text-teal-deep underline-offset-2 hover:underline"
          >
            Sign in to RSVP
          </Link>
        ) : myRsvp && myRsvp.status !== "CANCELLED" ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-ent">
              {myRsvp.status === "GOING"
                ? "You're going"
                : `Waitlist #${myRsvp.position ?? "?"}`}
            </span>
            <form action={cancelRsvpAction}>
              <input type="hidden" name="sessionId" value={session.id} />
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
            <input type="hidden" name="sessionId" value={session.id} />
            <button
              type="submit"
              className="rounded-md bg-teal-deep px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white hover:bg-teal"
            >
              {full && session.waitlistOpen
                ? "Join waitlist"
                : full
                  ? "Full"
                  : session.rsvpRequired
                    ? "RSVP"
                    : "I'm going"}
            </button>
          </form>
        )}
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl tracking-wide text-teal-deep">
          Speakers &amp; presenters
        </h2>
        {session.speakers.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">
            Presenters will appear here once the admin adds them to this
            session.
          </p>
        ) : (
          <ul className="mt-6 space-y-5">
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
                  className="flex gap-4 rounded-xl border border-line bg-white p-4"
                >
                  {speaker.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={speaker.photoUrl}
                      alt=""
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-paper text-lg font-semibold text-teal-deep">
                      {speaker.name.slice(0, 1)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{speaker.name}</p>
                    <p className="text-sm text-mute">
                      {[role, speaker.title, speaker.organisation]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {speaker.bio ? (
                      <p className="mt-2 text-sm text-ink-soft">{speaker.bio}</p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
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
                          className="text-sm font-semibold text-teal-deep underline-offset-2 hover:underline"
                        >
                          LinkedIn
                        </a>
                      ) : null}
                      {speaker.websiteUrl ? (
                        <a
                          href={speaker.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-mute underline-offset-2 hover:underline"
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
      </section>
    </main>
  );
}
