import { JsonLd } from "@/components/JsonLd";
import { Prose } from "@/components/Prose";
import { PublicChrome } from "@/components/PublicChrome";
import { PageHero } from "@/components/site/PageHero";
import { getPublishedPage } from "@/lib/pages";
import { TRAVEL_FALLBACK } from "@/lib/seo-content";
import {
  breadcrumbJsonLd,
  graphJsonLd,
  organizationJsonLd,
  pageMetadata,
  VENUE,
} from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Travel to IITB INV.ENT at IIT Bombay",
  description: `IITB INV.ENT is held at the ${VENUE.formatted}. Directions for 30-31 January 2027.`,
  path: "/travel",
});

export default async function TravelPage() {
  const cms = await getPublishedPage("travel");
  const title = cms?.title || "Venue";
  const body = cms?.body?.trim() || TRAVEL_FALLBACK;

  return (
    <PublicChrome crumbs={[{ href: "/travel", label: "Venue" }]}>
      <JsonLd
        data={graphJsonLd(
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Venue", path: "/travel" },
          ]),
        )}
      />
      <main id="main">
        <PageHero kicker="IIT Bombay · Powai" title={title} lede={VENUE.formatted} />
        <div className="site-shell editorial">
          <Prose text={body} />
        </div>
      </main>
    </PublicChrome>
  );
}
