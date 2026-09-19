import { JsonLd } from "@/components/JsonLd";
import { LinkedText } from "@/components/Prose";
import { PublicChrome } from "@/components/PublicChrome";
import { ABOUT_PAGE, INVENT_DEFINITION } from "@/lib/seo-content";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  graphJsonLd,
  organizationJsonLd,
  pageMetadata,
  websiteJsonLd,
} from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About IITB INV.ENT",
  description: INVENT_DEFINITION,
  path: "/about",
});

export default function AboutPage() {
  return (
    <PublicChrome crumbs={[{ href: "/about", label: "About IITB INV.ENT" }]}>
      <JsonLd
        data={graphJsonLd(
          websiteJsonLd(),
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "About IITB INV.ENT", path: "/about" },
          ]),
          {
            "@type": "AboutPage",
            name: ABOUT_PAGE.title,
            url: absoluteUrl("/about"),
            description: INVENT_DEFINITION,
            mainEntity: {
              "@type": "DefinedTerm",
              name: "IITB INV.ENT",
              alternateName: [
                "INVENT",
                "iitbinvent",
                "iitb_invent",
                "IIT Bombay INV.ENT",
              ],
              description: INVENT_DEFINITION,
              inDefinedTermSet: "https://iitbinvent.com/",
            },
          },
        )}
      />
      <main
        className="mx-auto max-w-3xl px-4 py-10 sm:px-6"
        data-testid="about-page"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
          {ABOUT_PAGE.kicker}
        </p>
        <h1
          className="mt-2 font-display text-4xl tracking-wide text-teal-deep"
          data-testid="about-heading"
        >
          {ABOUT_PAGE.title}
        </h1>
        {ABOUT_PAGE.lede.map((paragraph, i) => (
          <p
            key={paragraph}
            className={
              i === 0
                ? "mt-6 text-lg leading-8 text-ink"
                : "mt-4 text-lg leading-8 text-ink"
            }
          >
            <LinkedText text={paragraph} />
          </p>
        ))}
        {ABOUT_PAGE.sections.map((section) => (
          <section key={section.heading} className="mt-10">
            <h2 className="font-display text-2xl tracking-wide text-teal-deep">
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-3 text-[17px] leading-7 text-ink-soft"
              >
                <LinkedText text={paragraph} />
              </p>
            ))}
          </section>
        ))}
      </main>
    </PublicChrome>
  );
}
