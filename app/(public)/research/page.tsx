import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { PublicChrome } from "@/components/PublicChrome";
import { PageHero } from "@/components/site/PageHero";
import {
  CFP_APPLICANTS,
  CFP_RESEARCH_AREAS,
  CFP_TIMELINE,
  CFP_TRACKS,
} from "@/lib/conference-cfp";
import { SUBMIT_HREF } from "@/lib/landing";
import { RESEARCH_AWARDS, RESEARCH_THEMES } from "@/lib/site";
import {
  breadcrumbJsonLd,
  graphJsonLd,
  organizationJsonLd,
  pageMetadata,
} from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Research",
  description:
    "Call for papers, research themes, tracks, and awards for IITB INV.ENT 2027 at IIT Bombay. Abstract deadline 15 October 2026.",
  path: "/research",
});

const THEMES = Array.from(new Set([...RESEARCH_THEMES, ...CFP_RESEARCH_AREAS]));

export default function ResearchPage() {
  return (
    <PublicChrome crumbs={[{ href: "/research", label: "Research" }]}>
      <JsonLd
        data={graphJsonLd(
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Research", path: "/research" },
          ]),
        )}
      />
      <main id="main">
        <PageHero
          kicker="Call for papers"
          title="Research at IITB INV.ENT"
          lede="Emerging scholars are invited to submit work for presentation. The form lives on the conference page — this page is the brief."
        />
        <div className="site-shell editorial">
          <p>
            IITB INV.ENT is an entrepreneurship research and practice conference.
            Papers and posters sit in the same room as founders, investors, and
            incubators — not in a parallel track down the corridor.
          </p>

          <h2>Tracks</h2>
          <ul className="theme-list">
            {CFP_TRACKS.map((track) => (
              <li key={track.id}>{track.label}</li>
            ))}
          </ul>

          <h2>Who can apply</h2>
          <ul className="theme-list">
            {CFP_APPLICANTS.map((person) => (
              <li key={person.id}>{person.label}</li>
            ))}
          </ul>

          <h2>Themes</h2>
          <ul className="theme-list">
            {THEMES.map((theme) => (
              <li key={theme}>{theme}</li>
            ))}
          </ul>

          <h2>Key dates</h2>
          <ol className="about-timeline">
            {CFP_TIMELINE.map((item) => (
              <li key={item.id}>
                <b>{item.date}</b>
                <p>{item.kicker}</p>
              </li>
            ))}
          </ol>

          <h2>Awards</h2>
          <ul className="awards-list">
            {RESEARCH_AWARDS.map((award) => (
              <li key={award.title}>
                <h3>{award.title}</h3>
                <p>{award.body}</p>
              </li>
            ))}
          </ul>

          <div className="cta-row" style={{ justifyContent: "flex-start" }}>
            <Link className="site-btn" href={SUBMIT_HREF}>
              Submit an abstract →
            </Link>
            <Link className="site-btn site-btn-ghost" href="/conference">
              Call for papers
            </Link>
          </div>
        </div>
      </main>
    </PublicChrome>
  );
}
