import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Application received · Research Conference",
};

export default async function ConferenceThanksPage() {
  const user = await getCurrentUser();

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
        Research Conference
      </p>
      <h1
        className="mt-2 font-display text-4xl tracking-wide text-teal-deep"
        data-testid="conference-thanks"
      >
        Application received
      </h1>
      <p className="mt-4 text-ink-soft">
        Thank you. Organisers at the Desai Sethi School of Entrepreneurship will
        review your submission for IITB INV.ENT 2027. A confirmation email is on
        its way to the address you entered.
      </p>
      <p className="mt-3 text-ink-soft">
        When you are selected for a paper, a poster, or as an attendee, you will
        see the registration fee for your category and a personal IIT Bombay
        Online Pay link on your dashboard and in email. You will not fill the
        application form again.
      </p>
      <p className="mt-3 text-sm text-mute">
        Questions:{" "}
        <a href="mailto:support@iitbinvent.com">support@iitbinvent.com</a>
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        {user ? (
          <Link
            href="/dashboard"
            className="rounded-md bg-teal-deep px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.1em] text-white hover:bg-teal"
            data-testid="thanks-dashboard"
          >
            Open dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/signup?callbackUrl=%2Fdashboard"
              className="rounded-md bg-teal-deep px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.1em] text-white hover:bg-teal"
              data-testid="thanks-signup"
            >
              Create account
            </Link>
            <Link
              href="/login?callbackUrl=%2Fdashboard"
              className="rounded-md border border-line bg-white px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.1em] text-teal-deep hover:border-teal"
            >
              Sign in
            </Link>
          </>
        )}
        <Link
          href="/programme"
          className="rounded-md border border-line bg-white px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.1em] text-teal-deep hover:border-teal"
        >
          See the programme
        </Link>
      </div>
    </main>
  );
}
