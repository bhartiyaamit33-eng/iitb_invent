import Link from "next/link";
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
  title: "What is INV.ENT?",
  description:
    "INV.ENT is the Entrepreneurship Research and Venture Practice Conference conducted by the Desai Sethi School of Entrepreneurship at IIT Bombay. 30 and 31 January 2027. 30 January is Day Zero.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <PublicChrome crumbs={[{ href: "/about", label: "About INV.ENT" }]}>
      <JsonLd
        data={graphJsonLd(
          websiteJsonLd(),
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "About INV.ENT", path: "/about" },
          ]),
          {
            "@type": "AboutPage",
            name: "What is INV.ENT?",
            url: absoluteUrl("/about"),
            description: INVENT_DEFINITION,
            mainEntity: {
              "@type": "DefinedTerm",
              name: "INV.ENT",
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
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
          IIT Bombay · DSSE
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-wide text-teal-deep">
          What is INV.ENT?
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
          See the{" "}
          <Link href="/faq">FAQ</Link>, the{" "}
          <Link href="/conference">call for papers</Link>, or the{" "}
          <Link href="/programme">2027 programme</Link>. School site:{" "}
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
