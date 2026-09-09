import { JsonLd } from "@/components/JsonLd";
import { PublicChrome } from "@/components/PublicChrome";
import {
  ABOUT_SECTIONS,
  INVENT_DEFINITION,
} from "@/lib/seo-content";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  graphJsonLd,
  organizationJsonLd,
  pageMetadata,
  websiteJsonLd,
} from "@/lib/seo";

export const metadata = pageMetadata({
  title: "What is INVENT (iitbinvent, iitb_invent)?",
  description:
    "INVENT (INV.ENT, iitbinvent, iitb_invent) is Innovation and Entrepreneurship at DSSE, IIT Bombay — the public DSSE Day gathering on 31 January.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <PublicChrome crumbs={[{ href: "/about", label: "About INVENT" }]}>
      <JsonLd
        data={graphJsonLd(
          websiteJsonLd(),
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "About INVENT", path: "/about" },
          ]),
          {
            "@type": "AboutPage",
            name: "What is INVENT?",
            url: absoluteUrl("/about"),
            description: INVENT_DEFINITION,
            mainEntity: {
              "@type": "DefinedTerm",
              name: "INVENT",
              alternateName: [
                "INV.ENT",
                "iitbinvent",
                "iitb_invent",
                "IIT Bombay INVENT",
              ],
              description: INVENT_DEFINITION,
              inDefinedTermSet: "https://iitbinvent.com/",
            },
          },
        )}
      />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
          IIT Bombay · DSSE
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-wide text-teal-deep">
          What is INVENT?
        </h1>
        <p className="mt-6 text-lg leading-8 text-ink">{INVENT_DEFINITION}</p>
        {ABOUT_SECTIONS.map((section) => (
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
          Read{" "}
          <a href="/dsse-day">what DSSE Day is</a>, the{" "}
          <a href="/faq">FAQ</a>, or the{" "}
          <a href="/programme">2027 programme</a>. School site:{" "}
          <a
            href="https://www.dsse.iitb.ac.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            dsse.iitb.ac.in
          </a>
          .
        </p>
      </main>
    </PublicChrome>
  );
}
