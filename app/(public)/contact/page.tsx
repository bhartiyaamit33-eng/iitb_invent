import { JsonLd } from "@/components/JsonLd";
import { PublicChrome } from "@/components/PublicChrome";
import { CONTACT_EMAIL, CONTACT_PAGE } from "@/lib/seo-content";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  graphJsonLd,
  organizationJsonLd,
  pageMetadata,
  VENUE,
} from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact IITB INV.ENT",
  description:
    "Queries for IITB INV.ENT: press, partners, speakers, volunteers, campus access. Write to support@iitbinvent.com. DSSE Building, IIT Bombay, Powai, Mumbai 400076.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <PublicChrome crumbs={[{ href: "/contact", label: "Contact" }]}>
      <JsonLd
        data={graphJsonLd(
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
          {
            "@type": "ContactPage",
            name: "Contact IITB INV.ENT",
            url: absoluteUrl("/contact"),
            description: CONTACT_PAGE.body,
            mainEntity: {
              "@type": "Organization",
              name: "IITB INV.ENT",
              email: CONTACT_EMAIL,
              address: {
                "@type": "PostalAddress",
                streetAddress: VENUE.street,
                addressLocality: VENUE.locality,
                addressRegion: VENUE.region,
                postalCode: VENUE.postal,
                addressCountry: VENUE.country,
              },
              contactPoint: {
                "@type": "ContactPoint",
                email: CONTACT_EMAIL,
                contactType: "customer support",
                availableLanguage: ["English", "Hindi"],
              },
            },
          },
        )}
      />
      <main
        className="mx-auto max-w-3xl px-4 py-10 sm:px-6"
        data-testid="contact-page"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
          {CONTACT_PAGE.kicker}
        </p>
        <h1
          className="mt-2 font-display text-4xl tracking-wide text-teal-deep"
          data-testid="contact-heading"
        >
          {CONTACT_PAGE.title}
        </h1>
        <section className="mt-10">
          <h2 className="font-display text-2xl tracking-wide text-teal-deep">
            {CONTACT_PAGE.heading}
          </h2>
          <p className="mt-3 text-[17px] leading-7 text-ink-soft">
            {CONTACT_PAGE.body}
          </p>
          <p className="mt-8">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-2xl font-semibold text-teal-deep hover:underline"
              data-testid="contact-email"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="mt-8 text-[17px] leading-7 text-ink-soft">
            {VENUE.formatted}
          </p>
        </section>
      </main>
    </PublicChrome>
  );
}
