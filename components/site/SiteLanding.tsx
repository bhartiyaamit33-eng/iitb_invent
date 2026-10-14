import Image from "next/image";
import Link from "next/link";
import { LogoReel, LogoWall } from "./LogoWall";
import { PhotoLanes } from "./PhotoLanes";
import { InventMark } from "./InventMark";
import { CtaOrbits, IntersectField, LineIcon, NavyGeometry } from "./decor";
import { submitHrefFor, type LandingStat } from "@/lib/landing";
import {
  AUDIENCE,
  EVENT_DATES_SHORT,
  HERO_HEADLINE_ACCENT,
  HERO_HEADLINE_LEAD,
  HOME_AUDIENCES,
  HOME_BRIDGE,
  HOME_QUOTE,
  PARTNERS,
  TRAVEL_GRANT,
} from "@/lib/site-content";

export function SiteLanding({
  signedInName,
  stats,
}: {
  signedInName: string | null;
  stats: LandingStat[];
}) {
  const submitHref = submitHrefFor(Boolean(signedInName));
  const registerHref = signedInName ? "/dashboard" : submitHref;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="landing-hero" id="top" aria-labelledby="hero-heading" data-testid="hero">
        <IntersectField />
        <p className="hero-pole is-right">
          <b>
            Entrepreneurship
            <br />
            Research
          </b>
        </p>
        <div className="landing-hero-copy">
          <div className="hero-presents">
            <Image
              className="hero-presents-dsse"
              src="/assets/dsse-wordmark.png"
              alt="Desai Sethi School of Entrepreneurship"
              width={1600}
              height={320}
              sizes="400px"
              priority
            />
            <span>presents</span>
          </div>
          <p className="hero-lockup">
            <span className="hero-institute">IIT Bombay</span>
            <InventMark className="hero-lockup-mark" />
          </p>
          <h1 id="hero-heading">
            {HERO_HEADLINE_LEAD}
            <span className="accent">{HERO_HEADLINE_ACCENT}</span>
          </h1>
          <p className="hero-meta">{EVENT_DATES_SHORT.replace("JAN", "JANUARY")}</p>
          <div className="cta-row" data-testid="cta-hero">
            <Link className="site-btn" href={registerHref} data-testid="hero-register">
              Register
            </Link>
            <Link className="site-btn site-btn-ghost" href="/about" data-testid="hero-know-more">
              Know more
            </Link>
          </div>
          <LogoReel orgs={PARTNERS} />
        </div>
        <p className="hero-pole is-left">
          <b>
            Venture
            <br />
            Practice
          </b>
        </p>
      </section>

      <PhotoLanes />

      {/* ── Statement ───────────────────────────────────────────────── */}
      <section id="about" className="site-section is-rule" data-testid="home-statement">
        <div className="site-shell">
          <div className="home-statement">
            <blockquote>“{HOME_QUOTE}”</blockquote>
            <p className="home-statement-body">{HOME_BRIDGE}</p>
            <p className="home-statement-more">
              <Link href="/about">Know more about IITB INV.ENT</Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── Who it is for ───────────────────────────────────────────── */}
      <section className="site-section is-rule" id="programme" data-testid="home-audiences">
        <div className="site-shell">
          <div className="days-grid">
            {HOME_AUDIENCES.map((group) => (
              <article className="day-col is-plain" key={group.id}>
                <h2>{group.title}</h2>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── DSSE scoreboard ─────────────────────────────────────────── */}
      <section className="site-section is-navy is-ecosystem">
        <NavyGeometry />
        <div className="site-shell ecosystem-row" style={{ position: "relative" }}>
          <div className="ecosystem-copy">
            <p className="ecosystem-school">Desai Sethi School of Entrepreneurship</p>
            <h2 className="ecosystem-title">The ecosystem behind the conference</h2>
          </div>
          <div className="stats-grid" data-testid="landing-stats">
            {stats.map((stat) => (
              <div className="stat-block" key={`${stat.value}-${stat.label}`}>
                <b>{stat.value}</b>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Audience ─────────────────────────────────────────────────── */}
      <section className="site-section" id="audience">
        <div className="site-shell">
          <p className="site-kicker">Audience</p>
          <h2>Who’s in the room?</h2>
          <p className="lead">
            IITB INV.ENT brings together the people who study entrepreneurship and the
            people who live it.
          </p>
          <div className="room-grid is-five">
            {AUDIENCE.map((item) => (
              <div className="room-item" key={item.id}>
                <LineIcon name={item.icon} />
                <p>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Partners ────────────────────────────────────────────────── */}
      <section className="site-section is-rule" id="sponsors" data-testid="landing-sponsors">
        <div className="site-shell">
          <h2>Our Partners</h2>
          <LogoWall orgs={PARTNERS} testId="partner-wall" logosOnly />
          <div className="partner-aside">
            <article data-testid="landing-joe">
              <p className="site-kicker is-green">Publication partner</p>
              <h3>The Journal of Entrepreneurship</h3>
              <p>
                JoE is the publication partner for IITB INV.ENT 2027. Authors of the
                best selected entrepreneurship papers may submit. Papers are reviewed
                as regular submissions, and publication is not assured.
              </p>
              <Link href="/sponsors#journals">How submission works →</Link>
            </article>
            <article data-testid="landing-travel-grant">
              <p className="site-kicker is-blue">Travel support</p>
              <h3>Up to {TRAVEL_GRANT.amount} to present</h3>
              <p>
                {TRAVEL_GRANT.partner} offers travel support for eligible full-time PhD
                and FPM scholars at recognised Indian institutions. The grant is
                awarded by application, not with conference acceptance.
              </p>
              <Link href="/travel#grant">Grant details →</Link>
            </article>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────── */}
      <section className="site-section is-blue" id="register">
        <CtaOrbits />
        <div className="site-shell" style={{ position: "relative" }}>
          <h2>
            Come build
            <br />
            the conversation.
          </h2>
          <p className="lead">
            Researchers, founders, investors, incubators, students and operators — all in
            the same room.
          </p>
          <p className="lead">That’s IITB INV.ENT.</p>
          <div className="cta-row" data-testid="cta-register">
            <Link className="site-btn site-btn-white" href={registerHref}>
              Register →
            </Link>
            <Link className="site-btn site-btn-white" href="/research">
              Call for papers
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
