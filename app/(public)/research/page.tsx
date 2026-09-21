import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { SiteShell } from "@/components/site/SiteShell";
import { getCurrentUser } from "@/lib/auth/session";
import {
  CONFERENCE_TOKEN_COOKIE,
  applicationFeeDue,
  findMyConferenceApplication,
} from "@/lib/conference-access";
import { conferencePayPath } from "@/lib/conference-server";
import { KEY_DATES, markTimeline } from "@/lib/landing";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  graphJsonLd,
  organizationJsonLd,
  pageMetadata,
} from "@/lib/seo";
import { ResearchCall } from "./ResearchCall";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const metadata: Metadata = pageMetadata({
  title: "Research · Call for Papers",
  description:
    "Research papers, poster presentations, and pre-conference workshops at IITB INV.ENT, IIT Bombay, 30-31 January 2027. Abstract deadline 15 October 2026. Top submissions are forwarded to partner journals.",
  path: "/research",
});

export default async function ResearchPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; error?: string }>;
}) {
  const { deleted, error } = await searchParams;
  const user = await getCurrentUser();
  const cookieToken = (await cookies()).get(CONFERENCE_TOKEN_COOKIE)?.value ?? null;

  let application: Awaited<ReturnType<typeof findMyConferenceApplication>> = null;
  try {
    application = await findMyConferenceApplication({
      userId: user?.id,
      email: user?.email,
      cookieToken,
    });
  } catch (err) {
    console.error("[research] lookup", err);
  }

  if (application && applicationFeeDue(application)) {
    redirect(conferencePayPath(application.paymentToken));
  }

  return (
    <SiteShell crumbs={[{ href: "/research", label: "Research" }]}>
      <JsonLd
        data={graphJsonLd(
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Research", path: "/research" },
          ]),
          {
            "@type": "Event",
            name: "IITB INV.ENT Entrepreneurship Research and Venture Practice Conference",
            description:
              "A conference where people meet, network, attend sessions, workshops, and events, get exposure to entrepreneurship research, and hear talks on entrepreneurship in practice.",
            url: absoluteUrl("/research"),
            eventStatus: "https://schema.org/EventScheduled",
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
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
      <ResearchCall
        application={
          application
            ? {
                id: application.id,
                name: application.name,
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
        deleted={Boolean(deleted)}
        error={error}
        timeline={markTimeline(KEY_DATES)}
      />
    </SiteShell>
  );
}
