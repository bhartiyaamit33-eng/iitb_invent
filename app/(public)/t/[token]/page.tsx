import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { IconGlobe, IconLinkedIn, IconMail } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function TicketBadgePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const registration = await prisma.registration.findUnique({
    where: { qrToken: token },
    include: {
      user: { include: { profile: true } },
      edition: true,
    },
  });

  if (!registration || registration.deletedAt || registration.status === "CANCELLED") {
    notFound();
  }

  const user = registration.user;
  const profile = user.profile;
  const verified = registration.status === "CONFIRMED";
  const eventDate = registration.edition.startsAt.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
        Inv.ent · IIT Bombay
      </p>
      <h1 className="mt-2 font-display text-3xl tracking-wide text-teal-deep">
        Attendee badge
      </h1>

      <article className="mt-8 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        <div className="bg-gradient-to-br from-teal-deep to-teal px-6 py-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
            {registration.edition.name}
          </p>
          <p className="mt-1 text-sm text-white/90">{eventDate} · DSSE Building</p>
          {verified ? (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em]">
              <VerifiedMark />
              Verified attendee
            </p>
          ) : (
            <p className="mt-3 text-xs uppercase tracking-[0.1em] text-white/80">
              {registration.status.toLowerCase()}
            </p>
          )}
        </div>

        <div className="px-6 py-6">
          <div className="flex items-start gap-4">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt=""
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-paper text-xl font-semibold text-teal-deep">
                {user.name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-ink">{user.name}</h2>
              {profile?.personaType ? (
                <p className="text-xs uppercase tracking-[0.1em] text-mute">
                  {profile.personaType.replaceAll("_", " ")}
                </p>
              ) : null}
              {profile?.headline ? (
                <p className="mt-1 text-sm text-ink-soft">{profile.headline}</p>
              ) : null}
              {profile?.organisation ? (
                <p className="mt-0.5 text-sm text-mute">{profile.organisation}</p>
              ) : null}
            </div>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-ink-soft">
            I&apos;m attending{" "}
            <strong className="text-ink">
              IIT Bombay Inv.ent
            </strong>
            {registration.edition.name !== "Inv.ent"
              ? ` (${registration.edition.name})`
              : ""}{" "}
            at the Desai Sethi School of Entrepreneurship.
          </p>

          {profile?.bio ? (
            <p className="mt-4 text-sm text-ink-soft">{profile.bio}</p>
          ) : null}

          {(profile?.interests?.length ?? 0) > 0 ? (
            <p className="mt-3 text-xs text-mute">
              {profile!.interests.join(" · ")}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            {profile?.linkedinUrl ? (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-[#0A66C2] hover:bg-paper"
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <IconLinkedIn className="h-4 w-4" />
              </a>
            ) : null}
            {profile?.websiteUrl ? (
              <a
                href={
                  /^https?:\/\//i.test(profile.websiteUrl)
                    ? profile.websiteUrl
                    : `https://${profile.websiteUrl}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-lg hover:bg-paper"
                aria-label="Website"
                title="Website"
              >
                <IconGlobe className="h-5 w-5" />
              </a>
            ) : null}
            {profile?.showEmail ? (
              <a
                href={`mailto:${user.email}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-teal-deep hover:bg-paper"
                aria-label="Email"
                title={user.email}
              >
                <IconMail className="h-4 w-4" />
              </a>
            ) : null}
          </div>

          <p className="mt-6 text-xs text-mute">
            Ticket{" "}
            <code className="text-teal-deep">{registration.ticketCode}</code>
            {registration.checkedInAt ? " · Checked in at gate" : ""}
          </p>
        </div>
      </article>

      <p className="mt-8 text-center text-sm text-mute">
        <Link href="/" className="font-semibold text-teal-deep underline-offset-2 hover:underline">
          Inv.ent home
        </Link>
        {" · "}
        <Link href="/programme" className="underline-offset-2 hover:underline">
          Programme
        </Link>
      </p>
    </main>
  );
}

function VerifiedMark() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
