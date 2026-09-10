import Image from "next/image";
import Link from "next/link";
import { Inter, Playfair_Display } from "next/font/google";
import { ConferenceForm } from "./ConferenceForm";
import { ConferenceStatusCard } from "@/components/conference/ConferenceStatusCard";
import { BrandInline, Wordmark } from "@/components/landing/Wordmark";
import {
  APPLICANT_ICONS,
  TIMELINE_ICONS,
  TRACK_ICONS,
} from "@/components/conference/CfpIcons";
import {
  CFP_AI_CALLOUT,
  CFP_APPLICANTS,
  CFP_GUIDELINE_POINTS,
  CFP_META,
  CFP_OVERVIEW,
  CFP_RESEARCH_AREAS,
  CFP_SELECTION,
  CFP_STAY,
  CFP_TIMELINE,
  CFP_TRACKS,
} from "@/lib/conference-cfp";
import type {
  ApplicationPaymentStatus,
  ApplicationStatus,
  ParticipationCategory,
} from "@/lib/conference";
import { CfpTheme } from "./CfpTheme";
import "./cfp.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const CHROME_NAV = [
  { href: "/about", label: "About" },
  { href: "/dsse-day", label: "DSSE Day" },
  { href: "/programme", label: "Programme" },
  { href: "/faq", label: "FAQ" },
] as const;

export type ConferenceCallApplication = {
  status: ApplicationStatus;
  participationCategory: ParticipationCategory;
  participationOther: string | null;
  paperTitle: string | null;
  paymentStatus: ApplicationPaymentStatus;
  paymentAmountPaise: number;
  paymentToken: string;
};

