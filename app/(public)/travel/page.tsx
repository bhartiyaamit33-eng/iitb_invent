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
  title: "Travel to INVENT / DSSE Day at IIT Bombay",
  description: `INVENT and DSSE Day are held at the ${VENUE.formatted}. Directions for 31 January 2027.`,
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
          INVENT / DSSE Day venue: {VENUE.formatted}.
        </p>
        <div className="mt-8">
          <Prose text={body} />
        </div>
      </main>
    </PublicChrome>
  );
}
