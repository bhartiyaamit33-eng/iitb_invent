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
import { EVENT_DATES } from "@/lib/site-content";

export const metadata = pageMetadata({
  title: "Travel to IITB INV.ENT at IIT Bombay",
  description: `IITB INV.ENT is held at the ${VENUE.formatted}. Directions for 30-31 January 2027.`,
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
    </SiteShell>
  );
}
