"use client";

import type { ReactNode } from "react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingTheme } from "@/components/landing/LandingTheme";
import { OrbitBackdrop } from "@/components/landing/OrbitBackdrop";
import { SparkTrail } from "@/components/landing/SparkTrail";

export function ConferenceSubpage({
  signedInName,
  children,
}: {
  signedInName: string | null;
  children: ReactNode;
}) {
  return (
    <div className="landing">
      <LandingTheme />
      <SparkTrail />
      <div className="relative isolate overflow-hidden bg-midnight pb-6">
        <OrbitBackdrop variant="hero" />
        <LandingHeader
          signedInName={signedInName}
          homeBase="/test123"
          currentPath="/conference"
        />
      </div>
      <div className="landing-shell pt-10">{children}</div>
      <LandingFooter />
    </div>
  );
}
