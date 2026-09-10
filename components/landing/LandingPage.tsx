"use client";

import type { LandingProps } from "@/lib/landing";
import { EventLanes } from "./EventLanes";
import { LandingFooter } from "./LandingFooter";
import { LandingHero } from "./LandingHero";
import { LandingSections } from "./LandingSections";
import { LandingTheme } from "./LandingTheme";
import { LiveStrip } from "./LiveStrip";
import { SparkTrail } from "./SparkTrail";

export function LandingPage({
  heroVariant,
  signedInName,
  live,
  faqs,
  stats,
  timeline,
}: LandingProps) {
  return (
    <div className="landing">
      <LandingTheme />
      <SparkTrail />
      {live ? <LiveStrip live={live} /> : null}
      <LandingHero variant={heroVariant} signedInName={signedInName} />
      <EventLanes />
      <LandingSections
        signedInName={signedInName}
        faqs={faqs}
        stats={stats}
        timeline={timeline}
      />
      <LandingFooter />
    </div>
  );
}