export function ConferenceCall({
  application,
  defaultName,
  defaultEmail,
  signedIn,
}: {
  application: ConferenceCallApplication | null;
  defaultName: string;
  defaultEmail: string;
  signedIn: boolean;
}) {
  return (
    <div className={`cfp ${inter.variable} ${playfair.variable}`}>
      <CfpTheme />
      <a href="#main" className="cfp-skip">
        Skip to content
      </a>

      <div className="cfp-chrome">
        <Link href="/" aria-label="INV.ENT home">
          <BrandInline />
        </Link>
        <nav aria-label="Site">
          {CHROME_NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <Link href="/conference" aria-current="page">
            Papers
          </Link>
          <Link href={signedIn ? "/dashboard" : "/login"}>
            {signedIn ? "Dashboard" : "Login"}
          </Link>
        </nav>
      </div>

      <header className="cfp-hero" data-testid="conference-hero">
        <div className="cfp-shell cfp-hero-inner">
          <div className="cfp-logos">
            <Link
              className="cfp-logo-iitb"
              href="https://www.iitb.ac.in/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Indian Institute of Technology Bombay"
            >
              <Image
                src="/assets/iitb-logo.png"
                alt="IIT Bombay"
                width={1024}
                height={998}
                priority
              />
            </Link>
            <Link
              className="cfp-logo-dsse"
              href="https://www.dsse.iitb.ac.in/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Desai Sethi School of Entrepreneurship"
            >
              <Image
                src="/assets/dsse-logo.png"
                alt="Desai Sethi School of Entrepreneurship"
                width={200}
                height={200}
                priority
              />
            </Link>
          </div>

          <div className="cfp-hero-mark">
            <p className="cfp-iitb">IIT Bombay</p>
            <Wordmark />
            <p className="cfp-conference-title">
              <span className="practice">Entrepreneurship Research &amp; Practice</span>{" "}
              <span className="conf">Conference</span>
            </p>
          </div>
        </div>
      </header>

      <main id="main">
        <section
          className="cfp-section"
          aria-labelledby="overview-heading"
          data-testid="conference-overview"
        >
          <div className="cfp-shell">
            <h2 id="overview-heading" className="sr-only">
              Conference overview
            </h2>
            <dl className="cfp-meta">
              {CFP_META.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
            <p className="cfp-lead" style={{ marginTop: 0 }}>
              {CFP_OVERVIEW}
            </p>
          </div>
        </section>

        <section className="cfp-section" aria-labelledby="cfp-heading">
          <div className="cfp-shell">
            <p className="cfp-kicker">Call for</p>
            <h2 id="cfp-heading" className="cfp-h2 is-poster">
              Papers
            </h2>
            <div className="cfp-tracks">
              {CFP_TRACKS.map((track) => {
                const Icon = TRACK_ICONS[track.id];
                return (
                  <div className="cfp-track" key={track.id}>
                    <Icon />
                    <span>{track.label}</span>
                  </div>
                );
              })}
            </div>
            <p className="cfp-note">
              On a broad range of Innovation &amp; Entrepreneurship Research themes
            </p>
            <a
              className="cfp-btn"
              href="#submit"
              data-testid="cfp-submit-cta"
            >
              Submit your Abstract
            </a>
          </div>
        </section>

        <section className="cfp-section" aria-labelledby="who-heading">
          <div className="cfp-shell">
            <h2 id="who-heading" className="cfp-h2">
              Who can apply
            </h2>
            <div className="cfp-people">
              {CFP_APPLICANTS.map((person) => {
                const Icon = APPLICANT_ICONS[person.id];
                return (
                  <article className="cfp-person" key={person.id}>
                    <Icon />
                    <p>{person.label}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="cfp-section" aria-labelledby="dates-heading">
          <div className="cfp-shell">
            <h2 id="dates-heading" className="cfp-h2">
              Key dates and highlights
            </h2>
            <ol className="cfp-timeline" aria-label="Key dates">
              {CFP_TIMELINE.map((item) => {
                const Icon = TIMELINE_ICONS[item.icon];
                return (
                  <li key={item.id}>
                    <span className="kicker">{item.kicker}</span>
                    <span className="date">{item.date}</span>
                    <span className="node" aria-hidden="true" />
                    <span className="icon">
                      <Icon />
                    </span>
                    <p className="highlight">{item.highlight}</p>
                    {"detail" in item && item.detail ? (
                      <p className="detail">{item.detail}</p>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section className="cfp-section" aria-labelledby="guidelines-heading">
          <div className="cfp-shell">
            <h2 id="guidelines-heading" className="cfp-h2">
              Submission guidelines
            </h2>
            <p className="cfp-lead">
              Extended abstract, up to 1,500 words, covering:
            </p>
            <ul className="cfp-guidelines">
              {CFP_GUIDELINE_POINTS.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <aside className="cfp-callout" role="note">
              {CFP_AI_CALLOUT}
            </aside>
          </div>
        </section>

        <section className="cfp-section" aria-labelledby="areas-heading">
          <div className="cfp-shell">
            <h2 id="areas-heading" className="cfp-h2">
              Suggested research areas
            </h2>
            <div className="cfp-chips" role="list">
              {CFP_RESEARCH_AREAS.map((area) => (
                <span className="cfp-chip" role="listitem" key={area}>
                  {area}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="cfp-section" aria-labelledby="selection-heading">
          <div className="cfp-shell">
            <h2 id="selection-heading" className="cfp-h2">
              Selection process
            </h2>
            <ol className="cfp-steps">
              {CFP_SELECTION.map((step) => (
                <li key={step.n}>
                  <span className="n" aria-hidden="true">
                    {step.n}
                  </span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="cfp-section" aria-labelledby="stay-heading">
          <div className="cfp-shell">
            <h2 id="stay-heading" className="cfp-h2">
              Stay at IIT Bombay
            </h2>
            <p className="cfp-stay">{CFP_STAY}</p>
          </div>
        </section>

        <section
          className="cfp-section cfp-submit"
          id="submit"
          tabIndex={-1}
          aria-labelledby="submit-heading"
          data-testid="conference-submit"
        >
          <div className="cfp-shell">
            <p className="cfp-kicker">Submission form</p>
            <h2 id="submit-heading" className="cfp-h2">
              Submit your Abstract
            </h2>
            <p className="cfp-lead">
              Use the form below. Paper and poster applicants upload an extended
              abstract as a PDF (max 10 MB).
            </p>
            <div className="cfp-submit-panel">
              {/*
                FORM IFRAME SLOT
                When the question set is finalized, embed it here and replace
                or hide ConferenceForm:

                <iframe
                  title="INV.ENT conference abstract submission"
                  src="FORM_EMBED_URL"
                  className="cfp-form-frame"
                />
              */}
              {application ? (
                <div className="cfp-status">
                  <p className="cfp-kicker">Your application</p>
                  <ConferenceStatusCard
                    status={application.status}
                    participationCategory={application.participationCategory}
                    participationOther={application.participationOther}
                    paperTitle={application.paperTitle}
                    paymentStatus={application.paymentStatus}
                    paymentAmountPaise={application.paymentAmountPaise}
                    paymentToken={application.paymentToken}
                  />
                  {signedIn ? (
                    <p className="mt-4 text-sm">
                      <Link href="/dashboard" className="font-semibold">
                        Open dashboard →
                      </Link>
                    </p>
                  ) : (
                    <p className="mt-4 text-sm" style={{ color: "var(--cfp-slate)" }}>
                      <Link href="/signup" className="font-semibold">
                        Create an account
                      </Link>{" "}
                      with this email so notices and Online Pay stay on your dashboard.
                    </p>
                  )}
                </div>
              ) : (
                <ConferenceForm
                  defaultName={defaultName}
                  defaultEmail={defaultEmail}
                />
              )}
            </div>
          </div>
        </section>

        <section className="cfp-section cfp-close" aria-labelledby="close-heading">
          <div className="cfp-shell">
            <h2 id="close-heading">Connect. Collaborate. Contribute.</h2>
            <p>Submit your Abstract by 15 October 2026.</p>
            <a className="cfp-btn" href="#submit" data-testid="cfp-submit-cta-close">
              Submit your Abstract
            </a>
          </div>
        </section>
      </main>

      <footer className="cfp-footer">
        <div className="cfp-shell">
          <p className="queries">
            For any queries, write to{" "}
            <a href="mailto:conference@iitbinvent.com">
              conference@iitbinvent.com
            </a>
          </p>
          <nav aria-label="Site">
            <Link href="/about">About</Link>
            <Link href="/dsse-day">DSSE Day</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/programme">Programme</Link>
            <Link href="/travel">Travel</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/code-of-conduct">Code of conduct</Link>
          </nav>
          <p>
            Desai Sethi School of Entrepreneurship · DSSE Building · Powai,
            Mumbai 400076
          </p>
        </div>
      </footer>
    </div>
  );
}
