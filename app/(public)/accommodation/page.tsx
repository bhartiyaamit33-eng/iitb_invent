import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { SiteShell } from "@/components/site/SiteShell";
import {
  breadcrumbJsonLd,
  graphJsonLd,
  organizationJsonLd,
  pageMetadata,
  VENUE,
} from "@/lib/seo";
import {
  ACCOMMODATION_INTRO,
  ACCOMMODATION_OPTIONS,
  ACCOMMODATION_STEPS,
  CONFERENCE_EMAIL,
  EVENT_DATES,
} from "@/lib/site-content";

export const metadata = pageMetadata({
  title: "Accommodation",
  description:
    "Where to stay for IITB INV.ENT 2027: shared rooms at the IIT Bombay guest house, campus options, and partner rates at Anantha Hotels in Bhandup West. 30-31 January 2027.",
  path: "/accommodation",
});

export default function AccommodationPage() {
  return (
    <SiteShell crumbs={[{ href: "/accommodation", label: "Accommodation" }]}>
      <JsonLd
        data={graphJsonLd(
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Accommodation", path: "/accommodation" },
          ]),
        )}
      />

      <PageHero
        kicker="Where to stay"
        title="Accommodation."
        lede={ACCOMMODATION_INTRO}
        meta={[`Conference · ${EVENT_DATES}`, `Venue · ${VENUE.formatted}`]}
      />

      <section className="site-section is-tight" aria-labelledby="options-heading">
        <div className="site-shell">
          <p className="site-kicker is-blue">Options</p>
          <h2 id="options-heading">Three ways to stay</h2>
          <p className="lead">
            Off campus, Anantha Hotels in Bhandup West is the partner hotel. Address,
            contact and room rates are on the{" "}
            <Link href="/travel#anantha" style={{ color: "var(--blue)" }}>
              travel page
            </Link>
            .
          </p>
          <table className="site-table" data-testid="accommodation-options">
            <thead>
              <tr>
                <th scope="col">Where</th>
                <th scope="col">Distance</th>
                <th scope="col">How it works</th>
              </tr>
            </thead>
            <tbody>
              {ACCOMMODATION_OPTIONS.map((option) => (
                <tr key={option.id}>
                  <td style={{ color: "var(--navy)" }}>{option.name}</td>
                  <td>{option.detail}</td>
                  <td style={{ fontFamily: "inherit", fontSize: 15 }}>{option.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="site-section is-rule" aria-labelledby="request-heading">
        <div className="site-shell">
          <p className="site-kicker is-green">How to request</p>
          <h2 id="request-heading">Getting a guest house room</h2>
          <ol className="site-steps" data-testid="accommodation-steps">
            {ACCOMMODATION_STEPS.map((step) => (
              <li key={step.n}>
                <span className="n" aria-hidden="true">
                  {step.n}
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="site-callout">
            Accommodation is not included in the registration fee, and a room is not held
            until you have written confirmation. If the guest house list fills before your
            request arrives, we will say so rather than leave you guessing.
          </div>
        </div>
      </section>

      <section className="site-section is-rule" aria-labelledby="campus-heading">
        <div className="site-shell">
          <p className="site-kicker">On the day</p>
          <h2 id="campus-heading">Getting to the venue</h2>
          <p className="lead">
            Sessions run at the Desai Sethi School of Entrepreneurship, DSSE Building, IIT
            Bombay, Powai, Mumbai 400076. Nearest entrance: IIT Bombay Main Gate. Bring
            photo ID — campus access is checked at the gate.
          </p>
          <div className="cta-row" style={{ justifyContent: "flex-start" }}>
            <Link className="site-btn site-btn-ghost" href="/travel">
              Travel and directions →
            </Link>
            <Link className="site-btn site-btn-ghost" href="/programme">
              Programme
            </Link>
          </div>
        </div>
      </section>

      <section className="site-section is-blue" aria-labelledby="ask-heading">
        <div className="site-shell" style={{ position: "relative" }}>
          <h2 id="ask-heading">Ask about a room.</h2>
          <p className="lead">
            Write with your name, the nights you need, and whether a shared room works.
            Requests are filled in the order they arrive.
          </p>
          <div className="cta-row">
            <a
              className="site-btn site-btn-white"
              href={`mailto:${CONFERENCE_EMAIL}?subject=${encodeURIComponent("Accommodation request · IITB INV.ENT 2027")}`}
              data-testid="accommodation-mail-cta"
            >
              {CONFERENCE_EMAIL} →
            </a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
