import { JsonLd } from "@/components/JsonLd";
import { SiteLanding } from "@/components/site/SiteLanding";
import { SiteShell } from "@/components/site/SiteShell";
import { SiteLiveStrip } from "@/components/site/SiteLiveStrip";
import { loadLandingData } from "@/lib/load-landing";
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME_LONG,
  eventJsonLd,
  faqPageJsonLd,
  graphJsonLd,
  organizationJsonLd,
  pageMetadata,
  websiteJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = {
  ...pageMetadata({
    title: SITE_NAME_LONG,
    description: DEFAULT_DESCRIPTION,
    path: "/",
    absoluteTitle: true,
  }),
};

export default async function HomePage() {
  const data = await loadLandingData();

  return (
    <SiteShell splash>
      <JsonLd
        data={graphJsonLd(
          websiteJsonLd(),
          organizationJsonLd(),
          eventJsonLd(),
          faqPageJsonLd(),
        )}
      />
      {data.live ? <SiteLiveStrip live={data.live} /> : null}
      <SiteLanding
        signedInName={data.signedInName}
        faqs={data.faqs}
        stats={data.stats}
        timeline={data.timeline}
      />
    </SiteShell>
  );
}
