import Image from "next/image";
import Link from "next/link";
import { KeyDates } from "./KeyDates";
import { LogoWall } from "./LogoWall";
import { PhotoLanes } from "./PhotoLanes";
import { SitePhoto } from "./SitePhoto";
import { InventMark } from "./InventMark";
import { CtaOrbits, IntersectField, LineIcon, NavyGeometry } from "./decor";
import {
  submitHrefFor,
  type LandingFaq,
  type LandingStat,
  type TimelineItem,
} from "@/lib/landing";
import {
  ABOUT_LEAD,
  ABOUT_QUOTE,
  AUDIENCE,
  EVENT_DATES,
  EVENT_DATES_SHORT,
  HERO_HEADLINE_ACCENT,
  HERO_HEADLINE_LEAD,
  PARTNERS,
  PARTNER_JOURNALS,
  PARTNER_JOURNALS_NOTE,
  PARTNER_JOURNALS_PROMISE,
  PIPELINE,
  PROGRAMME_DAYS,
  RESEARCH_HIGHLIGHTS,
  SPEAKER_GROUPS,
  SPONSORS,
  SPONSOR_PITCH,
  SUPPORT_EMAIL,
  VENTURES,
  VENUE_LINES,
} from "@/lib/site-content";

const HIGHLIGHT_ICONS = ["award", "journal", "network", "workshop"] as const;

