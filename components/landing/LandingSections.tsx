"use client";

import Link from "next/link";
import { LineIcon } from "@/components/diagram/LineIcon";
import { Pipeline } from "@/components/diagram/Pipeline";
import { TwoWorlds } from "@/components/diagram/TwoWorlds";
import { ProgrammeOutline } from "@/components/site/ProgrammeOutline";
import { Reveal } from "./Reveal";
import { CountUp } from "@/components/site/CountUp";
import {
  ECOSYSTEM_STATS,
  ROOM_CATEGORIES,
  SPEAKER_CATEGORIES,
  VENTURES,
  registerHrefFor,
} from "@/lib/site";
import type { PublicOrg } from "@/lib/orgs-public";
import { NameLanes } from "./NameLanes";

export function LandingSections({
  signedInName,
  sponsors,
  partners,
}: {
  signedInName: string | null;
  sponsors: PublicOrg[];
  partners: PublicOrg[];
}) {
  const registerHref = registerHrefFor(Boolean(signedInName));

  return (
    <>
      <section id="about" className="site-section is-rule">
        <div className="site-shell">
          <Reveal>
            <div className="quote-split">
              <div>
                <blockquote>
                  “Entrepreneurship is studied,
                  and entrepreneurship is practised,
                  and the two almost never sit
                  in the same room.”
                </blockquote>
                <p className="attr">~ IITB INV.ENT</p>
              </div>
              <div className="divider" aria-hidden="true" />
              <div>
                <p className="lead">
                  IITB INV.ENT is our attempt to fix that for two days a year.
                </p>
                <p className="lead">
                  It is an entrepreneurship research and practice conference, organised by the Desai Sethi School of Entrepreneurship at IIT Bombay. Researchers present work. Practitioners say what they are actually up against. Incubators, investors and founders sit in the same sessions rather than in a parallel track down the corridor.
                </p>
                <p className="lead">
                  That is the whole idea. Everything else on this page is detail.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="site-section is-rule">
        <div className="site-shell">
          <Reveal>
            <p className="site-kicker">The meeting point</p>
            <h2>
              Two worlds.
              <br />
              One room.
            </h2>
            <TwoWorlds />
          </Reveal>
        </div>
      </section>

      <section className="site-section is-rule" data-testid="landing-day">
        <div className="site-shell">
          <Reveal>
            <p className="site-kicker">30–31 January 2027</p>
            <h2>
              Two days.
              <br />
              One ecosystem.
            </h2>
            <p className="lead">
              Preliminary. The detailed agenda will be published closer to the conference.
            </p>
            <ProgrammeOutline />
            <div className="cta-row" style={{ justifyContent: "flex-start" }}>
              <Link className="site-btn site-btn-ghost" href="/programme">
                View Full Programme →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="site-section is-rule">
        <div className="site-shell">
          <Reveal>
            <p className="site-kicker">The stack</p>
            <h2>
              From campus
              <br />
              to company
            </h2>
            <p className="lead">
              A complete pipeline, from student clubs to successful ventures.
            </p>
            <Pipeline />
            <p className="site-kicker" style={{ marginTop: 48 }}>
              Some of our ventures
            </p>
            <ul className="venture-list">
              {VENTURES.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="site-section is-rule" id="speakers" data-testid="landing-speakers">
        <div className="site-shell">
          <Reveal>
            <p className="site-kicker">Line-up</p>
            <h2>
              Speakers.
            </h2>
            <p className="lead">
              Researchers, founders, investors, and operators on the same stage.
              The 2027 line-up will be published here as names are confirmed —
              there will be many of them.
            </p>
            <div className="room-grid">
              {SPEAKER_CATEGORIES.map((label) => (
                <div className="room-item" key={label}>
                  <p>{label}</p>
                </div>
              ))}
            </div>
            <p className="coming-card">Coming soon</p>
            <div className="cta-row" style={{ justifyContent: "flex-start" }}>
              <Link className="site-btn site-btn-ghost" href="/speakers">
                Speakers →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {sponsors.length > 0 || partners.length > 0 ? (
        <section className="site-section is-rule" id="partners" data-testid="landing-partners">
          <div className="site-shell">
            <Reveal>
              <p className="site-kicker">Together</p>
              <h2>
                Partners
                <br />
                and sponsors.
              </h2>
              <p className="lead">
                Hosted by the Desai Sethi School of Entrepreneurship at IIT Bombay.
                Confirmed names and logos appear here as they are added.
              </p>
            </Reveal>
          </div>
          <NameLanes sponsors={sponsors} partners={partners} />
          <div className="site-shell">
            <div className="cta-row" style={{ justifyContent: "flex-start" }}>
              <Link className="site-btn site-btn-ghost" href="/partners">
                Partners &amp; sponsors →
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="site-section is-navy">
        <div className="navy-geometry" aria-hidden="true">
          <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
            <line x1="0" y1="300" x2="1200" y2="300" stroke="#145BEF" strokeWidth="0.6" opacity="0.5" />
            <circle cx="200" cy="140" r="90" fill="none" stroke="#69B33F" strokeWidth="0.6" opacity="0.45" />
            <circle cx="980" cy="420" r="140" fill="none" stroke="#145BEF" strokeWidth="0.6" opacity="0.35" />
            <line x1="600" y1="0" x2="600" y2="600" stroke="#69B33F" strokeWidth="0.5" opacity="0.35" />
          </svg>
        </div>
        <div className="site-shell" style={{ position: "relative" }}>
          <Reveal>
            <p className="site-kicker is-green">DSSE</p>
            <h2>
              The ecosystem
              <br />
              behind the conference
            </h2>
            <div className="stats-grid">
              {ECOSYSTEM_STATS.map((stat) => (
                <div className="stat-block" key={stat.label}>
                  <b>
                    <CountUp
                      value={stat.value}
                      numeric={stat.numeric}
                      suffix={stat.suffix}
                    />
                  </b>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="site-section">
        <div className="site-shell">
          <Reveal>
            <p className="site-kicker">Audience</p>
            <h2>Who’s in the room?</h2>
            <p className="lead">
              IITB INV.ENT brings together the people who study entrepreneurship and the people who live it.
            </p>
            <div className="room-grid">
              {ROOM_CATEGORIES.map((item) => (
                <div className="room-item" key={item.label}>
                  <LineIcon name={item.icon} />
                  <p>{item.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="site-section is-blue">
        <div className="cta-orbits" aria-hidden="true">
          <svg viewBox="0 0 1200 500" preserveAspectRatio="xMidYMid slice">
            <ellipse cx="980" cy="80" rx="260" ry="160" fill="none" stroke="currentColor" strokeWidth="0.8" />
            <ellipse cx="980" cy="80" rx="180" ry="110" fill="none" stroke="currentColor" strokeWidth="0.6" />
            <circle cx="980" cy="80" r="6" fill="#69B33F" />
            <line x1="0" y1="250" x2="1200" y2="250" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
          </svg>
        </div>
        <div className="site-shell" style={{ position: "relative" }}>
          <Reveal>
            <h2>
              Come build
              <br />
              the conversation.
            </h2>
            <p className="lead">
              Researchers, founders, investors, incubators,
              students and operators — all in the same room.
            </p>
            <p className="lead">That’s IITB INV.ENT.</p>
            <div className="cta-row">
              <Link className="site-btn site-btn-white" href={registerHref}>
                Register →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
