import Link from "next/link";
import { ApplicationPanel, type ResearchApplication } from "./ApplicationPanel";
import { KeyDates } from "@/components/site/KeyDates";
import { PageHero } from "@/components/site/PageHero";
import { LineIcon, type LineIconName } from "@/components/site/decor";
import {
  CFP_AI_CALLOUT,
  CFP_APPLICANTS,
  CFP_GUIDELINE_POINTS,
  CFP_OVERVIEW,
  CFP_RESEARCH_AREAS,
  CFP_SELECTION,
} from "@/lib/conference-cfp";
import {
  CONFERENCE_FEE_PAISE,
  GST_PERCENT,
  feeBandLabel,
  formatInrFromPaise,
  gstPaise,
  withGstPaise,
  type ConferenceFeeBand,
} from "@/lib/conference";
import {
  ABSTRACT_DEADLINE_LONG,
  SUBMIT_HREF,
  submitHrefFor,
  type TimelineItem,
} from "@/lib/landing";
import {
  ACCOMMODATION_INTRO,
  CONFERENCE_EMAIL,
  EVENT_DATES,
  RESEARCH_HIGHLIGHTS,
  RESEARCH_TRACKS,
  TRAVEL_GRANT,
} from "@/lib/site-content";

const TRACK_ICONS: Record<string, LineIconName> = {
  paper: "paper",
  poster: "poster",
  workshop: "workshop",
};

const APPLICANT_ICONS: LineIconName[] = ["paper", "journal", "person"];
const HIGHLIGHT_ICONS: LineIconName[] = ["award", "journal", "network", "workshop"];
const FEE_BANDS: ConferenceFeeBand[] = ["student", "faculty", "industry"];

