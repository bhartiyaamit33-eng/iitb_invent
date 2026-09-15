import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { TicketQr } from "@/components/TicketQr";
import { formatIstRange } from "@/lib/editions";
import { getNextForUser } from "@/lib/live";
import { ticketBadgeUrl } from "@/lib/ticket";
import { ConferenceStatusCard } from "@/components/conference/ConferenceStatusCard";
import { NotificationsPanel } from "@/components/dashboard/NotificationsPanel";
import {
  applicationFeeDue,
  applicationGrantsTicket,
  issueEventTicketForApplication,
} from "@/lib/conference-access";

type SearchParams = Promise<{ welcome?: string; submitted?: string }>;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  const application = await prisma.conferenceApplication.findFirst({
    where: {
      OR: [{ userId: user.id }, { email: user.email }],
      edition: { isCurrent: true },
    },
    orderBy: { createdAt: "desc" },
  });

  if (application && applicationGrantsTicket(application)) {
    await issueEventTicketForApplication(application.id);
  }

  const registration = await prisma.registration.findFirst({
    where: { userId: user.id, edition: { isCurrent: true } },
    include: { edition: true },
  });
  const notices = await prisma.userNotification.findMany({
    where: { userId: user.id },
    orderBy: [{ createdAt: "desc" }],
    take: 8,
  });

  const ticketReady = Boolean(
    application && applicationGrantsTicket(application) && registration,
  );

  const completeness = profile?.completeness ?? 0;
  const now = new Date();
  const nextRsvp =
    ticketReady && registration
      ? await getNextForUser(user.id, registration.editionId, now)
      : null;

  const mySchedule =
    ticketReady && registration
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

  const showProfileNudge =
    Boolean(application) && completeness < 60 && !params.welcome;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      {params.welcome ? (
        <div
          className="mb-8 rounded-xl border border-ent/30 bg-white px-5 py-4 shadow-sm"
          data-testid="welcome-account"
        >
          <p className="font-semibold text-teal-deep">Account created</p>
          <p className="mt-1 text-sm text-ink-soft">
            Logging in is not a ticket to INV.ENT. Submit a paper or poster
            abstract next. Organisers review it, then you pay the fee for your
            category. Only after that do you receive a ticket.
          </p>
          <Link
            href="/conference#submit"
            className="mt-3 inline-block text-sm font-semibold text-teal-deep underline-offset-2 hover:underline"
          >
            Submit your abstract →
          </Link>
        </div>
      ) : null}

      {params.submitted || showProfileNudge ? (
        <div
          className="mb-8 rounded-xl border border-teal/30 bg-white px-5 py-4 shadow-sm"
          data-testid="profile-nudge"
        >
          <p className="font-semibold text-teal-deep">Abstract received</p>
          <p className="mt-1 text-sm text-ink-soft">
            Add a few profile details so organisers know who you are. This is
            your profile, not a ticket.
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
        Account
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-wide text-teal-deep">
        Hi, {user.name.split(" ")[0] || "there"}
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        An account is for submitting an abstract and managing your profile. It
        is not confirmation for the event.
      </p>

      <NotificationsPanel
        notices={notices.map((n) => ({
          id: n.id,
          title: n.title,
          body: n.body,
          href: n.href,
          readAt: n.readAt ? n.readAt.toISOString() : null,
          createdAt: n.createdAt.toISOString(),
        }))}
      />

      {nextRsvp?.session ? (
        <p className="mt-4 rounded-lg border border-teal/30 bg-white px-4 py-3 text-sm text-ink-soft">
          Your next session:{" "}
          <strong className="text-ink">{nextRsvp.session.title}</strong>
          {nextRsvp.session.room ? `, ${nextRsvp.session.room}` : ""} ·{" "}
          {formatIstRange(nextRsvp.session.startsAt, nextRsvp.session.endsAt)} IST
        </p>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div
          className={`rounded-xl border bg-white p-5 sm:col-span-2 ${
            application && applicationFeeDue(application)
              ? "border-ent"
              : "border-line"
          }`}
          data-testid="conference-dashboard-card"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mute">
            Paper or poster
          </p>
          {application ? (
            <ConferenceStatusCard
              status={application.status}
              participationCategory={application.participationCategory}
              participationOther={application.participationOther}
              paperTitle={application.paperTitle}
              paymentStatus={application.paymentStatus}
              paymentAmountPaise={application.paymentAmountPaise}
              paymentToken={application.paymentToken}
            />
          ) : (
            <>
              <p className="mt-2 text-sm text-ink-soft">
                Submit a paper or poster abstract. After organisers select you,
                pay the fee for your category to receive your event ticket.
              </p>
              <Link
                href="/conference#submit"
                className="mt-3 inline-block text-sm font-semibold text-teal-deep underline-offset-2 hover:underline"
              >
                Submit abstract →
              </Link>
            </>
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
        </div>
        {ticketReady && registration ? (
          <div
            className="rounded-xl border border-line bg-white p-5"
            data-testid="event-ticket"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mute">
              Event ticket
            </p>
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
              <p className="mt-1 text-sm text-mute">Confirmed</p>
            )}
            <div className="mt-4">
              <TicketQr
                token={registration.qrToken}
                badgeUrl={ticketBadgeUrl(registration.qrToken)}
              />
            </div>
          </div>
        ) : null}
      </div>

      {ticketReady ? (
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
                  - {r.session.title}
                  <span className="text-mute">
                    {" "}
                    · {r.status === "GOING" ? "Going" : `Waitlist #${r.position}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/conference#submit"
          className="rounded-md bg-teal-deep px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.1em] text-white hover:bg-teal"
        >
          {application ? "View application" : "Submit abstract"}
        </Link>
        <Link
          href="/programme"
          className="rounded-md border border-line bg-white px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.1em] text-teal-deep hover:border-teal"
        >
          Programme
        </Link>
      </div>
    </main>
  );
}
