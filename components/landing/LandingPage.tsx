"use client";

import type { LandingProps } from "@/lib/landing";
import { EventLanes } from "./EventLanes";
import { LandingHero } from "./LandingHero";
import { LandingSections } from "./LandingSections";
import { LandingTheme } from "./LandingTheme";
import { LiveStrip } from "./LiveStrip";
import { SparkTrail } from "./SparkTrail";
import { BrandInline } from "./Wordmark";
import Link from "next/link";

export function LandingPage({
  heroVariant,
  signedInName,
  live,
  faqs,
  stats,
  timeline,
  theme = "dark",
}: LandingProps) {

  return (
    <div className="landing" data-theme={theme} data-testid={`landing-theme-${theme}`}>
      <LandingTheme variant={theme} />
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
      <footer className="mx-auto flex max-w-[1220px] flex-col gap-4 border-t border-white/10 px-[clamp(18px,4vw,40px)] pt-7 pb-16 text-xs text-haze">
        <div className="flex flex-wrap justify-between gap-4 max-[860px]:flex-col">
          <div>
            <BrandInline /> · DSSE Day · 31 January 2027 · IIT Bombay
          </div>
          <div>Desai Sethi School of Entrepreneurship</div>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Site">
          <Link href="/about">About INVENT</Link>
          <Link href="/dsse-day">DSSE Day</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/programme">Programme</Link>
          <Link href="/travel">Travel</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/code-of-conduct">Code of conduct</Link>
          <Link href="/llms.txt">llms.txt</Link>
        </nav>
      </footer>
    </div>
  );
}
