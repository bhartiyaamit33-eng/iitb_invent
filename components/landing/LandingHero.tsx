"use client";

import Link from "next/link";
import { IntersectionField } from "@/components/diagram/IntersectionField";
import { registerHrefFor } from "@/lib/site";

export function LandingHero({
  signedInName,
}: {
  signedInName: string | null;
}) {
  const registerHref = registerHrefFor(Boolean(signedInName));
  const registerLabel = signedInName ? "Dashboard" : "Register";

  return (
    <section
      className="landing-hero"
      id="top"
      data-testid="hero"
      aria-labelledby="hero-heading"
    >
      <IntersectionField labels />
      <div className="landing-hero-copy">
        <p className="site-kicker">IITB INV.ENT 2027</p>
        <h1 id="hero-heading">
          Where Entrepreneurship
          <br />
          Research Meets
          <br />
          <span className="accent">Venture Practice.</span>
        </h1>
        <p className="hero-meta">30-31 JANUARY 2027 · IIT BOMBAY</p>
        <p className="hero-axes">
          RESEARCH × INNOVATION × ENTREPRENEURSHIP × IMPACT
        </p>
        <div className="cta-row" data-testid="cta-hero">
          <Link className="site-btn" href={registerHref}>
            {registerLabel} →
          </Link>
          <Link className="site-btn site-btn-ghost" href="/programme">
            Explore Programme
          </Link>
        </div>
      </div>
    </section>
  );
}
