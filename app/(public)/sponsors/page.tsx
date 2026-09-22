import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { LogoWall } from "@/components/site/LogoWall";
import { PageHero } from "@/components/site/PageHero";
import { SiteShell } from "@/components/site/SiteShell";
import {
  breadcrumbJsonLd,
  graphJsonLd,
  organizationJsonLd,
  pageMetadata,
} from "@/lib/seo";
import {
  EVENT_DATES,
  HOSTS,
  PARTNERS,
  PARTNER_JOURNALS,
  PARTNER_JOURNALS_NOTE,
  PARTNER_JOURNALS_PROMISE,
  SPONSORS,
  SPONSOR_PITCH,
  SUPPORT_EMAIL,
} from "@/lib/site-content";

export const metadata = pageMetadata({
  title: "Sponsors & partners",
  description:
    "Sponsors and partners of IITB INV.ENT 2027 at IIT Bombay, hosted by the Desai Sethi School of Entrepreneurship. Academic partner: ServiceSetu Academics.",
  path: "/sponsors",
});

const WHAT_SPONSORS_GET = [
  {
    n: "1",
    title: "Your name on the work",
    body: "Sponsor a research award, a poster prize, a workshop track or the hallway where founders meet the people studying them. Your logo sits on the landing page, this page, and the artwork for what you support.",
  },
  {
    n: "2",
    title: "The room, not a booth",
    body: "Delegates are researchers, founders, investors, incubator teams and students across two days. Partners get presence in the sessions rather than a table by the door.",
  },
  {
    n: "3",
    title: "A route to the pipeline",
    body: "DSSE runs the stack from student clubs through SINE to companies. Partners see work at the point where it is still deciding what to become.",
  },
];

export default function SponsorsPage() {
  return (
    <SiteShell crumbs={[{ href: "/sponsors", label: "Sponsors & partners" }]}>
      <JsonLd
        data={graphJsonLd(
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Sponsors & partners", path: "/sponsors" },
          ]),
        )}
      />

      <PageHero
        kicker="Sponsors &amp; partners"
        title="The names behind the two days."
        lede={SPONSOR_PITCH}
        meta={[`Conference · ${EVENT_DATES}`, "Venue · IIT Bombay"]}
      >
        <div className="cta-row" style={{ justifyContent: "flex-start" }}>
          <a
            className="site-btn"
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Sponsorship · IITB INV.ENT 2027")}`}
            data-testid="sponsor-mail-cta"
          >
            Request the prospectus →
          </a>
        </div>
      </PageHero>

      <section className="site-section is-tight" aria-labelledby="sponsors-heading">
        <div className="site-shell">
          <p className="site-kicker is-green">Sponsors</p>
          <h2 id="sponsors-heading">Sponsors</h2>
          <LogoWall orgs={SPONSORS} testId="sponsors-page-sponsors" />
        </div>
      </section>

      <section className="site-section is-rule" aria-labelledby="partners-heading">
        <div className="site-shell">
          <p className="site-kicker is-blue">Partners</p>
          <h2 id="partners-heading">Partners</h2>
          <LogoWall orgs={PARTNERS} testId="sponsors-page-partners" />
          <p className="logo-wall-note">
            More sponsors and partners are added as agreements are signed.
          </p>
        </div>
      </section>

      <section className="site-section is-rule" aria-labelledby="journals-heading">
        <div className="site-shell">
          <p className="site-kicker is-green">Partner journals</p>
          <h2 id="journals-heading">Publication partners</h2>
          <p className="lead">{PARTNER_JOURNALS_PROMISE}</p>
          {PARTNER_JOURNALS.length > 0 ? (
            <ul className="journal-list" data-testid="sponsors-page-journals">
              {PARTNER_JOURNALS.map((journal) => (
                <li key={journal.id}>
                  <b>{journal.name}</b>
                  <span>{journal.note}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p
              className="coming-card"
              style={{ borderTop: "1px solid var(--rule)", marginTop: 28 }}
            >
              Partner journal titles — announced with the acceptance list
            </p>
          )}
          <div className="site-callout">{PARTNER_JOURNALS_NOTE}</div>
          <div className="cta-row" style={{ justifyContent: "flex-start" }}>
            <Link className="site-btn site-btn-ghost" href="/research#journals">
              How forwarding works →
            </Link>
          </div>
        </div>
      </section>

      <section className="site-section is-rule" aria-labelledby="hosts-heading">
        <div className="site-shell">
          <p className="site-kicker">Hosts</p>
          <h2 id="hosts-heading">Organised by</h2>
          <LogoWall orgs={HOSTS} testId="sponsors-page-hosts" />
        </div>
      </section>

      <section className="site-section is-rule" aria-labelledby="why-heading">
        <div className="site-shell">
          <p className="site-kicker is-blue">Why partner</p>
          <h2 id="why-heading">What sponsorship buys</h2>
          <ol className="site-steps">
            {WHAT_SPONSORS_GET.map((item) => (
              <li key={item.n}>
                <span className="n" aria-hidden="true">
                  {item.n}
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="site-section is-blue" aria-labelledby="join-heading">
        <div className="site-shell" style={{ position: "relative" }}>
          <h2 id="join-heading">
            Put your name
            <br />
            on this page.
          </h2>
          <p className="lead">
            Tell us what you want to support and we will send the current prospectus with
            tiers, deliverables and deadlines.
          </p>
          <div className="cta-row">
            <a
              className="site-btn site-btn-white"
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Sponsorship · IITB INV.ENT 2027")}`}
            >
              {SUPPORT_EMAIL} →
            </a>
            <Link className="site-btn site-btn-white" href="/contact">
              Contact
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
