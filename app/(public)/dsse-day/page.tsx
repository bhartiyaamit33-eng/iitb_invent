import { JsonLd } from "@/components/JsonLd";
import { PublicChrome } from "@/components/PublicChrome";
import {
  DSSE_DAY_DEFINITION,
  DSSE_DAY_SECTIONS,
  DSSE_DEFINITION,
} from "@/lib/seo-content";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  eventJsonLd,
  graphJsonLd,
  organizationJsonLd,
  pageMetadata,
} from "@/lib/seo";

export const metadata = pageMetadata({
  title: "What is DSSE Day at IIT Bombay?",
  description:
    "DSSE Day is the 31 January foundation day of the Desai Sethi School of Entrepreneurship at IIT Bombay. INVENT is the public programme held that day.",
  path: "/dsse-day",
});

export default function DsseDayPage() {
  return (
    <PublicChrome crumbs={[{ href: "/dsse-day", label: "DSSE Day" }]}>
      <JsonLd
        data={graphJsonLd(
          organizationJsonLd(),
          eventJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "DSSE Day", path: "/dsse-day" },
          ]),
          {
            "@type": "WebPage",
            name: "What is DSSE Day?",
            url: absoluteUrl("/dsse-day"),
            description: DSSE_DAY_DEFINITION,
            mainEntity: {
              "@type": "DefinedTerm",
              name: "DSSE Day",
              alternateName: [
                "DSSE Day IIT Bombay",
                "Desai Sethi School of Entrepreneurship foundation day",
              ],
              description: DSSE_DAY_DEFINITION,
            },
            about: {
              "@type": "EducationalOrganization",
              name: "Desai Sethi School of Entrepreneurship",
              alternateName: ["DSSE", "DSSE IIT Bombay"],
              description: DSSE_DEFINITION,
              url: "https://www.dsse.iitb.ac.in/",
            },
          },
        )}
      />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
          31 January · annually
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-wide text-teal-deep">
          What is DSSE Day?
        </h1>
        <p className="mt-6 text-lg leading-8 text-ink">{DSSE_DAY_DEFINITION}</p>
        <p className="mt-4 text-[17px] leading-7 text-ink-soft">
          {DSSE_DEFINITION}
        </p>
        {DSSE_DAY_SECTIONS.map((section) => (
          <section key={section.heading} className="mt-10">
            <h2 className="font-display text-2xl tracking-wide text-teal-deep">
              {section.heading}
            </h2>
            <p className="mt-3 text-[17px] leading-7 text-ink-soft">
              {section.body}
            </p>
          </section>
        ))}
        <p className="mt-10 text-[17px] leading-7 text-ink-soft">
          See{" "}
          <a href="/about">what INVENT is</a>,{" "}
          <a href="/travel">how to reach the DSSE Building</a>, and the{" "}
          <a href="/programme">programme</a>.
        </p>
      </main>
    </PublicChrome>
  );
}
