import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { ConferenceCall } from "@/components/conference/ConferenceCall";
import { ConferenceStatusCard } from "@/components/conference/ConferenceStatusCard";
import { landingFontClassName } from "@/components/landing/fonts";
import { ConferenceForm } from "./ConferenceForm";
import { getCurrentUser } from "@/lib/auth/session";
import {
  CONFERENCE_TOKEN_COOKIE,
  applicationFeeDue,
  findMyConferenceApplication,
} from "@/lib/conference-access";
import { CFP_DEADLINE, CFP_TAGLINE, CFP_TITLE } from "@/lib/conference-copy";
import { conferencePayPath } from "@/lib/conference-server";
import {
  breadcrumbJsonLd,
  eventJsonLd,
  graphJsonLd,
  organizationJsonLd,
  pageMetadata,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Call for Research Papers",
  description:
    "IITB INV.ENT Conference — where entrepreneurship research meets venture practice. Submit an extended abstract by 15 October 2026. Presentations 31 January 2027 at IIT Bombay.",
  path: "/conference",
});

export default async function ConferencePage() {
  const user = await getCurrentUser().catch(() => null);
  let application = null;
  try {
    const cookieToken =
      (await cookies()).get(CONFERENCE_TOKEN_COOKIE)?.value ?? null;
    application = await findMyConferenceApplication({
      userId: user?.id,
      email: user?.email,
      cookieToken,
    });
  } catch {
    // Call for papers must still render if the database is down.
  }

  if (application && applicationFeeDue(application)) {
    redirect(conferencePayPath(application.paymentToken, true));
  }

  const signedInName = user
    ? user.name.trim().split(/\s+/)[0] || user.name || "Account"
    : null;

  const applySlot = application ? (
    <div className="landing-form mt-8" data-testid="conference-existing">
      <p className="landing-kicker">Your application</p>
      <h3 className="landing-serif mt-2 text-[28px] font-normal text-frost">
        Already received
      </h3>
      <ConferenceStatusCard
        tone="landing"
        status={application.status}
        participationCategory={application.participationCategory}
        participationOther={application.participationOther}
        paperTitle={application.paperTitle}
        paymentStatus={application.paymentStatus}
        paymentAmountPaise={application.paymentAmountPaise}
        paymentToken={application.paymentToken}
      />
      {user ? (
        <p className="mt-4 text-sm text-mist">
          <Link href="/dashboard" className="text-spark underline-offset-2 hover:underline">
            Open dashboard →
          </Link>
        </p>
      ) : (
        <p className="mt-4 text-sm text-mist">
          <Link
            href="/signup"
            className="text-spark underline-offset-2 hover:underline"
          >
            Create an account
          </Link>{" "}
          with this email so notices stay on your dashboard.
        </p>
      )}
    </div>
  ) : (
    <ConferenceForm
      defaultName={user?.name ?? ""}
      defaultEmail={user?.email ?? ""}
    />
  );

  return (
    <div className={landingFontClassName()}>
      <JsonLd
        data={graphJsonLd(
          organizationJsonLd(),
          eventJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Call for Research Papers", path: "/conference" },
          ]),
          {
            "@type": "Event",
            name: CFP_TITLE,
            description: `${CFP_TAGLINE}. Extended abstract deadline ${CFP_DEADLINE}.`,
            url: "https://iitbinvent.com/conference",
            startDate: "2027-01-31",
            endDate: "2027-01-31",
            eventAttendanceMode:
              "https://schema.org/OfflineEventAttendanceMode",
            eventStatus: "https://schema.org/EventScheduled",
            location: {
              "@type": "Place",
              name: "IIT Bombay",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Mumbai",
                addressCountry: "IN",
              },
            },
          },
        )}
      />
      <ConferenceCall signedInName={signedInName} applySlot={applySlot} />
    </div>
  );
}
