import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { getCurrentUser } from "@/lib/auth/session";
import {
  CONFERENCE_TOKEN_COOKIE,
  applicationFeeDue,
  findMyConferenceApplication,
} from "@/lib/conference-access";
import { conferencePayPath } from "@/lib/conference-server";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  graphJsonLd,
  organizationJsonLd,
  pageMetadata,
} from "@/lib/seo";
import { ConferenceCall } from "./ConferenceCall";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Call for Papers · Entrepreneurship Research and Venture Practice Conference",
  description:
    "IITB INV.ENT is the Entrepreneurship Research and Venture Practice Conference at IIT Bombay, 30-31 January 2027. 30 January is Day Zero. Abstract deadline 15 October 2026.",
  path: "/conference",
});

export default async function ConferencePage() {
  const user = await getCurrentUser();
  const cookieToken =
    (await cookies()).get(CONFERENCE_TOKEN_COOKIE)?.value ?? null;
  let application: Awaited<
    ReturnType<typeof findMyConferenceApplication>
  > = null;
  try {
    application = await findMyConferenceApplication({
      userId: user?.id,
      email: user?.email,
      cookieToken,
    });
  } catch (err) {
    console.error("[conference] lookup", err);
  }

  if (application && applicationFeeDue(application)) {
    redirect(conferencePayPath(application.paymentToken));
  }

  return (
    <>
      <JsonLd
        data={graphJsonLd(
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Call for Papers", path: "/conference" },
          ]),
          {
            "@type": "Event",
            name: "INV.ENT Entrepreneurship Research and Venture Practice Conference",
            description:
              "A conference where people meet, network, attend sessions, workshops, and events, get exposure to entrepreneurship research, and hear talks on entrepreneurship in practice.",
            url: absoluteUrl("/conference"),
            eventStatus: "https://schema.org/EventScheduled",
            eventAttendanceMode:
              "https://schema.org/OfflineEventAttendanceMode",
            startDate: "2027-01-30",
            endDate: "2027-01-31",
            location: {
              "@type": "Place",
              name: "IIT Bombay",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Mumbai",
                addressRegion: "Maharashtra",
                addressCountry: "IN",
              },
            },
            organizer: { "@id": `${absoluteUrl("/")}#organization` },
          },
        )}
      />
      <ConferenceCall
        application={
          application
            ? {
                status: application.status,
                participationCategory: application.participationCategory,
                participationOther: application.participationOther,
                paperTitle: application.paperTitle,
                paymentStatus: application.paymentStatus,
                paymentAmountPaise: application.paymentAmountPaise,
                paymentToken: application.paymentToken,
              }
            : null
        }
        defaultName={user?.name ?? ""}
        defaultEmail={user?.email ?? ""}
        signedIn={Boolean(user)}
      />
    </>
  );
}
