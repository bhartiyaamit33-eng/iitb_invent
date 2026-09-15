import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { ConferenceForm } from "./ConferenceForm";
import { ConferenceStatusCard } from "@/components/conference/ConferenceStatusCard";
import {
  CONFERENCE_TOKEN_COOKIE,
  applicationFeeDue,
  findMyConferenceApplication,
} from "@/lib/conference-access";
import { conferencePayPath } from "@/lib/conference-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research Conference · Call for applications · INV.ENT 2027",
  description:
    "Apply to present a paper or poster at INV.ENT, the Entrepreneurship and Venture Practice Conference at IIT Bombay. 30-31 January 2027. 30 January is Day Zero.",
};

export default async function ConferencePage() {
  const user = await getCurrentUser();
  const cookieToken =
    (await cookies()).get(CONFERENCE_TOKEN_COOKIE)?.value ?? null;
  const application = await findMyConferenceApplication({
    userId: user?.id,
    email: user?.email,
    cookieToken,
  });

  if (application && applicationFeeDue(application)) {
    redirect(conferencePayPath(application.paymentToken));
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
        INV.ENT · DSSE · IIT Bombay
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-wide text-teal-deep">
        Call for applications
      </h1>
      <p className="mt-2 text-lg text-ink-soft">
        Entrepreneurship and Venture Practice Conference 2027
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
              Desai Sethi School of Entrepreneurship, IIT Bombay.
            </dd>
          </div>
        </dl>
        <p className="mt-5 text-sm leading-relaxed text-ink-soft">
          INV.ENT is the Entrepreneurship and Venture Practice Conference
          conducted by the Desai Sethi School of Entrepreneurship at IIT Bombay.
          It exists so ideas do not die in labs: students, faculty, founders,
          investors, and operators share the campus programme and then stay
          connected through the year.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          On 31 January 2014, IIT Bombay’s Board of Governors approved what
          became DSSE. On this occasion we celebrate INV.ENT, where
          entrepreneurship research meets venture practice, with speaker
          sessions, poster presentations, venture pitches, and the conversations
          that turn prototypes into companies. 30 January is Day Zero. 31
          January is the conference day.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-3xl tracking-wide text-teal-deep">
          Ignite your research
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          The Entrepreneurship Research Conference is the premier stage at IIT
          Bombay for advanced PhD scholars and early-career researchers to gain
          high-impact visibility. This is more than a presentation. It is a
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
          limited to paper presenters and poster participants. A registration
          fee applies after organisers select you — the same amount whether you
          present a paper, a poster, or attend:
        </p>
        <ul className="mt-3 space-y-1 text-sm text-ink" data-testid="conference-fee-bands">
          <li>Students / research scholars — ₹5,000</li>
          <li>Faculty / professors — ₹10,000</li>
          <li>Corporate / industry — ₹20,000</li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Your amount and the IIT Bombay Online Pay link appear on your
          dashboard only after that decision. You will not fill this form again.
        </p>
      </section>

      {application ? (
        <section className="mt-8 rounded-xl border border-line bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mute">
            Your application
          </p>
          <ConferenceStatusCard
            status={application.status}
            participationCategory={application.participationCategory}
            participationOther={application.participationOther}
            paperTitle={application.paperTitle}
            paymentStatus={application.paymentStatus}
            paymentAmountPaise={application.paymentAmountPaise}
            paymentToken={application.paymentToken}
          />
          {user ? (
            <p className="mt-4 text-sm">
              <Link
                href="/dashboard"
                className="font-semibold text-teal-deep underline-offset-2 hover:underline"
              >
                Open dashboard →
              </Link>
            </p>
          ) : (
            <p className="mt-4 text-sm text-ink-soft">
              <Link
                href="/signup"
                className="font-semibold text-teal-deep underline-offset-2 hover:underline"
              >
                Create an account
              </Link>{" "}
              with this email so notices and Online Pay stay on your dashboard.
            </p>
          )}
        </section>
      ) : (
        <ConferenceForm
          defaultName={user?.name ?? ""}
          defaultEmail={user?.email ?? ""}
        />
      )}
    </main>
  );
}
