import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/site/PageHero";
import { SiteShell } from "@/components/site/SiteShell";
import { getCurrentUser } from "@/lib/auth/session";
import {
  applicationFeeDue,
  findMyConferenceApplication,
} from "@/lib/conference-access";
import { conferencePayPath } from "@/lib/conference-server";
import { ABSTRACT_DEADLINE_LONG, LOGIN_TO_SUBMIT_HREF } from "@/lib/landing";
import { EVENT_DATES } from "@/lib/site-content";
import { noIndex, pageMetadata } from "@/lib/seo";
import { ApplicationPanel } from "../research/ApplicationPanel";
import { SubmissionForm } from "../research/SubmissionForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Complete registration",
    description: "Register for IITB INV.ENT 2027 at IIT Bombay as an attendee or presenter.",
    path: "/register",
  }),
  ...noIndex,
};

function errorMessage(error: string) {
  if (error === "not_found") return "That registration was not found.";
  if (error === "missing") return "Missing registration.";
  if (error === "confirm") return "Type DELETE in the confirm field to remove this registration.";
  return error;
}

/** Where people land after logging in: the registration form, or where their registration stands. */
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; error?: string }>;
}) {
  const { deleted, error } = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect(LOGIN_TO_SUBMIT_HREF);

  const application = await findMyConferenceApplication({
    userId: user.id,
    email: user.email,
  }).catch((err) => {
    console.error("[register] lookup", err);
    return null;
  });
  if (application && applicationFeeDue(application)) {
    redirect(conferencePayPath(application.paymentToken));
  }

  return (
    <SiteShell crumbs={[{ href: "/register", label: "Registration" }]}>
      <PageHero
        kicker="Registration"
        title="Complete registration"
        lede="Attendees pay when they register and receive a proforma invoice by email. Paper, poster and other presenters add an extended abstract (PDF, max 10 MB) and pay once organisers shortlist it."
        meta={[
          `Conference · ${EVENT_DATES}`,
          "Venue · IIT Bombay, Mumbai",
          `Abstract deadline · ${ABSTRACT_DEADLINE_LONG} (midnight)`,
        ]}
      />
      <section className="site-section is-tight" id="submit" data-testid="conference-submit">
        <div className="site-shell" style={{ maxWidth: 820 }}>
          {deleted ? (
            <p className="site-alert is-ok" role="status" data-testid="application-deleted">
              Registration deleted. You can register again below.
            </p>
          ) : null}
          {error ? (
            <p className="site-alert is-error" role="alert">
              {errorMessage(error)}
            </p>
          ) : null}

          {application ? (
            <ApplicationPanel
              application={{
                id: application.id,
                name: application.name,
                status: application.status,
                participationCategory: application.participationCategory,
                participationOther: application.participationOther,
                paperTitle: application.paperTitle,
                paymentStatus: application.paymentStatus,
                paymentAmountPaise: application.paymentAmountPaise,
                paymentToken: application.paymentToken,
              }}
              signedIn
            />
          ) : (
            <SubmissionForm defaultName={user.name} defaultEmail={user.email} />
          )}

          <p className="site-form-fine">
            Read the <Link href="/research" style={{ textDecoration: "underline" }}>call for papers</Link> for
            tracks, guidelines and fees. Questions: support@iitbinvent.com
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
