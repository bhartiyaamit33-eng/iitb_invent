import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

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

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      {params.welcome ? (
        <div className="mb-8 rounded-xl border border-ent/30 bg-white px-5 py-4 shadow-sm">
          <p className="font-semibold text-teal-deep">You&apos;re in.</p>
          <p className="mt-1 text-sm text-ink-soft">
            Want people to know you&apos;re coming? Add LinkedIn and turn on the
            directory — optional, anytime.
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
                Ticket <code className="text-teal-deep">{registration.ticketCode}</code>
              </p>
              <p className="mt-1 text-sm capitalize text-mute">
                {registration.status.toLowerCase()}
              </p>
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
          {completeness < 60 ? (
            <Link
              href="/dashboard/profile"
              className="mt-3 inline-block text-sm font-semibold text-teal-deep underline-offset-2 hover:underline"
            >
              Add LinkedIn so others can find you →
            </Link>
          ) : (
            <Link
              href="/dashboard/profile"
              className="mt-3 inline-block text-sm font-semibold text-teal-deep underline-offset-2 hover:underline"
            >
              Edit profile →
            </Link>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/programme"
          className="rounded-md bg-teal-deep px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.1em] text-white hover:bg-teal"
        >
          View programme
        </Link>
        <Link
          href="/dashboard/profile"
          className="rounded-md border border-line bg-white px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.1em] text-teal-deep hover:border-teal"
        >
          Profile
        </Link>
      </div>
    </main>
  );
}
