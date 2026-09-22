import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { SiteProse } from "@/components/site/SiteProse";
import { SiteShell } from "@/components/site/SiteShell";
import { getPublishedPage } from "@/lib/pages";
import { TRAVEL_FALLBACK } from "@/lib/seo-content";
import {
  breadcrumbJsonLd,
  graphJsonLd,
  organizationJsonLd,
  pageMetadata,
  VENUE,
} from "@/lib/seo";
import { ANANTHA_HOTEL, EVENT_DATES } from "@/lib/site-content";

export const metadata = pageMetadata({
  title: "Travel to IITB INV.ENT at IIT Bombay",
  description: `Directions to IITB INV.ENT at the ${VENUE.formatted}, and partner rates at Anantha Hotels in Bhandup West for off-campus stays. 30-31 January 2027.`,
  path: "/travel",
});

export default async function TravelPage() {
  const cms = await getPublishedPage("travel");
  const title = cms?.title || "Travel";
  const body = cms?.body?.trim() || TRAVEL_FALLBACK;

  return (
    <SiteShell crumbs={[{ href: "/travel", label: "Travel" }]}>
      <JsonLd
        data={graphJsonLd(
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Travel", path: "/travel" },
          ]),
        )}
      />

      <PageHero
        kicker="Getting to campus"
        title={title}
        lede={`IITB INV.ENT venue: ${VENUE.formatted}.`}
        meta={[`Conference · ${EVENT_DATES}`, "Nearest entrance · IIT Bombay Main Gate"]}
      >
        <div className="cta-row" style={{ justifyContent: "flex-start" }}>
          <a
            className="site-btn site-btn-ghost"
            href={`https://www.google.com/maps/search/?api=1&query=${VENUE.lat},${VENUE.lng}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in maps →
          </a>
          <Link className="site-btn site-btn-ghost" href="/accommodation">
            Accommodation
          </Link>
        </div>
      </PageHero>

      <section className="site-section is-tight">
        <div className="site-shell">
          <SiteProse text={body} />
        </div>
      </section>

      <section
        className="site-section is-rule"
        id="anantha"
        aria-labelledby="anantha-heading"
        data-testid="travel-anantha"
      >
        <div className="site-shell">
          <p className="site-kicker is-blue">Off-campus accommodation</p>
          <h2 id="anantha-heading">{ANANTHA_HOTEL.name}</h2>
          <p className="lead">
            Partner hotel for delegates staying off campus. Book directly with the hotel
            and ask for the IITB INV.ENT rate. {ANANTHA_HOTEL.property}.
          </p>

          <div className="days-grid">
            <article className="day-col" data-testid="anantha-address">
              <p className="site-kicker">Location</p>
              <h3>{ANANTHA_HOTEL.property}</h3>
              <address style={{ fontStyle: "normal" }}>
                {ANANTHA_HOTEL.address.map((line) => (
                  <p className="lead" style={{ margin: "0 0 4px" }} key={line}>
                    {line}
                  </p>
                ))}
              </address>
              <div className="cta-row" style={{ justifyContent: "flex-start" }}>
                <a
                  className="site-btn site-btn-ghost"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ANANTHA_HOTEL.mapsQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in maps →
                </a>
                <a
                  className="site-btn site-btn-ghost"
                  href={ANANTHA_HOTEL.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {ANANTHA_HOTEL.websiteLabel} →
                </a>
              </div>
            </article>
            <article className="day-col" data-testid="anantha-poc">
              <p className="site-kicker">Point of contact</p>
              <h3>{ANANTHA_HOTEL.contactName}</h3>
              <p className="lead" style={{ marginBottom: 8 }}>
                {ANANTHA_HOTEL.phones.map((phone, i) => (
                  <span key={phone.tel}>
                    {i > 0 ? " · " : null}
                    <a href={`tel:${phone.tel}`}>{phone.display}</a>
                  </span>
                ))}
              </p>
              <p className="lead" style={{ margin: 0 }}>
                <a href={`mailto:${ANANTHA_HOTEL.email}`}>{ANANTHA_HOTEL.email}</a>
              </p>
            </article>
          </div>

          <table className="site-table" data-testid="anantha-rates">
            <caption className="lead" style={{ captionSide: "bottom", textAlign: "left", paddingTop: 16 }}>
              Partner room rates, per night. Published tariffs are ₹5,000, ₹6,000 and ₹7,000.
              5% GST extra. Breakfast and Wi-Fi included.
            </caption>
            <thead>
              <tr>
                <th scope="col">Room</th>
                <th scope="col">Single</th>
                <th scope="col">Double</th>
              </tr>
            </thead>
            <tbody>
              {ANANTHA_HOTEL.rates.map((rate) => (
                <tr key={rate.id}>
                  <td style={{ color: "var(--navy)" }}>
                    {rate.room}
                    <span style={{ display: "block", color: "var(--mute)", fontSize: 13 }}>
                      Tariff {rate.tariff}
                    </span>
                  </td>
                  <td style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", color: "var(--navy)" }}>
                    {rate.single}
                  </td>
                  <td>{rate.double}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </SiteShell>
  );
}
