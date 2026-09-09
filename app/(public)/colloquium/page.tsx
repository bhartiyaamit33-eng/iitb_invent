import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { ColloquiumForm } from "./ColloquiumForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research submissions · Inv.ent 2027 Conference",
  description:
    "Apply to present a paper or poster at the Inv.ent 2027 Entrepreneurship Research & Practice Conference at IIT Bombay.",
};

export default async function ColloquiumPage() {
  const user = await getCurrentUser();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
        Inv.ent · DSSE · IIT Bombay
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-wide text-teal-deep">
        Call for papers &amp; posters
      </h1>
      <p className="mt-2 text-lg text-ink-soft">
        Inv.ent 2027 · Entrepreneurship Research &amp; Practice Conference
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
          Ideas studied. Ideas built.
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
              Desai Sethi School of Entrepreneurship, IIT Bombay
            </dd>
          </div>
        </dl>
        <p className="mt-5 text-sm leading-relaxed text-ink-soft">
          Inv.ent brings entrepreneurship researchers, educators, founders,
          investors and ecosystem builders together to connect rigorous inquiry
          with venture practice. The programme includes research presentations,
          workshops, startup pitches, networking and an IIT Bombay ecosystem
          experience.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-3xl tracking-wide text-teal-deep">
          Ignite your research
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          PhD scholars, faculty, post-doctoral researchers and industry
          researchers are invited to submit entrepreneurship research for
          consideration as a paper or poster presentation.
        </p>
        <ul className="mt-4 space-y-3 text-sm text-ink-soft">
          <li>
            <strong className="text-ink">Compete for excellence.</strong> Win
            one of two Best Paper Awards, each carrying a prize of ₹25,000.
          </li>
          <li>
            <strong className="text-ink">Elevate your profile.</strong> Present
            to experienced researchers and practitioners for feedback and
            valuable new connections.
          </li>
          <li>
            <strong className="text-ink">Connect &amp; collaborate.</strong> Join a
            multidisciplinary community advancing entrepreneurship research,
            education and practice.
          </li>
        </ul>
        <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg border border-line bg-white px-4 py-3">
            <p className="text-xs uppercase tracking-[0.12em] text-mute">Focus</p>
            <p className="mt-1 text-ink">
              PhD scholars, post-docs, faculty and industry researchers working
              on entrepreneurship.
            </p>
          </div>
          <div className="rounded-lg border border-line bg-white px-4 py-3">
            <p className="text-xs uppercase tracking-[0.12em] text-mute">
              Support
            </p>
            <p className="mt-1 text-ink">
              Limited shared accommodation may be available on a first-come,
              first-served basis. Final terms will be confirmed separately.
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          A ₹3,000 registration fee applies to confirmed paper presenters,
          poster presenters and attendees. Payment details are shared after the
          application decision.
        </p>
      </section>

      <ColloquiumForm
        defaultName={user?.name ?? ""}
        defaultEmail={user?.email ?? ""}
      />
    </main>
  );
}
