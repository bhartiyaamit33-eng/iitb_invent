import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PersonaType } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { fillConnectNote, firstNameFromFullName } from "@/lib/connect";
import { ConnectOnLinkedIn } from "@/components/ConnectOnLinkedIn";
import { RequestConnectForm } from "@/components/RequestConnectForm";
import { ShowBio } from "@/components/ShowBio";
import { IconGlobe, IconMail } from "@/components/icons";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  persona?: string;
  q?: string;
  looking?: string;
  session?: string;
}>;

export default async function AttendeesPage({
  params,
  searchParams,
}: {
  params: Promise<{ year: string }>;
  searchParams: SearchParams;
}) {
  const { year } = await params;
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (!user) {
    redirect(
      `/login?callbackUrl=${encodeURIComponent(`/${year}/attendees`)}`,
    );
  }

  const edition = await prisma.edition.findUnique({ where: { slug: year } });
  if (!edition) notFound();

  const registration = await prisma.registration.findUnique({
    where: {
      userId_editionId: { userId: user.id, editionId: edition.id },
    },
  });
  if (!registration || registration.status !== "CONFIRMED") {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-4xl text-teal-deep">Directory</h1>
        <p className="mt-4 text-ink-soft">
          Confirm your registration for {edition.name} to view attendees who
          opted in.
        </p>
        <Link href="/dashboard" className="mt-4 inline-block text-teal-deep underline">
          Go to dashboard
        </Link>
      </main>
    );
  }

  const persona =
    sp.persona && Object.values(PersonaType).includes(sp.persona as PersonaType)
      ? (sp.persona as PersonaType)
      : undefined;
  const q = sp.q?.trim() ?? "";
  const looking = sp.looking?.trim() ?? "";
  const sessionFilter = sp.session?.trim() ?? "";

  let sameSessionUserIds: string[] | null = null;
  if (sessionFilter === "mine") {
    const mySessions = await prisma.rsvp.findMany({
      where: {
        userId: user.id,
        status: "GOING",
        session: { editionId: edition.id },
      },
      select: { sessionId: true },
    });
    const ids = mySessions.map((m) => m.sessionId);
    if (ids.length === 0) {
      sameSessionUserIds = [];
    } else {
      const peers = await prisma.rsvp.findMany({
        where: {
          sessionId: { in: ids },
          status: "GOING",
          userId: { not: user.id },
        },
        select: { userId: true },
      });
      sameSessionUserIds = [...new Set(peers.map((p) => p.userId))];
    }
  }

  const attendees = await prisma.user.findMany({
    where: {
      deletedAt: null,
      id: sameSessionUserIds ? { in: sameSessionUserIds } : undefined,
      registrations: {
        some: { editionId: edition.id, status: "CONFIRMED" },
      },
      profile: {
        is: {
          directoryOptIn: true,
          deletedAt: null,
          ...(persona ? { personaType: persona } : {}),
          ...(looking
            ? { lookingFor: { has: looking } }
            : {}),
        },
      },
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { profile: { headline: { contains: q, mode: "insensitive" } } },
              {
                profile: {
                  organisation: { contains: q, mode: "insensitive" },
                },
              },
            ],
          }
        : {}),
    },
    take: 100,
    include: {
      profile: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Stable daily shuffle seeded by viewer id
  const day = new Date().toISOString().slice(0, 10);
  const seed = `${user.id}-${day}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const shuffled = [...attendees].sort((a, b) => {
    const ha = (hash ^ a.id.charCodeAt(0)) % 997;
    const hb = (hash ^ b.id.charCodeAt(0)) % 997;
    return ha - hb;
  });

  const me = await prisma.user.findUnique({
    where: { id: user.id },
    include: { profile: true },
  });
  const eventDateShort = edition.startsAt.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
        {edition.name} · Directory
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-wide text-teal-deep">
        Attendees
      </h1>
      <p className="mt-3 text-ink-soft">
        Only people who opted in. Emails stay hidden unless they chose to show
        them.
      </p>

      <form className="mt-6 flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search"
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
        <select
          name="persona"
          defaultValue={persona ?? ""}
          className="rounded-md border border-line px-3 py-2 text-sm"
        >
          <option value="">All personas</option>
          {Object.values(PersonaType).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          name="looking"
          defaultValue={looking}
          className="rounded-md border border-line px-3 py-2 text-sm"
        >
          <option value="">Looking for…</option>
          <option value="co-founder">co-founder</option>
          <option value="hiring">hiring</option>
          <option value="raising">raising</option>
          <option value="research collaborators">research collaborators</option>
        </select>
        <label className="flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm">
          <input
            type="checkbox"
            name="session"
            value="mine"
            defaultChecked={sessionFilter === "mine"}
          />
          Same session as me
        </label>
        <button
          type="submit"
          className="rounded-md bg-teal-deep px-4 py-2 text-sm font-semibold text-white"
        >
          Filter
        </button>
      </form>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {shuffled.length === 0 ? (
          <p className="text-ink-soft">No opted-in attendees match.</p>
        ) : (
          shuffled.map((a) => {
            const p = a.profile!;
            return (
              <article
                key={a.id}
                className="rounded-xl border border-line bg-white p-5"
              >
                <div className="flex items-start gap-3">
                  {a.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.image}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper text-sm font-semibold text-teal-deep">
                      {a.name.slice(0, 1)}
                    </div>
                  )}
                  <div>
                    <h2 className="font-semibold text-ink">{a.name}</h2>
                    {p.personaType ? (
                      <p className="text-xs uppercase tracking-[0.1em] text-mute">
                        {p.personaType}
                      </p>
                    ) : null}
                  </div>
                </div>
                {p.headline ? (
                  <p className="mt-3 text-sm text-ink-soft">{p.headline}</p>
                ) : null}
                {p.organisation ? (
                  <p className="mt-1 text-sm text-mute">{p.organisation}</p>
                ) : null}
                {p.bio ? <ShowBio bio={p.bio} /> : null}
                {p.interests.length > 0 ? (
                  <p className="mt-2 text-xs text-mute">
                    {p.interests.join(" · ")}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {p.linkedinUrl && me ? (
                    <ConnectOnLinkedIn
                      variant="icon"
                      linkedinUrl={p.linkedinUrl}
                      note={fillConnectNote(edition.connectNoteTemplate, {
                        firstName: firstNameFromFullName(a.name),
                        senderName: me.name,
                        senderHeadline: me.profile?.headline ?? "",
                        eventName: edition.name,
                        eventDateShort,
                        sessionName: "",
                      })}
                    />
                  ) : null}
                  {p.websiteUrl ? (
                    <a
                      href={
                        /^https?:\/\//i.test(p.websiteUrl)
                          ? p.websiteUrl
                          : `https://${p.websiteUrl}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-lg hover:bg-paper"
                      title="Website"
                      aria-label="Website"
                    >
                      <IconGlobe className="h-5 w-5" />
                    </a>
                  ) : null}
                  {p.showEmail ? (
                    <a
                      href={`mailto:${a.email}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-teal-deep hover:bg-paper"
                      title={a.email}
                      aria-label={`Email ${a.name}`}
                    >
                      <IconMail className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>
                {a.id !== user.id ? (
                  <div className="mt-3">
                    <RequestConnectForm
                      toUserId={a.id}
                      toName={a.name}
                      year={year}
                    />
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </main>
  );
}
