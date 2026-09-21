import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { SiteShell } from "@/components/site/SiteShell";
import { NavyGeometry } from "@/components/site/decor";
import { ABOUT_SECTIONS, INVENT_DEFINITION } from "@/lib/seo-content";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  graphJsonLd,
  organizationJsonLd,
  pageMetadata,
  websiteJsonLd,
} from "@/lib/seo";
import {
  ABOUT_QUOTE,
  EVENT_DATES,
  PIPELINE,
  VENTURES,
} from "@/lib/site-content";

export const metadata = pageMetadata({
  title: "What is IITB INV.ENT?",
  description:
    "IITB INV.ENT is an entrepreneurship research and practice conference conducted by the Desai Sethi School of Entrepreneurship, IIT Bombay. 30-31 January 2027.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <SiteShell crumbs={[{ href: "/about", label: "About IITB INV.ENT" }]}>
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
            name: "What is IITB INV.ENT?",
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

      <PageHero
        kicker="IIT Bombay · DSSE"
        title="What is IITB INV.ENT?"
        lede={INVENT_DEFINITION}
        meta={[`Conference · ${EVENT_DATES}`, "Venue · IIT Bombay"]}
      />

      <section className="site-section is-tight">
        <div className="site-shell">
          <blockquote className="pull-quote">“{ABOUT_QUOTE}”</blockquote>
          <div className="editorial" style={{ padding: 0 }}>
            {ABOUT_SECTIONS.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                <p>{section.body}</p>
              </section>
            ))}
          </div>
          <figure className="building-photo">
            <Image
              src="/assets/dsse-building.jpg"
              alt="Desai Sethi School of Entrepreneurship building at IIT Bombay"
              width={1600}
              height={1067}
              sizes="(max-width: 1180px) 100vw, 1140px"
            />
            <figcaption>DSSE Building · IIT Bombay</figcaption>
          </figure>
        </div>
      </section>

      <section className="site-section is-navy" aria-labelledby="stack-heading">
        <NavyGeometry />
        <div className="site-shell" style={{ position: "relative" }}>
          <p className="site-kicker is-green">The stack</p>
          <h2 id="stack-heading">
            From campus
            <br />
            to company
          </h2>
          <p className="lead">
            IITB INV.ENT sits inside a pipeline that already runs: student clubs, research
            labs, the school, the incubator, and the companies that come out of it.
          </p>
          <ol
            className="pipeline"
            aria-label="From campus to company"
            style={{ color: "var(--paper)" }}
          >
            {PIPELINE.map((step, i) => (
              <li key={step}>
                <span>{step}</span>
                {i < PIPELINE.length - 1 ? (
                  <span
                    className="pipeline-arrow"
                    aria-hidden="true"
                    style={{ color: "var(--green)" }}
                  >
                    →
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
          <p className="site-kicker is-green" style={{ marginTop: 48 }}>
            Some of our ventures
          </p>
          <ul className="venture-list" style={{ color: "var(--paper)" }}>
            {VENTURES.map((venture) => (
              <li key={venture}>{venture}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="site-section is-rule" aria-labelledby="next-heading">
        <div className="site-shell">
          <p className="site-kicker">Where to next</p>
          <h2 id="next-heading">Read on</h2>
          <ul className="theme-list">
            <li>
              <Link href="/research" style={{ color: "var(--blue)" }}>
                Call for papers
              </Link>
            </li>
            <li>
              <Link href="/programme" style={{ color: "var(--blue)" }}>
                2027 programme
              </Link>
            </li>
            <li>
              <Link href="/faq" style={{ color: "var(--blue)" }}>
                FAQ
              </Link>
            </li>
            <li>
              <a
                href="https://www.dsse.iitb.ac.in/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--blue)" }}
              >
                dsse.iitb.ac.in
              </a>
            </li>
            <li>
              <Link href="/speakers" style={{ color: "var(--blue)" }}>
                Speakers
              </Link>
            </li>
            <li>
              <Link href="/contact" style={{ color: "var(--blue)" }}>
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </SiteShell>
  );
}
