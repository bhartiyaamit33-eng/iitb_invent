import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { Prose } from "@/components/Prose";
import { PublicChrome } from "@/components/PublicChrome";
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
  const title = cms?.title || "Travel";
  const body = cms?.body?.trim() || TRAVEL_FALLBACK;

  return (
    <PublicChrome crumbs={[{ href: "/travel", label: "Travel" }]}>
      <JsonLd
        data={graphJsonLd(
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Travel", path: "/travel" },
          ]),
        )}
      />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-4xl tracking-wide text-teal-deep">
          {title}
        </h1>
        <p className="mt-4 text-lg leading-8 text-ink">
          IITB INV.ENT venue: {VENUE.formatted}.
        </p>
        <div className="mt-8">
          <Prose text={body} />
        </div>
        <p className="mt-8 text-[17px] leading-7 text-ink-soft">
          Stay options — IIT Bombay guest houses and a nearby hotel — are on the{" "}
          <Link href="/accommodation">accommodation</Link> page.
        </p>
      </main>
    </PublicChrome>
  );
}
