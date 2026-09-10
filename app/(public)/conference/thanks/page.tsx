import Link from "next/link";
import { ConferenceSubpage } from "@/components/conference/ConferenceSubpage";
import { landingFontClassName } from "@/components/landing/fonts";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Application received · Research Conference",
};

export default async function ConferenceThanksPage() {
  const user = await getCurrentUser();
  const signedInName = user
    ? user.name.trim().split(/\s+/)[0] || user.name || "Account"
    : null;

  return (
    <div className={landingFontClassName()}>
      <ConferenceSubpage signedInName={signedInName}>
        <p className="landing-kicker">Research conference</p>
        <h1
          className="landing-serif text-[clamp(36px,5vw,56px)] font-medium tracking-[-0.02em] text-frost"
          data-testid="conference-thanks"
        >
          Application received
        </h1>
        <p className="lead">
          Thank you. Organisers at the Desai Sethi School of Entrepreneurship
          will review your extended abstract for IITB INV.ENT 2027. If you
          asked for a copy, it is on its way to the email you entered.
        </p>
        <p className="lead">
          Decisions follow the published dates — results on 15 November 2026.
          If you are selected, payment instructions will appear on your
          dashboard. You will not fill the application form again.
        </p>
        <p className="text-sm text-mist">
          Questions:{" "}
          <a href="mailto:support@iitbinvent.com">support@iitbinvent.com</a>
        </p>
        <div className="cta-row">
          {user ? (
            <Link
              href="/dashboard"
              className="btn"
              data-testid="thanks-dashboard"
            >
              Open dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/signup?callbackUrl=%2Fdashboard"
                className="btn"
                data-testid="thanks-signup"
              >
                Create account
              </Link>
              <Link
                href="/login?callbackUrl=%2Fdashboard"
                className="btn ghost"
              >
                Sign in
              </Link>
            </>
          )}
          <Link href="/conference" className="btn ghost">
            Back to the call
          </Link>
        </div>
      </ConferenceSubpage>
    </div>
  );
}
