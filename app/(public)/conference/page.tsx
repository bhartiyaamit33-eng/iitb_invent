import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { getCurrentUser } from "@/lib/auth/session";
import {
  CONFERENCE_TOKEN_COOKIE,
  applicationFeeDue,
  applicationOwnedByAccount,
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
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const metadata: Metadata = pageMetadata({
  title: "Call for Papers · Entrepreneurship Research and Venture Practice Conference",
  description:
    "IITB INV.ENT is an entrepreneurship research and practice conference at IIT Bombay, 30-31 January 2027. Abstract deadline 15 October 2026.",
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

  const mine =
    application && user && applicationOwnedByAccount(application, user)
      ? application
      : user
        ? null
        : application;

  if (mine && applicationFeeDue(mine)) {
    redirect(conferencePayPath(mine.paymentToken));
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
            name: "IITB INV.ENT Entrepreneurship Research and Venture Practice Conference",
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
          mine
            ? {
                status: mine.status,
                participationCategory: mine.participationCategory,
                participationOther: mine.participationOther,
                paperTitle: mine.paperTitle,
                paymentStatus: mine.paymentStatus,
                paymentAmountPaise: mine.paymentAmountPaise,
                paymentToken: mine.paymentToken,
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
