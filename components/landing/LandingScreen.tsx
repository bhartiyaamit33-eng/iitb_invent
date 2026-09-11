import { landingPreviewFontClass } from "@/app/landing-preview-fonts";
import { JsonLd } from "@/components/JsonLd";
import { LandingPage } from "@/components/landing/LandingPage";
import { loadLandingData } from "@/lib/load-landing";
import type { HeroVariant, LandingThemeName } from "@/lib/landing";
import {
  eventJsonLd,
  faqPageJsonLd,
  graphJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

export async function LandingScreen({
  heroVariant,
  theme,
}: {
  heroVariant: HeroVariant;
  theme?: LandingThemeName;
}) {
  const data = await loadLandingData();
  return (
    <div className={landingPreviewFontClass}>
      <JsonLd
        data={graphJsonLd(
          websiteJsonLd(),
          organizationJsonLd(),
          eventJsonLd(),
          faqPageJsonLd(),
        )}
      />
      <LandingPage
        heroVariant={heroVariant}
        theme={theme}
        signedInName={data.signedInName}
        live={data.live}
        faqs={data.faqs}
        stats={data.stats}
        timeline={data.timeline}
      />
    </div>
  );
}
