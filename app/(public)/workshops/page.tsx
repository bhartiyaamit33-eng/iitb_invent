import Link from "next/link";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/JsonLd";
import { PublicChrome } from "@/components/PublicChrome";
import { getCurrentUser } from "@/lib/auth/session";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  graphJsonLd,
  organizationJsonLd,
  pageMetadata,
  VENUE,
} from "@/lib/seo";
import { WORKSHOP, WORKSHOP_DESCRIPTION } from "@/lib/workshops";

export const metadata = pageMetadata({
  title: "Pre-conference workshop on teaching entrepreneurship",
  description: WORKSHOP_DESCRIPTION,
  path: "/workshops",
});

export default async function WorkshopsPage() {
  const user = await getCurrentUser();
  const rsvpHref = user
    ? "/dashboard"
    : `/login?callbackUrl=${encodeURIComponent("/dashboard")}`;
  const rsvpLabel = user ? "Open dashboard" : "Log in to reserve";
  return (
    <PublicChrome crumbs={[{ href: "/workshops", label: "Workshop" }]}>
      <JsonLd
        data={graphJsonLd(
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Workshop", path: "/workshops" },
          ]),
          {
            "@type": "EducationEvent",
            name: "IITB INV.ENT 2027 Pre-conference workshop",
            alternateName: "Teaching entrepreneurship",
            description: WORKSHOP_DESCRIPTION,
            url: absoluteUrl("/workshops"),
            image: absoluteUrl("/opengraph-image"),
            eventStatus: "https://schema.org/EventScheduled",
            eventAttendanceMode:
              "https://schema.org/OfflineEventAttendanceMode",
            startDate: WORKSHOP.startDate,
            endDate: WORKSHOP.startDate,
            isAccessibleForFree: true,
            location: {
              "@type": "Place",
              name: VENUE.name,
              address: {
                "@type": "PostalAddress",
                streetAddress: VENUE.street,
                addressLocality: VENUE.locality,
                addressRegion: VENUE.region,
                postalCode: VENUE.postal,
                addressCountry: VENUE.country,
              },
            },
            organizer: { "@id": `${absoluteUrl("/")}#organization` },
            performer: {
              "@type": "Person",
              name: WORKSHOP.leader.name,
              jobTitle: WORKSHOP.leader.title,
              worksFor: {
                "@type": "CollegeOrUniversity",
                name: "Desai Sethi School of Entrepreneurship",
                url: "https://www.dsse.iitb.ac.in/",
              },
            },
            superEvent: { "@id": `${absoluteUrl("/")}#event-2027` },
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "INR",
              availability: "https://schema.org/LimitedAvailability",
              url: absoluteUrl("/workshops"),
              description: WORKSHOP.fee,
            },
          },
        )}
      />
      <main
        className="mx-auto max-w-3xl px-4 py-10 sm:px-6"
        data-testid="workshops-page"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
          {WORKSHOP.kicker}
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-wide text-teal-deep">
          {WORKSHOP.title}
        </h1>
        <p className="mt-2 font-display text-2xl tracking-wide text-ink">
          {WORKSHOP.subtitle}
        </p>
        <p className="mt-6 text-lg leading-8 text-ink">{WORKSHOP.lead}</p>
        <p className="mt-4 text-[17px] leading-7 text-ink-soft">
          {WORKSHOP.body} It is led by {WORKSHOP.leader.name},{" "}
          {WORKSHOP.leader.title}.
        </p>

        <dl
          className="mt-10 grid gap-4 sm:grid-cols-2"
          data-testid="workshops-facts"
        >
          <Fact label="Date">
            {WORKSHOP.dateLabel}, {WORKSHOP.dateNote}
          </Fact>
          <Fact label="Venue">{WORKSHOP.venue}</Fact>
          <Fact label="Fee">{WORKSHOP.fee}</Fact>
          <Fact label="Places">{WORKSHOP.seats}</Fact>
        </dl>

        <section className="mt-12" data-testid="workshops-attend">
          <h2 className="font-display text-2xl tracking-wide text-teal-deep">
            {WORKSHOP.attend.heading}
          </h2>
          {WORKSHOP.attend.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-3 text-[17px] leading-7 text-ink-soft">
              {paragraph}
            </p>
          ))}
          <p className="mt-6">
            <Link
              href={rsvpHref}
              className="inline-block rounded-md bg-teal-deep px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.1em] text-white hover:bg-teal"
              data-testid="workshops-rsvp"
            >
              {rsvpLabel}
            </Link>
          </p>
          <p className="mt-3 text-sm text-mute">
            Already registered?{" "}
            <Link href="/dashboard" className="text-teal-deep hover:underline">
              Open your dashboard
            </Link>
            . Conference details are on the{" "}
            <Link href="/conference" className="text-teal-deep hover:underline">
              call for papers
            </Link>
            .
          </p>
        </section>

        <section className="mt-12" data-testid="workshops-audience">
          <h2 className="font-display text-2xl tracking-wide text-teal-deep">
            {WORKSHOP.audience.heading}
          </h2>
          <ul className="mt-4 space-y-3">
            {WORKSHOP.audience.items.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-line bg-white px-4 py-4 text-[17px] leading-7 text-ink-soft"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </PublicChrome>
  );
}

function Fact({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-white px-4 py-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-mute">
        {label}
      </dt>
      <dd className="mt-1 text-[17px] leading-7 text-ink">{children}</dd>
    </div>
  );
}
