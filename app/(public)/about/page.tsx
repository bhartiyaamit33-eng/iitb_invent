import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { LinkedText } from "@/components/Prose";
import { PublicChrome } from "@/components/PublicChrome";
import { PageHero } from "@/components/site/PageHero";
import { ABOUT_PAGE, INVENT_DEFINITION } from "@/lib/seo-content";
import { ABOUT_TIMELINE, ECOSYSTEM_STATS, registerHrefFor } from "@/lib/site";
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
  description:
    "IITB INV.ENT is an entrepreneurship research and practice conference conducted by the Desai Sethi School of Entrepreneurship, IIT Bombay. 30-31 January 2027.",
  path: "/about",
});

export default function AboutPage() {
  const [quote, ...ledeRest] = ABOUT_PAGE.lede;
  const building = ABOUT_PAGE.sections.find((s) => s.heading === "The building");

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
            name: "About IITB INV.ENT",
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
      <main id="main">
        <PageHero
          kicker={ABOUT_PAGE.kicker}
          title={ABOUT_PAGE.title}
          testId="about-heading"
        />
        <div className="site-shell editorial">
          <blockquote className="pull-quote">“{quote}”</blockquote>
          {ledeRest.map((para) => (
            <p key={para}>{para}</p>
          ))}

          <h2>A short history</h2>
          <ol className="about-timeline">
            {ABOUT_TIMELINE.map((item) => (
              <li key={item.year}>
                <b>{item.year}</b>
                <p>{item.body}</p>
              </li>
            ))}
          </ol>

          <h2>The ecosystem in numbers</h2>
          <div className="stats-grid" style={{ marginTop: 12 }}>
            {ECOSYSTEM_STATS.map((stat) => (
              <div className="stat-block" key={stat.label}>
                <b>{stat.value}</b>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>

          {ABOUT_PAGE.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.heading === "The building" && building ? (
                <figure className="building-photo">
                  <Image
                    src="/assets/dsse-building.jpg"
                    alt="Desai Sethi School of Entrepreneurship building at IIT Bombay"
                    width={1600}
                    height={900}
                    sizes="(max-width: 1180px) 92vw, 1180px"
                  />
                  <figcaption>DSSE Building, IIT Bombay</figcaption>
                </figure>
              ) : null}
              {section.paragraphs.map((para) => (
                <p key={para}>
                  <LinkedText text={para} />
                </p>
              ))}
            </section>
          ))}

          <p>
            See the <Link href="/faq">FAQ</Link>, the{" "}
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
          <div className="cta-row" style={{ justifyContent: "flex-start" }}>
            <Link className="site-btn" href={registerHrefFor(false)}>
              Register →
            </Link>
          </div>
        </div>
      </main>
    </PublicChrome>
  );
}
