import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { SitePhoto } from "@/components/site/SitePhoto";
import { SiteShell } from "@/components/site/SiteShell";
import { getSiteChrome } from "@/lib/site-chrome";
import { submitHrefFor } from "@/lib/landing";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  graphJsonLd,
  organizationJsonLd,
  pageMetadata,
  VENUE,
} from "@/lib/seo";
import {
  CONTACT_ROUTES,
  EVENT_DATES,
  SUPPORT_EMAIL,
  VENUE_LINES,
} from "@/lib/site-content";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Reach the IITB INV.ENT team at DSSE, IIT Bombay: submissions, sponsorship, press, speaking, accommodation and account questions.",
  path: "/contact",
});

export default async function ContactPage() {
  const { signedInName } = await getSiteChrome();
  const submitHref = submitHrefFor(Boolean(signedInName));

  return (
    <SiteShell crumbs={[{ href: "/contact", label: "Contact" }]}>
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
          },
        )}
      />

      <PageHero
        kicker="Contact"
        title="Talk to us."
        lede="Two inboxes, both read by humans. Submissions and accommodation go to the conference desk; everything else goes to support."
        meta={[`Conference · ${EVENT_DATES}`, "Venue · IIT Bombay"]}
      />

      <section className="site-section is-tight" aria-labelledby="team-heading">
        <div className="site-shell">
          <p className="site-kicker">The people</p>
          <h2 id="team-heading">The DSSE team</h2>
          <p className="lead">
            IITB INV.ENT is organised by the Desai Sethi School of Entrepreneurship at IIT
            Bombay. Both inboxes below are read by this team.
          </p>
          <SitePhoto
            src="/assets/landing/symposium-group.jpg"
            alt="The DSSE team on stage at the Entrepreneurship Research Symposium, IIT Bombay"
            caption="DSSE team · IIT Bombay"
            width={1600}
            height={1067}
            testId="contact-dsse-team"
          />
        </div>
      </section>

      <section className="site-section is-rule" aria-labelledby="routes-heading">
        <div className="site-shell">
          <p className="site-kicker is-blue">Who to write to</p>
          <h2 id="routes-heading">Two inboxes</h2>
          <div className="days-grid" data-testid="contact-routes">
            {CONTACT_ROUTES.map((route) => (
              <article className="day-col" key={route.id}>
                <p className="site-kicker is-blue">{route.label}</p>
                <p style={{ margin: "0 0 14px" }}>
                  <a
                    className="contact-mail"
                    href={`mailto:${route.email}`}
                    data-testid={`contact-${route.id}`}
                  >
                    {route.email}
                  </a>
                </p>
                <p className="lead">{route.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="site-section is-rule" aria-labelledby="visit-heading">
        <div className="site-shell">
          <div className="quote-split">
            <div>
              <p className="site-kicker">Where we are</p>
              <h2 id="visit-heading">
                Desai Sethi School
                <br />
                of Entrepreneurship
              </h2>
              <address style={{ fontStyle: "normal" }}>
                {VENUE_LINES.map((line) => (
                  <p className="lead" style={{ margin: "0 0 4px" }} key={line}>
                    {line}
                  </p>
                ))}
              </address>
              <p className="lead" style={{ marginTop: 20 }}>
                Nearest entrance: IIT Bombay Main Gate. Bring photo ID — campus access is
                checked at the gate.
              </p>
              <div className="cta-row" style={{ justifyContent: "flex-start" }}>
                <a
                  className="site-btn site-btn-ghost"
                  href={`https://www.google.com/maps/search/?api=1&query=${VENUE.lat},${VENUE.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in maps →
                </a>
                <Link className="site-btn site-btn-ghost" href="/travel">
                  Travel
                </Link>
              </div>
            </div>
            <div className="divider" aria-hidden="true" />
            <div>
              <p className="site-kicker">Before you write</p>
              <p className="lead">
                A lot of questions already have a page. It is usually faster to check
                these than to wait on a reply.
              </p>
              <ul className="theme-list" style={{ gridTemplateColumns: "1fr" }}>
                <li>
                  <Link href="/research" style={{ color: "var(--blue)" }}>
                    Call for papers, deadlines, fees and the review process
                  </Link>
                </li>
                <li>
                  <Link href="/accommodation" style={{ color: "var(--blue)" }}>
                    Accommodation and guest house rooms
                  </Link>
                </li>
                <li>
                  <Link href="/programme" style={{ color: "var(--blue)" }}>
                    Programme and session RSVP
                  </Link>
                </li>
                <li>
                  <Link href="/faq" style={{ color: "var(--blue)" }}>
                    Frequently asked questions
                  </Link>
                </li>
                <li>
                  <Link href="/sponsors" style={{ color: "var(--blue)" }}>
                    Sponsorship and partnerships
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="site-section is-blue" aria-labelledby="take-part-heading">
        <div className="site-shell" style={{ position: "relative" }}>
          <h2 id="take-part-heading">Or just take part.</h2>
          <p className="lead">
            Papers, posters, workshops and attendee registration all go through one desk.
          </p>
          <div className="cta-row">
            <Link className="site-btn site-btn-white" href={submitHref}>
              Register or submit →
            </Link>
            <a className="site-btn site-btn-white" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
