import Link from "next/link";
import { getHappeningNow, getUpNext, isLiveStatus } from "@/lib/live";
import { formatIstRange } from "@/lib/editions";
import { prisma } from "@/lib/db";
import { noIndex } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 60;
export const metadata = noIndex;

export default async function NowScreenPage() {
  const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
  if (!edition || !isLiveStatus(edition.status)) {
    return (
      <main className="grid min-h-screen place-items-center bg-hero-deep px-6 text-white">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-white/70">
            Lobby screen
          </p>
          <h1 className="mt-4 font-display text-4xl tracking-wide sm:text-5xl">
            Not live yet
          </h1>
          <p className="mt-4 text-white/80">
            Set the current edition status to LIVE in admin.
          </p>
          <Link href="/admin/editions" className="mt-8 inline-block underline">
            Editions
          </Link>
        </div>
      </main>
    );
  }

  const now = new Date();
  const [happening, upNext] = await Promise.all([
    getHappeningNow(edition.id, now),
    getUpNext(edition.id, now, 6),
  ]);

  const clock = now.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <main className="min-h-screen bg-[#034a56] px-5 py-8 text-white sm:px-8 sm:py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 md:flex-row md:items-end md:justify-between md:gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
            {edition.name} · DSSE Building
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-wide sm:text-6xl md:text-7xl">
            Happening now
          </h1>
        </div>
        <p className="font-display text-4xl tracking-wide tabular-nums sm:text-5xl md:text-6xl">
          {clock}
          <span className="ml-2 text-lg tracking-normal text-white/60">IST</span>
        </p>
      </div>

      <section className="mx-auto mt-12 max-w-6xl space-y-6">
        {happening.length === 0 ? (
          <p className="text-2xl text-white/80">No session in progress.</p>
        ) : (
          happening.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-white/20 bg-white/10 px-5 py-5 backdrop-blur sm:px-8 sm:py-6"
            >
              <p className="text-sm uppercase tracking-[0.16em] text-ent-bright">
                {s.room}
                {s.floor ? ` · Floor ${s.floor}` : ""}
              </p>
              <h2 className="mt-2 font-display text-3xl tracking-wide sm:text-5xl md:text-6xl">
                {s.title}
              </h2>
              <p className="mt-2 text-lg text-white/80 sm:text-xl">
                {formatIstRange(s.startsAt, s.endsAt)}
              </p>
            </div>
          ))
        )}
      </section>

      <section className="mx-auto mt-10 max-w-6xl sm:mt-14">
        <h2 className="font-display text-3xl tracking-wide text-white/90 sm:text-4xl">
          Up next
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {upNext.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-white/15 bg-black/20 px-5 py-4 sm:px-6 sm:py-5"
            >
              <p className="text-lg font-semibold text-inv-bright">
                {formatIstRange(s.startsAt, s.endsAt)}
              </p>
              <p className="mt-1 text-xl font-semibold sm:text-2xl">{s.title}</p>
              <p className="mt-1 text-white/70">{s.room}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="mx-auto mt-16 max-w-6xl text-sm text-white/50">
        Auto-refreshes about every 60s · cast this page in the lobby
      </p>
    </main>
  );
}
