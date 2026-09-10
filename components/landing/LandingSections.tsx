"use client";

import Link from "next/link";
import {
  AGENDA,
  IMAGES,
  PARTICIPATE,
  REGISTER_HREF,
  SUBMIT_HREF,
  VENTURE_KINDS,
  type LandingFaq,
  type LandingStat,
  type TimelineItem,
} from "@/lib/landing";
import { BrandInline } from "./Wordmark";
import { ImagePanel, ImageSplit } from "./ImagePanel";
import { OrbitBackdrop } from "./OrbitBackdrop";
import { Reveal } from "./Reveal";
import { Timeline } from "./Timeline";
import { TypeIcon } from "./TypeIcon";

export function LandingSections({
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
  const submitHref = SUBMIT_HREF;
  const registerHref = signedInName ? "/dashboard" : REGISTER_HREF;
  const accountHref = signedInName ? "/dashboard" : "/login";
  const connectLabel = signedInName ? "Go to dashboard" : "Log in to connect";
  const signupLabel = signedInName ? "Go to dashboard" : "Create free account";
  const ghostSignupHref = signedInName ? "/2027/attendees" : "/signup";
  const ghostSignupLabel = signedInName ? "Browse attendees" : "Create account";

  const displayStats =
    stats[0]?.value === "2014"
      ? stats
      : [
          {
            value: "2014",
            label: "Board approved the centre. Foundation day locked.",
          },
          ...stats,
        ];

  return (
    <>
      <div className="overflow-hidden whitespace-nowrap border-y border-white/10 bg-navy py-3.5 text-xs font-semibold tracking-[0.16em] text-mist uppercase">
        <span className="inline-block animate-[marquee_32s_linear_infinite] pl-[100%]">
          INV.ENT 2027 · INNOVATION · ENTREPRENEURSHIP · 31 JANUARY ANNUALLY · WHERE RESEARCH MEETS VENTURE PRACTICE · IIT BOMBAY · SUPPORT@IITBINVENT.COM ·
        </span>
      </div>

      <section id="about" className="relative">
        <OrbitBackdrop variant="section" />
        <div className="landing-shell relative">
          <Reveal>
            <p className="landing-kicker section-kicker">
              Why <BrandInline />
            </p>
            <ImageSplit image={IMAGES.campus} caption="DSSE Building · IIT Bombay">
              <h2 data-spark-node>
                Research meets
                <br />
                venture practice.
              </h2>
              <p className="lead">
                INV.ENT is the annual foundation-day gathering of the Desai Sethi School of Entrepreneurship at IIT Bombay. It exists so ideas do not die in labs: students, faculty, founders, investors, and operators share one campus day — then stay connected through the year.
              </p>
              <p className="lead">
                The same programme is searched as INVENT, iitbinvent, iitb_invent, and DSSE Day. All of those names refer to this IIT Bombay gathering and to iitbinvent.com. Read{" "}
                <Link href="/about">what INVENT is</Link>
                {" "}and{" "}
                <Link href="/dsse-day">what DSSE Day is</Link>.
              </p>
              <p className="lead">
                On 31 January 2014, IIT Bombay’s Board of Governors approved what became DSSE. That anniversary is DSSE Day. INV.ENT is how the school opens its doors publicly: speaker sessions, poster presentations, venture pitches, and the conversations that turn prototypes into companies.
              </p>
              <p className="lead">
                This is not a one-off microsite. Editions stack year after year. Profiles and networks carry forward. The day is the spark; the platform is the continuity.
              </p>
              <div className="cta-row" data-testid="cta-signup">
                <Link className="btn" href={signedInName ? "/dashboard" : "/signup"}>
                  {signupLabel}
                </Link>
                <Link className="btn ghost" href="/programme">
                  See the programme
                </Link>
              </div>
            </ImageSplit>
          </Reveal>
        </div>
      </section>

      <section id="practice" className="relative border-t border-[var(--rule)]">
        <div className="landing-shell">
          <Reveal>
            <p className="landing-kicker">Research + practice</p>
            <h2 data-spark-node>One campus day. Two languages.</h2>
            <p className="lead">
              Faculty and labs bring evidence. Founders and operators bring the ask. INV.ENT holds both in the same visual — and the same room.
            </p>
          </Reveal>
        </div>
      </section>

      <section id="audience" className="relative">
        <div className="landing-shell">
          <Reveal>
            <ImageSplit image={IMAGES.networking} imageSide="left" caption="Who this is for">
              <p className="landing-kicker">Who it is for</p>
              <h2 data-spark-node>Who this is for</h2>
              <aside className="border-t border-spark pt-7">
                <p className="lead">
                  Student and faculty founders. Researchers stuck at lab-to-market. Alumni who mentor. Investors and operators who open doors. Anyone building something India actually needs — and willing to meet the people doing the same.
                </p>
              </aside>
            </ImageSplit>
          </Reveal>
        </div>
      </section>

      <section id="participate" className="relative border-t border-[var(--rule)]">
        <OrbitBackdrop variant="section" />
        <div className="landing-shell relative">
          <Reveal>
            <p className="landing-kicker">Ways to take part</p>
            <h2 data-spark-node>Five ways onto the floor</h2>
            <p className="lead">
              Submit a contribution, bring a venture, or simply show up. Workshops are accepted through the same submissions desk as papers and posters.
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PARTICIPATE.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href === "/submit" ? submitHref : item.href}
                    className="group flex h-full flex-col border border-white/10 bg-navy/60 p-6 transition hover:-translate-y-0.5 hover:border-spark/50"
                  >
                    <TypeIcon name={item.icon} />
                    <strong className="landing-serif mt-4 mb-2 text-[26px] font-normal text-frost">
                      {item.title}
                    </strong>
                    <span className="text-sm leading-relaxed text-mist">{item.body}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section id="contribute" className="relative">
        <div className="landing-shell">
          <Reveal>
            <ImageSplit
              image={IMAGES.research}
              caption="Poster session · DSSE"
            >
              <p className="mb-2 text-[13px] font-bold tracking-[0.2em] text-spark uppercase">
                Call for
              </p>
              <h2 data-spark-node>Submissions</h2>
              <p className="lead">
                INV.ENT invites research papers, poster presentations, and workshops from students, faculty, and practitioners. After organisers accept a contribution, you receive an email with a payment link — fees collect through IIT Bombay Online Pay into an IITB account.
              </p>
              <p className="lead">
                Startup showcases and innovation demos live in the venture directory. Case studies may be submitted as papers.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="border-t border-cyan-glow/40 pt-3">
                  <TypeIcon name="paper" />
                  <p className="mt-2 text-[12px] font-semibold tracking-[0.16em] text-cyan-glow uppercase">
                    Research paper
                  </p>
                </div>
                <div className="border-t border-cyan-glow/40 pt-3">
                  <TypeIcon name="poster" />
                  <p className="mt-2 text-[12px] font-semibold tracking-[0.16em] text-cyan-glow uppercase">
                    Poster presentation
                  </p>
                </div>
              </div>
              <div className="cta-row">
                <Link className="btn" href={submitHref} data-testid="cta-submit">
                  Submit your abstract
                </Link>
                <Link className="btn ghost" href={registerHref}>
                  Register to attend
                </Link>
              </div>
            </ImageSplit>
            <div id="dates" className="mt-6">
              <p className="landing-kicker">Key dates</p>
              <Timeline items={timeline} />
            </div>
          </Reveal>
        </div>
      </section>

      <section id="day" className="relative border-t border-[var(--rule)]">
        <div className="landing-shell">
          <Reveal>
            <ImageSplit image={IMAGES.speaker} caption="Programme · 31 Jan 2027">
              <p className="landing-kicker section-kicker">The event · 31 Jan 2027</p>
              <h2 data-spark-node>What happens on campus</h2>
              <p className="lead">
                Doors from 9:00 IST at the DSSE Building. Sessions run through the evening. RSVP on the programme for capped rooms; waitlists open when full.
              </p>
              <div className="mt-4 border-t border-white/10">
                {AGENDA.map((row) => (
                  <article
                    key={row.title}
                    className="grid grid-cols-[100px_1fr] gap-5 border-b border-white/10 py-[22px] max-[860px]:grid-cols-1 max-[860px]:gap-1.5"
                  >
                    <time className="landing-serif text-[22px] text-cyan-glow">{row.time}</time>
                    <div>
                      <strong className="mb-1 block text-frost">{row.title}</strong>
                      <p className="m-0 text-sm leading-relaxed text-mist">{row.body}</p>
                    </div>
                  </article>
                ))}
              </div>
              <div className="cta-row">
                <Link className="btn ghost" href="/programme">
                  Full programme
                </Link>
                <Link className="btn ghost" href="/2027/attendees">
                  Attendee directory
                </Link>
                <Link className="btn ghost" href="/ventures">
                  Startups &amp; projects
                </Link>
              </div>
            </ImageSplit>
          </Reveal>
        </div>
      </section>

      <section id="arrive" className="relative">
        <div className="landing-shell">
          <Reveal>
            <ImageSplit image={IMAGES.welcome} imageSide="left" caption="DSSE auditorium">
              <p className="landing-kicker">Before you come</p>
              <h2 data-spark-node>Campus, badge, network</h2>
              <p className="lead">
                Venue: Desai Sethi School of Entrepreneurship · DSSE Building · IIT Bombay · Powai, Mumbai 400076. Nearest gate: IIT Bombay Main Gate. Check in with your ticket QR. Complete a short profile if you want to be found in the directory.
              </p>
              <div className="cta-row">
                <Link className="btn ghost" href="/programme">
                  RSVP sessions
                </Link>
                <Link className="btn ghost" href={accountHref}>
                  {signedInName ? "Your ticket" : "Create account"}
                </Link>
              </div>
            </ImageSplit>
          </Reveal>
        </div>
      </section>

      <section id="startups" className="relative border-t border-[var(--rule)]">
        <OrbitBackdrop variant="section" />
        <div className="landing-shell relative">
          <Reveal>
            <p className="landing-kicker">Startup directory</p>
            <h2 data-spark-node>Startups, projects &amp; ideas</h2>
            <p className="lead">
              Browse what IIT Bombay founders and labs are building — logos, short pitches, and links — without leaving INV.ENT. Open a website only when you choose. Add your own from the dashboard after you sign in.
            </p>
            <div className="mt-8">
              <ImagePanel
                src={IMAGES.panel.src}
                alt={IMAGES.panel.alt}
                caption="On campus · DSSE"
                className="min-h-[240px] lg:min-h-[340px]"
              />
            </div>
            <div className="mt-7 grid gap-5 md:grid-cols-3">
              {VENTURE_KINDS.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="border-t border-white/20 pt-3 min-h-[140px] transition hover:-translate-y-0.5 hover:border-spark"
                >
                  <strong className="landing-serif mb-2 block text-[28px] font-normal text-frost">
                    {item.title}
                  </strong>
                  <span className="text-sm leading-relaxed text-mist">{item.body}</span>
                </Link>
              ))}
            </div>
            <div className="cta-row">
              <Link className="btn" href="/ventures">
                Open startup directory
              </Link>
              <Link className="btn ghost" href="/dashboard/ventures">
                Add your venture
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative">
        <div className="landing-shell">
          <Reveal>
            <p className="landing-kicker">DSSE since 2014</p>
            <h2 data-spark-node>Scoreboard</h2>
            <div className="mt-3 grid grid-cols-2 gap-6 md:grid-cols-4">
              {displayStats.map((s) => (
                <div key={s.value + s.label}>
                  <b className="landing-serif mb-2 block text-[clamp(36px,4.6vw,52px)] font-normal leading-none text-frost">
                    {s.value}
                  </b>
                  <span className="text-[13px] leading-snug text-haze">{s.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section id="connect" className="relative">
        <div className="landing-shell">
          <Reveal>
            <ImageSplit image={IMAGES.handshake} caption="Attendee network">
              <p className="landing-kicker">People</p>
              <h2>
                See who is coming.
                <br />
                Actually connect.
              </h2>
              <p className="lead">
                INV.ENT is as much a network as a day. Sign in with name and email (Google optional), complete a short profile — LinkedIn, persona, what you are building — and opt into the attendee directory. Browse who is pitching, speaking, or sitting next to you. Send a LinkedIn note or an intro request without friction.
              </p>
              <div className="cta-row" data-testid="cta-register">
                <Link className="btn" href={accountHref} data-spark-node>
                  {connectLabel}
                </Link>
                <Link className="btn ghost" href={ghostSignupHref}>
                  {ghostSignupLabel}
                </Link>
              </div>
            </ImageSplit>
          </Reveal>
        </div>
      </section>

      <section id="faq" className="relative border-t border-[var(--rule)]">
        <div className="landing-shell landing-faq">
          <Reveal>
            <p className="landing-kicker">FAQ</p>
            <h2 data-spark-node>Before you write in</h2>
            {faqs.map((f) => (
              <details key={f.question}>
                <summary>{f.question}</summary>
                <p>{f.answer}</p>
              </details>
            ))}
            <div className="cta-row">
              <Link className="btn ghost" href="/faq">
                All questions
              </Link>
              <Link className="btn ghost" href="/about">
                What is INVENT
              </Link>
              <Link className="btn ghost" href="/dsse-day">
                What is DSSE Day
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="query" className="relative">
        <OrbitBackdrop variant="section" />
        <div className="landing-shell relative">
          <Reveal>
            <ImageSplit
              image={IMAGES.faculty}
              caption="DSSE team · IIT Bombay"
              grade="photo"
              testId="query-team"
              imageClassName="aspect-[3/2] min-h-[220px]"
              imgClassName="object-[center_68%]"
            >
              <p className="landing-kicker">Contact</p>
              <h2 data-spark-node>Queries</h2>
              <p className="lead" data-testid="query-lead">
                Press, partners, speakers, volunteers, campus access, or “I have a company and a problem.” One inbox. Humans read it.
              </p>
              <p>
                <a className="mail" href="mailto:support@iitbinvent.com">
                  support@iitbinvent.com
                </a>
              </p>
              <p className="lead mt-5">
                Desai Sethi School of Entrepreneurship · DSSE Building · IIT Bombay · Powai, Mumbai 400076
              </p>
              <div className="cta-row">
                <Link className="btn" href={submitHref}>
                  Submit your abstract
                </Link>
                <Link className="btn outline" href={registerHref}>
                  Register to attend
                </Link>
              </div>
            </ImageSplit>
          </Reveal>
        </div>
      </section>
    </>
  );
}
