"use client";

import Link from "next/link";
import {
  AGENDA,
  IMAGES,
  PARTICIPATE,
  REGISTER_HREF,
  submitHrefFor,
  type LandingFaq,
  type LandingStat,
  type TimelineItem,
} from "@/lib/landing";
import { BrandInline } from "./Wordmark";
import { ImageSplit } from "./ImagePanel";
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
  const submitHref = submitHrefFor(Boolean(signedInName));
  const registerHref = signedInName ? "/dashboard" : REGISTER_HREF;
  const accountHref = signedInName ? "/dashboard" : "/login";
  const connectLabel = signedInName ? "Go to dashboard" : "Log in";
  const ghostSignupHref = signedInName ? "/dashboard/profile" : "/signup";
  const ghostSignupLabel = signedInName ? "Edit profile" : "Create account";

  const displayStats =
    stats[0]?.value === "2014"
      ? stats
      : [
          {
            value: "2014",
            label: "Board of Governors approved the centre.",
          },
          ...stats,
        ];

  return (
    <>
      <div className="overflow-hidden whitespace-nowrap border-y border-white/10 bg-navy py-3.5 text-xs font-semibold tracking-[0.16em] text-mist uppercase">
        <span className="inline-block animate-[marquee_32s_linear_infinite] pl-[100%]">
          IITB INV.ENT 2027 · ENTREPRENEURSHIP RESEARCH AND PRACTICE CONFERENCE · 30-31 JANUARY · IIT BOMBAY · SUPPORT@IITBINVENT.COM ·
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
                Entrepreneurship is studied, and entrepreneurship is practised, and the two almost never sit in the same room. IITB INV.ENT is our attempt to fix that for two days a year.
              </p>
              <p className="lead">
                Researchers present work. Practitioners say what they are actually up against. Incubators, investors and student founders sit in the same sessions rather than in a parallel track down the corridor.
              </p>
              <p className="lead">
                IITB INV.ENT 2027 is on 30-31 January on campus.{" "}
                <Link href="/about">Read about IITB INV.ENT</Link>.
              </p>
              <div className="cta-row" data-testid="cta-signup">
                <Link className="btn" href={submitHref}>
                  Submit your abstract
                </Link>
                <Link className="btn ghost" href="/about">
                  About IITB INV.ENT
                </Link>
              </div>
            </ImageSplit>
          </Reveal>
        </div>
      </section>

      <section id="practice" className="relative border-t border-[var(--rule)]">
        <div className="landing-shell">
          <Reveal>
            <p className="landing-kicker">The pipeline</p>
            <h2 data-spark-node>What an idea runs into here</h2>
            <p className="lead">
              At IIT Bombay, research and practice are already stacked. E-Cell and the labs sit upstream. DSSE is in the middle — twenty courses, IDEAS, WiE, the Groww programme. SINE takes over downstream. IITB INV.ENT is where people at every stage of that stack stand in the same room for two days.
            </p>
            <div className="cta-row">
              <Link className="btn ghost" href="/about">
                Read the full story
              </Link>
            </div>
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
                  Faculty and doctoral scholars working on entrepreneurship, innovation and strategy. Mentors and incubation teams. Founders, including the ones who think academic research has nothing to say to them, who we would particularly like to argue with. Investors and operators who can open a door. Students who want to work in any of this.
                </p>
                <p className="lead">You do not need to be presenting to attend.</p>
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
            <h2 data-spark-node>Papers, posters, and a teaching day</h2>
            <p className="lead">
              Submit a research paper or a poster on the conference page. 30 January is a pre-conference workshop day on entrepreneurship education. You do not need to be presenting to attend.
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PARTICIPATE.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href === "/submit" ? submitHref : item.href}
                    className="group flex h-full flex-col border border-white/10 bg-navy/60 p-6 transition hover:-translate-y-0.5 hover:border-spark/50"
                    data-testid={
                      item.href === "/workshops" ? "landing-workshop" : undefined
                    }
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
                IITB INV.ENT invites research papers and poster presentations from students, faculty, and practitioners. Log in first, then submit your abstract. After organisers accept a contribution, you receive an email with a payment link. An account is not a ticket.
              </p>
              <p className="lead">
                Case studies may be submitted as papers. Abstract deadline: 15 October 2026.
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
                  Login
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

      <section id="day" className="relative border-t border-[var(--rule)]" data-testid="landing-day">
        <div className="landing-shell">
          <Reveal>
            <ImageSplit image={IMAGES.speaker} caption="Programme · 30-31 Jan 2027">
              <p className="landing-kicker section-kicker">The conference · 30-31 Jan 2027</p>
              <h2 data-spark-node>What happens on campus</h2>
              <p className="lead">
                30 January is the pre-conference day. 31 January is the conference: papers, posters, pitches, and conversations with venture capitalists, incubators and mentors. Doors from 9:00 IST; the day runs to about 19:30.
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
                <Link className="btn ghost" href="/workshops">
                  Pre-conference workshop
                </Link>
              </div>
            </ImageSplit>
          </Reveal>
        </div>
      </section>

      <section id="arrive" className="relative">
        <div className="landing-shell">
          <Reveal>
            <ImageSplit image={IMAGES.welcome} imageSide="left" caption="DSSE Building · Powai">
              <p className="landing-kicker">Before you come</p>
              <h2 data-spark-node>Campus, stay, travel</h2>
              <p className="lead">
                Venue: Desai Sethi School of Entrepreneurship · DSSE Building · IIT Bombay · Powai, Mumbai 400076. Nearest gate: IIT Bombay Main Gate.
              </p>
              <p className="lead">
                Limited twin-sharing rooms at the IIT Bombay guest houses are first-come first-served; guests pay. Anantha Hotel in Bhandup West has quoted discounted rates for delegates.
              </p>
              <div className="cta-row">
                <Link className="btn ghost" href="/accommodation" data-testid="landing-stay">
                  Stay
                </Link>
                <Link className="btn ghost" href="/travel">
                  Travel
                </Link>
                <Link className="btn ghost" href="/workshops">
                  Workshop
                </Link>
              </div>
            </ImageSplit>
          </Reveal>
        </div>
      </section>

      <section className="relative">
        <div className="landing-shell">
          <Reveal>
            <p className="landing-kicker">DSSE since 2014</p>
            <h2 data-spark-node>Scoreboard</h2>
            <p className="lead">
              Twenty courses later, DSSE has trained more than 5,550 students. The 127 startups are what is left standing.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
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
                Log in.
                <br />
                Submit your abstract.
              </h2>
              <p className="lead">
                Log in with name and email (Google optional), submit your paper or poster abstract, then complete a short profile so organisers know who you are. An account is not a ticket. After organisers select you, next steps appear on the dashboard.
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
                About IITB INV.ENT
              </Link>
              <Link className="btn ghost" href="/conference">
                Call for papers
              </Link>
              <Link className="btn ghost" href="/workshops">
                Workshop
              </Link>
              <Link className="btn ghost" href="/contact">
                Contact
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
                <Link className="btn" href="/contact" data-testid="query-contact">
                  Contact page
                </Link>
                <Link className="btn ghost" href={submitHref}>
                  Submit your abstract
                </Link>
              </div>
            </ImageSplit>
          </Reveal>
        </div>
      </section>
    </>
  );
}
