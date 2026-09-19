import Image from "next/image";
import Link from "next/link";
import {
  Fraunces,
  Inter,
  Playfair_Display,
  Plus_Jakarta_Sans,
  Pridi,
  Roboto,
} from "next/font/google";
import { ConferenceForm } from "./ConferenceForm";
import { ConferenceStatusCard } from "@/components/conference/ConferenceStatusCard";
import { DeleteMyApplicationForm } from "@/components/conference/DeleteMyApplicationForm";
import { CfpDecor } from "@/components/conference/CfpDecor";
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
import { SUBMIT_HREF, submitHrefFor } from "@/lib/landing";
import { ScrollToId } from "@/components/ScrollToId";
import "./cfp.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-fraunces",
  display: "swap",
});

const pridi = Pridi({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-pridi",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-jakarta",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export type ConferenceCallApplication = {
  id: string;
  name: string;
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
  deleted,
  error,
}: {
  application: ConferenceCallApplication | null;
  defaultName: string;
  defaultEmail: string;
  signedIn: boolean;
  deleted?: boolean;
  error?: string;
}) {
  return (
    <div
      className={`cfp ${inter.variable} ${playfair.variable} ${fraunces.variable} ${pridi.variable} ${jakarta.variable} ${roboto.variable}`}
    >
      <CfpTheme />
      <CfpDecor />
      <a href="#main" className="cfp-skip">
        Skip to content
      </a>

      <header className="cfp-hero" data-testid="conference-hero">
        <div className="cfp-shell cfp-hero-inner">
          <div className="cfp-hero-chrome">
            <Link
              className="cfp-logo-dsse"
              href="https://www.dsse.iitb.ac.in/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Desai Sethi School of Entrepreneurship"
            >
              <Image
                src="/assets/cfp/dsse-wordmark.png"
                alt="Desai Sethi School of Entrepreneurship"
                width={1477}
                height={254}
                sizes="(max-width: 860px) 72vw, 503px"
                priority
              />
            </Link>
            <nav
              className="cfp-nav"
              aria-label="Primary"
              data-testid="nav"
            >
              <Link
                className="cfp-nav-submit"
                href={signedIn ? SUBMIT_HREF : submitHrefFor(false)}
                data-testid="nav-submit"
              >
                Submit your Abstract
              </Link>
              <Link
                className="cfp-nav-login"
                href={signedIn ? "/dashboard" : "/login"}
              >
                {signedIn ? "Dashboard" : "Login"}
              </Link>
            </nav>
            <Link
              className="cfp-logo-iitb"
              href="https://www.iitb.ac.in/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Indian Institute of Technology Bombay"
            >
              <Image
                src="/assets/cfp/iitb-seal.png"
                alt="IIT Bombay"
                width={1296}
                height={1265}
                sizes="(max-width: 640px) 64px, 152px"
                priority
              />
            </Link>
          </div>

          <div className="cfp-hero-mark">
            <div className="cfp-lockup-block">
              <p className="cfp-iitb" data-testid="cfp-iitb">
                IIT BOMBAY
              </p>
              <div
                className="cfp-lockup"
                data-testid="brand-mark"
                aria-label="INV.ENT: Innovation and Entrepreneurship"
              >
                <div className="half">
                  <span className="word inv">INV</span>
                  <span className="mean">Innovation</span>
                </div>
                <span className="dot" aria-hidden="true">
                  .
                </span>
                <div className="half">
                  <span className="word ent">ENT</span>
                  <span className="mean">Entrepreneurship</span>
                </div>
              </div>
              <p className="cfp-conference-title">
                <span className="practice">
                  Entrepreneurship Research
                  <br />
                  and Venture Practice
                </span>{" "}
                <span className="conf">Conference</span>
              </p>
            </div>
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
            <p className="cfp-lead">{CFP_OVERVIEW}</p>
          </div>
        </section>

        <section className="cfp-section cfp-split-section" aria-label="Call for papers and who can apply">
          <div className="cfp-shell cfp-split">
            <section className="cfp-cfp-col" aria-labelledby="cfp-heading">
              <p className="cfp-kicker is-display">Call for</p>
              <h2 id="cfp-heading" className="cfp-display">
                Papers
              </h2>
              <div className="cfp-tracks">
                {CFP_TRACKS.map((track) => (
                  <div className="cfp-track" key={track.id}>
                    <span className="cfp-icon">
                      <img src={track.icon} alt="" width={44} height={44} />
                    </span>
                    <span>{track.label}</span>
                  </div>
                ))}
              </div>
              <p className="cfp-note">
                On a broad range of Innovation &amp; Entrepreneurship Research
                themes
              </p>
            </section>

            <section className="cfp-who-col" aria-labelledby="who-heading">
              <h2 id="who-heading" className="cfp-h2">
                Who can apply
              </h2>
              <div className="cfp-people">
                {CFP_APPLICANTS.map((person) => (
                  <article className="cfp-person" key={person.id}>
                    <span className="cfp-icon">
                      <img src={person.icon} alt="" width={40} height={40} />
                    </span>
                    <p>{person.label}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>

        <section className="cfp-section" aria-labelledby="dates-heading">
          <div className="cfp-shell">
            <h2 id="dates-heading" className="cfp-h2">
              Key dates and highlights
            </h2>
            <ol className="cfp-timeline" aria-label="Key dates">
              {CFP_TIMELINE.map((item) => (
                <li key={item.id}>
                  <span className="kicker">{item.kicker}</span>
                  <span className="date">{item.date}</span>
                  <span className="node" aria-hidden="true" />
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="cfp-section" aria-labelledby="guidelines-heading">
          <div className="cfp-shell">
            <h2 id="guidelines-heading" className="cfp-h2">
              Submission guidelines
            </h2>
            <p className="cfp-lead cfp-lead-tight">
              Extended abstract, up to 1,500 words, covering:
            </p>
            <div className="cfp-guide-grid">
              <ul className="cfp-guidelines">
                {CFP_GUIDELINE_POINTS.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <aside className="cfp-callout" role="note">
                {CFP_AI_CALLOUT}
              </aside>
            </div>
          </div>
        </section>

        <section className="cfp-section" aria-labelledby="areas-heading">
          <div className="cfp-shell">
            <h2 id="areas-heading" className="cfp-h2 is-center">
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
            <p className="cfp-lead cfp-lead-tight" style={{ marginTop: "1.5rem" }}>
              After organisers select you for a paper, a poster, or as an
              attendee, you receive the registration fee for your category and a
              personal IIT Bombay Online Pay link. The amount is the same
              whether you present or attend:
            </p>
            <ul
              className="cfp-guidelines"
              data-testid="conference-fee-bands"
              style={{ marginTop: "0.75rem" }}
            >
              <li>Students / research scholars: ₹5,000</li>
              <li>Faculty / professors: ₹10,000</li>
              <li>Corporate / industry: ₹20,000</li>
            </ul>
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
              Log in first so the application is tied to your account. Paper and
              poster applicants upload an extended abstract as a PDF (max 10 MB).
            </p>
            <div className="cfp-submit-panel">
              {deleted || error ? <ScrollToId id="submit" /> : null}
              {deleted ? (
                <p
                  className="mb-4 rounded-md border border-teal/30 bg-teal/5 px-4 py-3 text-sm"
                  role="status"
                  data-testid="application-deleted"
                >
                  Submission deleted. You can submit a new abstract below. The
                  submitted time will be now.
                </p>
              ) : null}
              {error === "confirm" ? (
                <p
                  className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
                  role="alert"
                >
                  Type DELETE in the confirm field to remove this submission.
                </p>
              ) : null}
              {error && error !== "confirm" ? (
                <p
                  className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                  role="alert"
                >
                  {error === "not_found"
                    ? "That submission was not found."
                    : error === "missing"
                      ? "Missing application."
                      : error}
                </p>
              ) : null}
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
                    <>
                      <DeleteMyApplicationForm
                        id={application.id}
                        name={application.name}
                      />
                      <p className="mt-4 text-sm">
                        <Link href="/dashboard" className="font-semibold">
                          Open dashboard →
                        </Link>
                      </p>
                    </>
                  ) : null}
                </div>
              ) : signedIn ? (
                <ConferenceForm
                  defaultName={defaultName}
                  defaultEmail={defaultEmail}
                />
              ) : (
                <div
                  className="cfp-status"
                  data-testid="submit-login-gate"
                >
                  <p className="cfp-lead">
                    Log in to submit your paper or poster abstract. Creating an
                    account is not a ticket to the event.
                  </p>
                  <p className="mt-4">
                    <Link
                      href={submitHrefFor(false)}
                      className="cfp-nav-submit"
                      data-testid="submit-login-cta"
                    >
                      Log in to submit
                    </Link>
                  </p>
                  <p className="mt-3 text-sm" style={{ color: "var(--cfp-slate)" }}>
                    No account yet?{" "}
                    <Link
                      href={`/signup?callbackUrl=${encodeURIComponent("/conference#submit")}`}
                      className="font-semibold"
                    >
                      Create one
                    </Link>
                    , then fill the form.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="cfp-section cfp-close" aria-labelledby="close-heading">
          <div className="cfp-shell">
            <h2 id="close-heading">Connect. Collaborate. Contribute.</h2>
            <p>
              <a href={signedIn ? SUBMIT_HREF : submitHrefFor(false)} data-testid="cfp-submit-cta">
                Submit your Abstract by 15 October 2026.
              </a>
            </p>
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
            <Link href="/">Home</Link>
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