export function SiteLanding({
  signedInName,
  faqs,
  stats,
  timeline,
}: {
  signedInName: string | null;
  faqs: LandingFaq[];
  stats: LandingStat[];
  timeline: TimelineItem[];
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
            <InventMark className="hero-lockup-mark" />
          </p>
          <h1 id="hero-heading">
            {HERO_HEADLINE_LEAD}
            <span className="accent">{HERO_HEADLINE_ACCENT}</span>
          </h1>
          <p className="hero-meta">{EVENT_DATES_SHORT.replace("JAN", "JANUARY")}</p>
          <p className="hero-axes">
            RESEARCH&nbsp;● INNOVATION&nbsp;● ENTREPRENEURSHIP&nbsp;● IMPACT
          </p>
          <div className="cta-row" data-testid="cta-hero">
            <Link className="site-btn" href={registerHref} data-testid="hero-register">
              Register →
            </Link>
            <Link className="site-btn site-btn-ghost" href="/programme">
              Explore Programme
            </Link>
          </div>
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

      {/* ── About ────────────────────────────────────────────────────── */}
      <section id="about" className="site-section is-rule">
        <div className="site-shell">
          <div className="quote-split">
            <div>
              <blockquote>“{ABOUT_QUOTE}”</blockquote>
              <p className="attr">~ IITB INV.ENT</p>
            </div>
            <div className="divider" aria-hidden="true" />
            <div>
              {ABOUT_LEAD.map((para) => (
                <p className="lead" key={para.slice(0, 32)}>
                  {para}
                </p>
              ))}
              <div className="cta-row" style={{ justifyContent: "flex-start" }}>
                <Link className="site-btn site-btn-ghost" href="/about">
                  What INV.ENT is →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Programme ────────────────────────────────────────────────── */}
      <section className="site-section is-rule" id="programme">
        <div className="site-shell">
          <p className="site-kicker">{EVENT_DATES}</p>
          <h2>
            Two days.
            <br />
            One ecosystem.
          </h2>
          <div className="days-grid">
            {PROGRAMME_DAYS.map((day) => (
              <article className="day-col" key={day.id}>
                <p className="site-kicker is-blue">{day.kicker}</p>
                <p className="date">{day.date}</p>
                <h3>{day.title}</h3>
                <p className="lead">{day.lead}</p>
                <ul>
                  {day.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className="cta-row" style={{ justifyContent: "flex-start" }}>
            <Link className="site-btn site-btn-ghost" href="/programme">
              View Full Programme →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Research, awards, partner journals ───────────────────────── */}
      <section className="site-section is-rule" id="research" data-testid="landing-research">
        <div className="site-shell">
          <p className="site-kicker is-blue">Call for papers</p>
          <h2>
            Present your research.
            <br />
            Then publish it.
          </h2>
          <p className="lead">
            The Research tab carries the whole call: research paper presentations, poster
            presentations, pre-conference workshops, submission guidelines, the review
            process, and the fee for each category. Abstracts are reviewed by a panel of
            eminent entrepreneurship scholars.
          </p>

          <div className="room-grid" data-testid="research-highlights">
            {RESEARCH_HIGHLIGHTS.map((item, i) => (
              <div className="room-item" key={item.id}>
                <LineIcon name={HIGHLIGHT_ICONS[i] ?? "paper"} />
                <p>
                  <strong style={{ fontWeight: 500 }}>{item.title}</strong>
                </p>
                <p style={{ color: "var(--mute)", fontSize: 13, marginTop: 6 }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          <div
            className="site-callout"
            style={{ marginTop: 44 }}
            data-testid="partner-journals"
          >
            <p className="site-kicker is-green" style={{ marginBottom: 10 }}>
              Partner journals
            </p>
            <p style={{ margin: "0 0 12px" }}>{PARTNER_JOURNALS_PROMISE}</p>
            {PARTNER_JOURNALS.length > 0 ? (
              <ul className="journal-list" style={{ marginTop: 8 }}>
                {PARTNER_JOURNALS.map((journal) => (
                  <li key={journal.id}>
                    <b>{journal.name}</b>
                    <span>{journal.note}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            <p style={{ margin: 0, fontSize: 13, color: "var(--mute)" }}>
              {PARTNER_JOURNALS_NOTE}
            </p>
          </div>

          <div style={{ marginTop: 48 }}>
            <p className="site-kicker">Key dates</p>
            <KeyDates items={timeline} />
          </div>

          <div className="cta-row" style={{ justifyContent: "flex-start" }}>
            <Link className="site-btn" href="/research" data-testid="landing-research-cta">
              Read the call for papers →
            </Link>
            <Link className="site-btn site-btn-ghost" href={submitHref}>
              Submit your abstract
            </Link>
          </div>
        </div>
      </section>

      {/* ── Ecosystem ────────────────────────────────────────────────── */}
      <section className="site-section is-rule" id="ecosystem">
        <div className="site-shell">
          <p className="site-kicker">The stack</p>
          <h2>
            From campus
            <br />
            to company
          </h2>
          <p className="lead">
            A complete pipeline, from student clubs to successful ventures.
          </p>
          <ol className="pipeline" aria-label="From campus to company">
            {PIPELINE.map((step, i) => (
              <li key={step}>
                <span>{step}</span>
                {i < PIPELINE.length - 1 ? (
                  <span className="pipeline-arrow" aria-hidden="true">
                    →
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
          <p className="site-kicker" style={{ marginTop: 48 }}>
            Some of our ventures
          </p>
          <ul className="venture-list">
            {VENTURES.map((venture) => (
              <li key={venture}>{venture}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Speakers ─────────────────────────────────────────────────── */}
      <section className="site-section is-rule" id="speakers">
        <div className="site-shell">
          <p className="site-kicker">Line-up</p>
          <h2>Speakers.</h2>
          <p className="lead">
            Researchers, founders, investors, and operators on the same stage. The 2027
            line-up is published here as names are confirmed.
          </p>
          <div className="room-grid">
            {SPEAKER_GROUPS.map((group) => (
              <div className="room-item" key={group}>
                <p>{group}</p>
              </div>
            ))}
          </div>
          <p className="coming-card">Coming soon</p>
          <div className="cta-row" style={{ justifyContent: "flex-start" }}>
            <Link className="site-btn site-btn-ghost" href="/speakers">
              Speakers →
            </Link>
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

      {/* ── Sponsors and partners ───────────────────────────────────── */}
      <section className="site-section is-rule" id="sponsors" data-testid="landing-sponsors">
        <div className="site-shell">
          <p className="site-kicker is-green">Sponsors &amp; partners</p>
          <h2>
            The names
            <br />
            behind the two days.
          </h2>
          <p className="lead">{SPONSOR_PITCH}</p>

          <p className="site-kicker" style={{ marginTop: 44 }}>
            Sponsors
          </p>
          <LogoWall orgs={SPONSORS} testId="sponsor-wall" />

          <p className="site-kicker" style={{ marginTop: 44 }}>
            Partners
          </p>
          <LogoWall orgs={PARTNERS} testId="partner-wall" />

          <p className="logo-wall-note">
            More sponsors and partners are added as agreements are signed. To put your
            name here, write to{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: "var(--blue)" }}>
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
          <div className="cta-row" style={{ justifyContent: "flex-start" }}>
            <Link className="site-btn site-btn-ghost" href="/sponsors">
              Sponsors &amp; partners →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="site-section is-rule" id="faq">
        <div className="site-shell">
          <p className="site-kicker">FAQ</p>
          <h2>Before you write in</h2>
          <dl className="faq-list" data-testid="landing-faqs">
            {faqs.slice(0, 5).map((faq) => (
              <div key={faq.question}>
                <dt>
                  <h3>{faq.question}</h3>
                </dt>
                <dd>{faq.answer}</dd>
              </div>
            ))}
          </dl>
          <div className="cta-row" style={{ justifyContent: "flex-start" }}>
            <Link className="site-btn site-btn-ghost" href="/faq">
              All questions →
            </Link>
            <Link className="site-btn site-btn-ghost" href="/contact">
              Contact
            </Link>
          </div>
        </div>
      </section>

      {/* ── Support ──────────────────────────────────────────────────── */}
      <section className="site-section is-rule" id="support" data-testid="landing-support">
        <div className="site-shell">
          <p className="site-kicker">Support</p>
          <h2>Queries</h2>
          <div className="support-split">
            <div>
              <p className="lead">
                Press, partners, speakers, volunteers, campus access, submissions, or “I
                have a company and a problem.” One inbox, read by the DSSE team.
              </p>
              <p style={{ margin: "0 0 20px" }}>
                <a className="contact-mail" href={`mailto:${SUPPORT_EMAIL}`}>
                  {SUPPORT_EMAIL}
                </a>
              </p>
              <p className="lead">
                {VENUE_LINES.join(" · ")}
              </p>
              <div className="cta-row" style={{ justifyContent: "flex-start" }}>
                <Link className="site-btn site-btn-ghost" href="/contact">
                  Contact →
                </Link>
                <Link className="site-btn site-btn-ghost" href="/accommodation">
                  Accommodation
                </Link>
              </div>
            </div>
            <SitePhoto
              src="/assets/landing/symposium-group.jpg"
              alt="The DSSE team on stage at the Entrepreneurship Research Symposium, IIT Bombay"
              caption="DSSE team · IIT Bombay"
              width={1600}
              height={1067}
              sizes="(max-width: 860px) 100vw, 540px"
              testId="landing-dsse-team"
            />
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