export function ResearchCall({
  application,
  signedIn,
  timeline,
}: {
  application: ResearchApplication | null;
  signedIn: boolean;
  timeline: TimelineItem[];
}) {
  const submitHref = submitHrefFor(signedIn);

  return (
    <>
      <PageHero
        kicker="Call for papers"
        title="Research at INV.ENT"
        lede="Research paper presentations, poster presentations, and pre-conference workshops — everything you need to take part, in one place."
        meta={[
          `Conference · ${EVENT_DATES}`,
          "Venue · IIT Bombay, Mumbai",
          `Abstract deadline · ${ABSTRACT_DEADLINE_LONG} (midnight)`,
        ]}
      >
        <div className="cta-row" style={{ justifyContent: "flex-start" }}>
          <Link className="site-btn" href={submitHref} data-testid="hero-submit-cta">
            Complete registration →
          </Link>
          <a className="site-btn site-btn-ghost" href="#tracks">
            See the tracks
          </a>
        </div>
      </PageHero>

      <section
        className="site-section is-tight"
        aria-labelledby="highlights-heading"
        data-testid="research-highlights"
      >
        <div className="site-shell">
          <h2 id="highlights-heading">
            Present your research.
            <br />
            Submit the best of it.
          </h2>
          <div className="room-grid">
            {RESEARCH_HIGHLIGHTS.map((item, i) => (
              <div className="room-item" key={item.id}>
                <LineIcon name={HIGHLIGHT_ICONS[i] ?? "paper"} />
                <p>
                  <strong style={{ fontWeight: 500 }}>{item.title}</strong>
                </p>
                <p style={{ color: "var(--mute)", fontSize: 13, marginTop: 6 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Overview ─────────────────────────────────────────────────── */}
      <section className="site-section is-tight" aria-labelledby="overview-heading">
        <div className="site-shell">
          <h2 id="overview-heading" className="sr-only">
            Conference overview
          </h2>
          <p className="lead" style={{ maxWidth: "72ch", fontSize: 18 }}>
            {CFP_OVERVIEW}
          </p>
        </div>
      </section>

      {/* ── Tracks ───────────────────────────────────────────────────── */}
      <section
        className="site-section is-rule"
        id="tracks"
        aria-labelledby="tracks-heading"
        data-testid="research-tracks"
      >
        <div className="site-shell">
          <p className="site-kicker is-blue">Three ways to take part</p>
          <h2 id="tracks-heading">
            Papers, posters,
            <br />
            and workshops.
          </h2>
          <div className="track-grid">
            {RESEARCH_TRACKS.map((track) => (
              <article className="track-card" key={track.id} id={track.id}>
                <LineIcon name={TRACK_ICONS[track.id] ?? "paper"} />
                <p
                  className="site-kicker"
                  style={{ marginTop: 14, marginBottom: 0, color: "var(--mute)" }}
                >
                  {track.kicker}
                </p>
                <h3>{track.title}</h3>
                <p>{track.body}</p>
                <ul>
                  {track.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className="lead" style={{ marginTop: 32 }}>
            On a broad range of innovation and entrepreneurship research themes. Case
            studies may be submitted as papers.
          </p>
        </div>
      </section>

      {/* ── Who can apply ────────────────────────────────────────────── */}
      <section className="site-section is-rule" aria-labelledby="who-heading">
        <div className="site-shell">
          <p className="site-kicker">Eligibility</p>
          <h2 id="who-heading">Who can apply</h2>
          <div className="room-grid" data-testid="research-applicants">
            {CFP_APPLICANTS.map((person, i) => (
              <div className="room-item" key={person.id}>
                <LineIcon name={APPLICANT_ICONS[i] ?? "person"} />
                <p>{person.label}</p>
              </div>
            ))}
            <div className="room-item">
              <LineIcon name="network" />
              <p>Attendees, without a submission</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key dates ────────────────────────────────────────────────── */}
      <section className="site-section is-rule" id="dates" aria-labelledby="dates-heading">
        <div className="site-shell">
          <p className="site-kicker">Timeline</p>
          <h2 id="dates-heading">Key dates</h2>
          <KeyDates items={timeline} />
        </div>
      </section>

      {/* ── Guidelines ───────────────────────────────────────────────── */}
      <section
        className="site-section is-rule"
        id="guidelines"
        aria-labelledby="guidelines-heading"
      >
        <div className="site-shell">
          <p className="site-kicker">Submission guidelines</p>
          <h2 id="guidelines-heading">What to send</h2>
          <p className="lead">Extended abstract, up to 1,500 words, covering:</p>
          <ul className="theme-list" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
            {CFP_GUIDELINE_POINTS.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <div className="site-callout" data-testid="ai-callout">
            {CFP_AI_CALLOUT}
          </div>
        </div>
      </section>

      {/* ── Research areas ───────────────────────────────────────────── */}
      <section className="site-section is-rule" aria-labelledby="areas-heading">
        <div className="site-shell">
          <p className="site-kicker">Scope</p>
          <h2 id="areas-heading">Suggested research areas</h2>
          <ul className="site-chips">
            {CFP_RESEARCH_AREAS.map((area) => (
              <li className="site-chip" key={area}>
                {area}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Selection + fees ─────────────────────────────────────────── */}
      <section
        className="site-section is-rule"
        id="selection"
        aria-labelledby="selection-heading"
      >
        <div className="site-shell">
          <p className="site-kicker">Review</p>
          <h2 id="selection-heading">Selection process</h2>
          <ol className="site-steps">
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

          <h3 style={{ marginTop: 56 }}>Registration fee</h3>
          <p className="lead">
            After organisers select you for a paper, a poster, or as an attendee, you
            receive the registration fee for your category and a personal IIT Bombay
            Online Pay link. The amount is the same whether you present or attend.
            These fees are exclusive of GST; {GST_PERCENT}% GST is added when you pay.
          </p>
          <table className="site-table" data-testid="conference-fee-bands">
            <thead>
              <tr>
                <th scope="col">Category</th>
                <th scope="col">Subtotal</th>
                <th scope="col">GST ({GST_PERCENT}%)</th>
                <th scope="col">Total</th>
              </tr>
            </thead>
            <tbody>
              {FEE_BANDS.map((band) => (
                <tr key={band}>
                  <td>{feeBandLabel(band)}</td>
                  <td>{formatInrFromPaise(CONFERENCE_FEE_PAISE[band])}</td>
                  <td>{formatInrFromPaise(gstPaise(CONFERENCE_FEE_PAISE[band]))}</td>
                  <td>{formatInrFromPaise(withGstPaise(CONFERENCE_FEE_PAISE[band]))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Stay ─────────────────────────────────────────────────────── */}
      <section className="site-section is-rule" aria-labelledby="stay-heading">
        <div className="site-shell">
          <p className="site-kicker">Before you travel</p>
          <h2 id="stay-heading">Stay at IIT Bombay</h2>
          <p className="lead">{ACCOMMODATION_INTRO}</p>
          <p className="lead">
            Eligible full-time PhD and FPM scholars can also apply to the{" "}
            {TRAVEL_GRANT.name} for up to {TRAVEL_GRANT.amount} toward presenting.
            The grant is reviewed separately from conference acceptance.
          </p>
          <div className="cta-row" style={{ justifyContent: "flex-start" }}>
            <Link className="site-btn site-btn-ghost" href="/accommodation">
              Accommodation →
            </Link>
            <Link className="site-btn site-btn-ghost" href="/travel">
              Getting to campus
            </Link>
            <Link className="site-btn site-btn-ghost" href="/travel#grant">
              Travel grant
            </Link>
          </div>
        </div>
      </section>

      {/* ── Submission desk ─────────────────────────────────────────── */}
      <section
        className="site-section is-rule"
        id="submit"
        tabIndex={-1}
        aria-labelledby="submit-heading"
        data-testid="conference-submit"
      >
        <div className="site-shell">
          <p className="site-kicker is-blue">Registration</p>
          <h2 id="submit-heading">Complete registration</h2>
          <p className="lead">
            A few short steps, tied to your account. Attendees pay when they register and
            receive a proforma invoice by email. Paper, poster and other presenters add an
            extended abstract (PDF, max 10 MB) and pay once organisers shortlist it.
          </p>

          {application ? (
            <ApplicationPanel application={application} signedIn={signedIn} />
          ) : (
            <div className="site-panel" data-testid="submit-login-gate">
              <p className="lead">
                {signedIn
                  ? "Register as an attendee or presenter in a few short steps."
                  : "Log in to complete your registration as an attendee or presenter. Creating an account is not a ticket to the event."}
              </p>
              <div className="cta-row" style={{ justifyContent: "flex-start" }}>
                <Link className="site-btn" href={submitHref} data-testid="submit-login-cta">
                  {signedIn ? "Complete registration →" : "Log in to register →"}
                </Link>
                {signedIn ? null : (
                  <Link
                    className="site-btn site-btn-ghost"
                    href={`/signup?callbackUrl=${encodeURIComponent(SUBMIT_HREF)}`}
                  >
                    Create an account
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Close ────────────────────────────────────────────────────── */}
      <section className="site-section is-blue" aria-labelledby="close-heading">
        <div className="site-shell" style={{ position: "relative" }}>
          <h2 id="close-heading">
            Connect. Collaborate.
            <br />
            Contribute.
          </h2>
          <p className="lead">
            Abstracts are due by {ABSTRACT_DEADLINE_LONG} (midnight). For any queries, write to{" "}
            <a href={`mailto:${CONFERENCE_EMAIL}`} style={{ color: "#fff" }}>
              {CONFERENCE_EMAIL}
            </a>
            .
          </p>
          <div className="cta-row">
            <Link
              className="site-btn site-btn-white"
              href={submitHref}
              data-testid="cfp-submit-cta"
            >
              Complete registration →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
