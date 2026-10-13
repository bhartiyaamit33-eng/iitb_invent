import Image from "next/image";
import Link from "next/link";
import { LogoReel, LogoWall } from "./LogoWall";
import { PhotoLanes } from "./PhotoLanes";
import { SitePhoto } from "./SitePhoto";
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
      <section className="site-section is-navy">
        <NavyGeometry />
        <div className="site-shell" style={{ position: "relative" }}>
          <p className="site-kicker is-green" style={{ fontSize: 12 }}>
            DSSE
          </p>
          <h2>
            The ecosystem
            <br />
            behind the conference
          </h2>
          <div className="stats-grid" data-testid="landing-stats">
            {stats.map((stat) => (
              <div className="stat-block" key={`${stat.value}-${stat.label}`}>
                <b>{stat.value}</b>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
          <SitePhoto
            className="is-wide"
            src="/assets/dsse-building.jpg"
            alt="The Desai Sethi School of Entrepreneurship building at IIT Bombay"
            caption="DSSE Building · IIT Bombay"
            width={1600}
            height={900}
            testId="landing-dsse-building"
          />
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
          <div className="room-grid">
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
          <h2 className="sr-only">Partners</h2>
          <LogoWall orgs={PARTNERS} testId="partner-wall" logosOnly />
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
