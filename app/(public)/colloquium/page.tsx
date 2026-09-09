import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { ColloquiumForm } from "./ColloquiumForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research Colloquium · Call for applications · Inv.ent 2027",
  description:
    "Apply to present a paper or poster at the Entrepreneurship Research Colloquium during Inv.ent, DSSE Day at IIT Bombay. 30–31 January 2027.",
};

export default async function ColloquiumPage() {
  const user = await getCurrentUser();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
        Inv.ent · DSSE · IIT Bombay
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-wide text-teal-deep">
        Call for applications
      </h1>
      <p className="mt-2 text-lg text-ink-soft">
        Entrepreneurship Research Colloquium 2027
      </p>
      <p className="mt-2 text-sm text-mute">
        <Link href="/" className="underline-offset-2 hover:underline">
          ← Home
        </Link>
        {" · "}
        <Link href="/programme" className="underline-offset-2 hover:underline">
          Programme
        </Link>
        {" · "}
        <Link href="/signup" className="underline-offset-2 hover:underline">
          Create account
        </Link>
      </p>

      <section className="mt-8 rounded-xl border border-line bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-mute">
          Event
        </p>
        <h2 className="mt-2 font-display text-3xl tracking-wide text-teal-deep">
          Innovation &amp; Entrepreneurship
        </h2>
        <p className="mt-1 text-sm font-medium text-ink">
          Where entrepreneurship research meets venture practice
        </p>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-[0.12em] text-mute">Date</dt>
            <dd className="mt-1 text-ink">30–31 January 2027</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.12em] text-mute">Time</dt>
            <dd className="mt-1 text-ink">9:00 AM – 6:00 PM IST</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-[0.12em] text-mute">Venue</dt>
            <dd className="mt-1 text-ink">
              B. Nag Auditorium and DSSE, IIT Bombay, Powai, Mumbai 400076
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-[0.12em] text-mute">Host</dt>
            <dd className="mt-1 text-ink">
              Desai Sethi School of Entrepreneurship — IIT Bombay. Part of the
              DSSE Annual Day Symposium.
            </dd>
          </div>
        </dl>
        <p className="mt-5 text-sm leading-relaxed text-ink-soft">
          Inv.ent is the annual foundation-day gathering of the Desai Sethi
          School of Entrepreneurship at IIT Bombay. It exists so ideas do not
          die in labs: students, faculty, founders, investors, and operators
          share one campus day — then stay connected through the year.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          On 31 January 2014, IIT Bombay’s Board of Governors approved what
          became DSSE. That anniversary is DSSE Day. Inv.ent is how the school
          opens its doors publicly: speaker sessions, poster presentations,
          venture pitches, and the conversations that turn prototypes into
          companies. Editions stack year after year. The day is the spark; the
          platform is the continuity.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-3xl tracking-wide text-teal-deep">
          Ignite your research
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          The Entrepreneurship Research Colloquium is the premier stage at IIT
          Bombay for advanced PhD scholars and early-career researchers to gain
          high-impact visibility. This is more than a presentation — it is a
          launchpad.
        </p>
        <ul className="mt-4 space-y-3 text-sm text-ink-soft">
          <li>
            <strong className="text-ink">Compete for excellence.</strong> Win
            one of two Best Paper Awards, each carrying a prize of ₹25,000.
          </li>
          <li>
            <strong className="text-ink">Elevate your profile.</strong> Present
            to a panel of eminent experts and senior researchers for feedback and
            networking.
          </li>
          <li>
            <strong className="text-ink">Connect &amp; collaborate.</strong> Join a
            select cohort of 10 research presenters and contribute to the future of
            entrepreneurship research.
          </li>
        </ul>
        <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg border border-line bg-white px-4 py-3">
            <p className="text-xs uppercase tracking-[0.12em] text-mute">Focus</p>
            <p className="mt-1 text-ink">
              Advanced-stage PhD scholars (4th/5th year), post-docs, and
              early-career professors.
            </p>
          </div>
          <div className="rounded-lg border border-line bg-white px-4 py-3">
            <p className="text-xs uppercase tracking-[0.12em] text-mute">
              Support
            </p>
            <p className="mt-1 text-ink">
              TA for domestic travel and twin-sharing accommodation for selected
              paper and poster presenters, first-come, first-served.
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          Complimentary travel and accommodation for domestic participants is
          limited to paper presenters and poster participants. There is a
          nominal registration fee of ₹3,000 for those who wish to attend DSSE
          Day and the Research Colloquium. Payment details are shared after
          this application is received.
        </p>
      </section>

      <ColloquiumForm
        defaultName={user?.name ?? ""}
        defaultEmail={user?.email ?? ""}
      />
    </main>
  );
}
