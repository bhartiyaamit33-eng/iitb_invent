import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { TicketQr } from "@/components/TicketQr";
import { formatIstRange } from "@/lib/editions";
import { getNextForUser, isLiveStatus } from "@/lib/live";
import { ticketBadgeUrl } from "@/lib/ticket";

type SearchParams = Promise<{ welcome?: string }>;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  const registration = await prisma.registration.findFirst({
    where: { userId: user.id, edition: { isCurrent: true } },
    include: { edition: true },
  });

  const completeness = profile?.completeness ?? 0;
  const now = new Date();
  const nextRsvp =
    registration && isLiveStatus(registration.edition.status)
      ? await getNextForUser(user.id, registration.editionId, now)
      : registration
        ? await getNextForUser(user.id, registration.editionId, now)
        : null;

  const mySchedule = registration
    ? await prisma.rsvp.findMany({
        where: {
          userId: user.id,
          status: { in: ["GOING", "WAITLISTED"] },
          session: { editionId: registration.editionId, deletedAt: null },
        },
        include: { session: true },
        orderBy: { session: { startsAt: "asc" } },
      })
    : [];

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      {params.welcome ? (
        <div className="mb-8 rounded-xl border border-ent/30 bg-white px-5 py-4 shadow-sm">
          <p className="font-semibold text-teal-deep">You&apos;re in.</p>
          <p className="mt-1 text-sm text-ink-soft">
            Want people to know you&apos;re coming? Add LinkedIn and turn on the
            directory.
          </p>
          <Link
            href="/dashboard/profile"
            className="mt-3 inline-block text-sm font-semibold text-teal-deep underline-offset-2 hover:underline"
          >
            Complete profile →
          </Link>
        </div>
      ) : null}

      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
        Attendee
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-wide text-teal-deep">
        Hi, {user.name.split(" ")[0] || "there"}
      </h1>

      {nextRsvp?.session ? (
        <p className="mt-4 rounded-lg border border-teal/30 bg-white px-4 py-3 text-sm text-ink-soft">
          Your next session:{" "}
          <strong className="text-ink">{nextRsvp.session.title}</strong>
          {nextRsvp.session.room ? `, ${nextRsvp.session.room}` : ""} ·{" "}
          {formatIstRange(nextRsvp.session.startsAt, nextRsvp.session.endsAt)} IST
        </p>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mute">
            Registration
          </p>
          {registration ? (
            <>
              <p className="mt-2 text-lg font-semibold text-ink">
                {registration.edition.name}
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                Ticket{" "}
                <code className="text-teal-deep">{registration.ticketCode}</code>
              </p>
              {registration.checkedInAt ? (
                <p className="mt-1 text-sm text-ent">Checked in</p>
              ) : (
                <p className="mt-1 text-sm capitalize text-mute">
                  {registration.status.toLowerCase()}
                </p>
              )}
              <div className="mt-4">
                <TicketQr
                  token={registration.qrToken}
                  badgeUrl={ticketBadgeUrl(registration.qrToken)}
                />
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-ink-soft">No active registration yet.</p>
          )}
        </div>
        <div className="rounded-xl border border-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mute">
            Profile
          </p>
          <p className="mt-2 text-3xl font-semibold text-teal-deep">{completeness}%</p>
          <p className="mt-1 text-sm text-ink-soft">completeness</p>
          <Link
            href="/dashboard/profile"
            className="mt-3 inline-block text-sm font-semibold text-teal-deep underline-offset-2 hover:underline"
          >
            Edit profile →
          </Link>
          {registration ? (
            <Link
              href={`/${registration.edition.slug}/attendees`}
              className="mt-2 block text-sm font-semibold text-teal-deep underline-offset-2 hover:underline"
            >
              Attendee directory →
            </Link>
          ) : null}
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-3xl tracking-wide text-teal-deep">
          My schedule
        </h2>
        {mySchedule.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">
            No RSVPs yet.{" "}
            <Link href="/programme" className="text-teal-deep underline">
              Browse programme
            </Link>
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {mySchedule.map((r) => (
              <li
                key={r.id}
                className="rounded-lg border border-line bg-white px-4 py-3 text-sm"
              >
                <span className="font-semibold text-teal-deep">
                  {formatIstRange(r.session.startsAt, r.session.endsAt)}
                </span>{" "}
                — {r.session.title}
                <span className="text-mute">
                  {" "}
                  · {r.status === "GOING" ? "Going" : `Waitlist #${r.position}`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/programme"
          className="rounded-md bg-teal-deep px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.1em] text-white hover:bg-teal"
        >
          Programme & RSVP
        </Link>
      </div>
    </main>
  );
}
