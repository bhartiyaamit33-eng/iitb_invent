import { JsonLd } from "@/components/JsonLd";
import { LandingPage } from "@/components/landing/LandingPage";
import { loadLandingData } from "@/lib/load-landing";
import {
  eventJsonLd,
  faqPageJsonLd,
  graphJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

export async function LandingScreen() {
  const data = await loadLandingData();
  return (
    <>
      <JsonLd
        data={graphJsonLd(
          websiteJsonLd(),
          organizationJsonLd(),
          eventJsonLd(),
          faqPageJsonLd(),
        )}
      />
      <LandingPage
        signedInName={data.signedInName}
        live={data.live}
        sponsors={data.sponsors}
        partners={data.partners}
      />
    </>
  );
}
