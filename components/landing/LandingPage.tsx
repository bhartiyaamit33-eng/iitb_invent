import { publicFontClass } from "@/app/landing-preview-fonts";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteTheme } from "@/components/site/SiteTheme";
import type { LiveStripData } from "@/lib/landing";
import type { PublicOrg } from "@/lib/orgs-public";
import { EventLanes } from "./EventLanes";
import { LandingHero } from "./LandingHero";
import { LandingSections } from "./LandingSections";
import { LiveStrip } from "./LiveStrip";

export function LandingPage({
  signedInName,
  live,
  sponsors,
  partners,
}: {
  signedInName: string | null;
  live: LiveStripData | null;
  sponsors: PublicOrg[];
  partners: PublicOrg[];
}) {
  return (
    <div className={`site ${publicFontClass}`} data-testid="landing-theme-light">
      <SiteTheme />
      <a href="#main" className="site-skip">
        Skip to content
      </a>
      {live ? <LiveStrip live={live} /> : null}
      <SiteHeader signedInName={signedInName} />
      <main id="main">
        <LandingHero signedInName={signedInName} />
        <EventLanes />
        <LandingSections
          signedInName={signedInName}
          sponsors={sponsors}
          partners={partners}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
