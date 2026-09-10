"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CFP_AI_POLICY,
  CFP_AREAS,
  CFP_CLOSE_BODY,
  CFP_CLOSE_HEADING,
  CFP_DATES,
  CFP_DEADLINE,
  CFP_GUIDELINE_POINTS,
  CFP_HIGHLIGHTS,
  CFP_INTRO,
  CFP_KICKER,
  CFP_PRESENTATION_DATE,
  CFP_SELECTION,
  CFP_TAGLINE,
  CFP_VENUE,
  CFP_WHO,
} from "@/lib/conference-copy";
import { IMAGES, markTimeline } from "@/lib/landing";
import { EventLanes } from "@/components/landing/EventLanes";
import { ImageSplit } from "@/components/landing/ImagePanel";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingTheme } from "@/components/landing/LandingTheme";
import { OrbitBackdrop } from "@/components/landing/OrbitBackdrop";
import { Reveal } from "@/components/landing/Reveal";
import { SparkTrail } from "@/components/landing/SparkTrail";
import { Timeline } from "@/components/landing/Timeline";
import { TypeIcon } from "@/components/landing/TypeIcon";
import { Wordmark } from "@/components/landing/Wordmark";

export function ConferenceCall({
  signedInName,
  applySlot,
}: {
  signedInName: string | null;
  applySlot: ReactNode;
}) {
  const timeline = markTimeline(CFP_DATES);

  return (
    <div className="landing">
      <LandingTheme />
      <SparkTrail />
      <ConferenceHero signedInName={signedInName} />
      <EventLanes />
      <div className="overflow-hidden whitespace-nowrap border-y border-white/10 bg-navy py-3.5 text-xs font-semibold tracking-[0.16em] text-mist uppercase">
        <span className="inline-block animate-[marquee_32s_linear_infinite] pl-[100%]">
          IITB INV.ENT CONFERENCE · CALL FOR RESEARCH PAPERS · EXTENDED ABSTRACT
          15 OCT 2026 · 30 PAPERS · 30 POSTERS · IIT BOMBAY · 31 JANUARY 2027 ·
        </span>
      </div>

      <section id="intro" className="relative">
        <OrbitBackdrop variant="section" />
        <div className="landing-shell relative">
          <Reveal>
            <ImageSplit
              image={IMAGES.research}
              caption="Poster session · DSSE"
              priority
            >
              <p className="landing-kicker">{CFP_KICKER}</p>
              <h2 data-spark-node>Where research meets venture practice</h2>
              {CFP_INTRO.map((p) => (
                <p key={p.slice(0, 24)} className="lead">
                  {p}
                </p>
              ))}
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="border-t border-cyan-glow/40 pt-3">
                  <dt className="text-[11px] font-semibold tracking-[0.16em] text-cyan-glow uppercase">
                    Presentation date
                  </dt>
                  <dd className="landing-serif mt-1 text-[22px] text-frost">
                    {CFP_PRESENTATION_DATE}
                  </dd>
                </div>
                <div className="border-t border-cyan-glow/40 pt-3">
                  <dt className="text-[11px] font-semibold tracking-[0.16em] text-cyan-glow uppercase">
                    Venue
                  </dt>
                  <dd className="landing-serif mt-1 text-[22px] text-frost">
                    {CFP_VENUE}
                  </dd>
                </div>
              </dl>
              <div className="cta-row">
                <ApplyLink className="btn">Submit your extended abstract</ApplyLink>
              </div>
            </ImageSplit>
          </Reveal>
        </div>
      </section>

      <section id="who" className="relative border-t border-[var(--rule)]">
        <div className="landing-shell">
          <Reveal>
            <p className="landing-kicker">Eligibility</p>
            <h2 data-spark-node>Who can apply?</h2>
            <p className="lead">We invite applications from:</p>
            <ul className="mt-8 grid gap-4 md:grid-cols-3">
              {CFP_WHO.map((item, i) => (
                <li
                  key={item.title}
                  className="border border-white/10 bg-navy/60 p-6"
                >
                  <TypeIcon
                    name={i === 0 ? "paper" : i === 1 ? "poster" : "case"}
                  />
                  <strong className="landing-serif mt-4 mb-2 block text-[26px] font-normal text-frost">
                    {item.title}
                  </strong>
                  <span className="text-sm leading-relaxed text-mist">
                    {item.body}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section id="dates" className="relative border-t border-[var(--rule)]">
        <OrbitBackdrop variant="section" />
        <div className="landing-shell relative">
          <Reveal>
            <p className="landing-kicker">Key dates</p>
            <h2 data-spark-node>From abstract to campus</h2>
            <Timeline items={timeline} />
          </Reveal>
        </div>
      </section>

      <section id="highlights" className="relative">
        <div className="landing-shell">
          <Reveal>
            <ImageSplit
              image={IMAGES.speaker}
              imageSide="left"
              caption="Programme · 31 Jan 2027"
            >
              <p className="landing-kicker">Program highlights</p>
              <h2 data-spark-node>Thirty papers. Thirty posters. Two awards.</h2>
              <p className="lead">
                A two-day INV.ENT event: workshop on 30 January, research
                presentations on 31 January at IIT Bombay.
              </p>
            </ImageSplit>
            <ul className="mt-10 grid gap-4 md:grid-cols-2">
              {CFP_HIGHLIGHTS.map((item) => (
                <li
                  key={item.title}
                  className="border border-white/10 bg-navy/60 p-6"
                >
                  <strong className="landing-serif mb-2 block text-[26px] font-normal text-frost">
                    {item.title}
                  </strong>
                  <p className="m-0 text-sm leading-relaxed text-mist">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section id="guidelines" className="relative border-t border-[var(--rule)]">
        <div className="landing-shell">
          <Reveal>
            <ImageSplit image={IMAGES.workshop} caption="Poster presentation · DSSE">
              <p className="landing-kicker">How to submit</p>
              <h2 data-spark-node>Submission guidelines</h2>
              <p className="lead">
                Applicants must submit an extended abstract of up to 1,500
                words covering:
              </p>
              <ul className="m-0 mb-6 list-none space-y-2 p-0">
                {CFP_GUIDELINE_POINTS.map((point) => (
                  <li
                    key={point}
                    className="flex items-center gap-3 text-[15px] text-frost"
                  >
                    <span className="size-1.5 shrink-0 rounded-full bg-spark shadow-[0_0_8px_rgba(200,255,61,0.6)]" />
                    {point}
                  </li>
                ))}
              </ul>
              <p className="landing-warn" role="note">
                {CFP_AI_POLICY}
              </p>
              <div className="cta-row">
                <ApplyLink className="btn">Submit your abstract</ApplyLink>
              </div>
            </ImageSplit>
          </Reveal>
        </div>
      </section>

      <section id="areas" className="relative">
        <OrbitBackdrop variant="section" />
        <div className="landing-shell relative">
          <Reveal>
            <p className="landing-kicker">Themes</p>
            <h2 data-spark-node>Suggested research areas</h2>
            <p className="lead">
              Submissions are invited across a broad range of entrepreneurship
              and innovation research themes, including:
            </p>
            <ul className="mt-8 flex flex-wrap gap-3">
              {CFP_AREAS.map((area) => (
                <li key={area} className="landing-chip">
                  {area}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section id="selection" className="relative border-t border-[var(--rule)]">
        <div className="landing-shell">
          <Reveal>
            <ImageSplit
              image={IMAGES.faculty}
              caption="DSSE team · IIT Bombay"
              grade="photo"
              imageClassName="aspect-[3/2] min-h-[220px]"
              imgClassName="object-[center_68%]"
            >
              <p className="landing-kicker">Review</p>
              <h2 data-spark-node>Selection process</h2>
              {CFP_SELECTION.map((p) => (
                <p key={p.slice(0, 32)} className="lead">
                  {p}
                </p>
              ))}
            </ImageSplit>
          </Reveal>
        </div>
      </section>

      <section id="apply" className="relative scroll-mt-8" data-testid="cfp-apply">
        <OrbitBackdrop variant="section" />
        <div className="landing-shell relative">
          <Reveal>
            <p className="landing-kicker">Submit</p>
            <h2 data-spark-node>{CFP_CLOSE_HEADING}</h2>
            <p className="lead">{CFP_CLOSE_BODY}</p>
            <p className="lead">
              Submit your extended abstract by {CFP_DEADLINE}.
            </p>
            {applySlot}
          </Reveal>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}

function ApplyLink({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      className={className}
      href="#apply"
      onClick={(event) => {
        const target = document.getElementById("apply");
        if (!target) return;
        event.preventDefault();
        const reduce = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        target.scrollIntoView({
          behavior: reduce ? "auto" : "smooth",
          block: "start",
        });
        history.replaceState(null, "", "#apply");
      }}
    >
      {children}
    </a>
  );
}

function ConferenceHero({ signedInName }: { signedInName: string | null }) {
  return (
    <header
      className="relative isolate flex min-h-[100svh] flex-col overflow-x-hidden bg-midnight text-frost"
      id="top"
      data-testid="cfp-hero"
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <Image
          src={IMAGES.hero.src}
          alt={IMAGES.hero.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[58%_40%] saturate-[0.55] contrast-[1.12] brightness-[0.42]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(7,17,31,0.88) 0%, rgba(7,17,31,0.72) 34%, rgba(7,17,31,0.38) 62%, rgba(11,30,54,0.28) 100%), linear-gradient(180deg, rgba(7,17,31,0.58) 0%, rgba(7,17,31,0.18) 30%, rgba(7,17,31,0.28) 70%, rgba(7,17,31,0.82) 100%), linear-gradient(20deg, rgba(46,143,255,0.14), transparent 42%)",
          }}
        />
      </div>
      <OrbitBackdrop variant="hero" className="z-[1]" />
      <LandingHeader
        signedInName={signedInName}
        homeBase="/test123"
        currentPath="/conference"
      />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col justify-between px-[clamp(18px,4.6vw,72px)] pt-2 pb-[clamp(20px,3vw,36px)]">
          <div className="flex flex-1 flex-col justify-center py-3">
            <p
              className="hero-rise landing-kicker is-lit mb-3"
              style={{ animationDelay: "0.08s" }}
            >
              {CFP_KICKER}
            </p>
            <p
              className="hero-rise landing-serif mb-1 text-[clamp(28px,4.6vw,56px)] leading-none text-frost"
              style={{ animationDelay: "0.12s" }}
            >
              IIT Bombay
            </p>
            <div className="hero-rise" style={{ animationDelay: "0.36s" }}>
              <Wordmark as="p" />
            </div>
            <h1
              className="hero-rise landing-serif mt-4 text-[clamp(28px,4.2vw,52px)] font-medium leading-none tracking-[-0.02em] text-frost"
              style={{ animationDelay: "0.5s" }}
            >
              Conference
            </h1>
            <p
              className="hero-tagline hero-rise landing-serif mt-6 font-medium leading-none tracking-[-0.015em] text-frost"
              data-testid="cfp-tagline"
              style={{ animationDelay: "0.62s" }}
            >
              {CFP_TAGLINE}
            </p>
            <div
              className="hero-rise cta-row"
              data-testid="cfp-hero-cta"
              style={{ animationDelay: "0.8s" }}
            >
              <ApplyLink className="btn">Submit your extended abstract</ApplyLink>
              <Link className="btn ghost" href="#dates">
                Key dates
              </Link>
            </div>
          </div>
          <div
            className="hero-rise grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-6 max-[860px]:grid-cols-[1fr_auto]"
            style={{ animationDelay: "0.95s" }}
          >
            <p className="text-[11px] font-semibold leading-relaxed tracking-[0.12em] text-mist uppercase">
              Presentation {CFP_PRESENTATION_DATE}{" "}
              <span className="whitespace-nowrap">· {CFP_VENUE}</span>
            </p>
            <a
              className="mb-1 grid size-[42px] place-items-center justify-self-center rounded-full border border-white/40 bg-midnight/35 text-frost backdrop-blur-sm max-[860px]:hidden"
              href="#intro"
              aria-label="Scroll to call for papers"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </a>
            <div className="landing-serif justify-self-end text-right leading-none">
              <span className="block whitespace-nowrap text-[clamp(22px,3.4vw,44px)] text-frost">
                Jan 30–Jan 31
              </span>
              <span className="block text-[clamp(16px,2vw,26px)] text-mist">
                2027
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
