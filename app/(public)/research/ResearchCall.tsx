import Link from "next/link";
import { ApplicationPanel, type ResearchApplication } from "./ApplicationPanel";
import { SubmissionForm } from "./SubmissionForm";
import { KeyDates } from "@/components/site/KeyDates";
import { PageHero } from "@/components/site/PageHero";
import { ScrollToId } from "@/components/ScrollToId";
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
  feeBandLabel,
  formatInrFromPaise,
  type ConferenceFeeBand,
} from "@/lib/conference";
import { submitHrefFor, type TimelineItem } from "@/lib/landing";
import {
  ACCOMMODATION_INTRO,
  CONFERENCE_EMAIL,
  EVENT_DATES,
  PARTNER_JOURNALS,
  PARTNER_JOURNALS_NOTE,
  PARTNER_JOURNALS_PROMISE,
  RESEARCH_TRACKS,
} from "@/lib/site-content";

const TRACK_ICONS: Record<string, LineIconName> = {
  paper: "paper",
  poster: "poster",
  workshop: "workshop",
};

const APPLICANT_ICONS: LineIconName[] = ["paper", "journal", "person"];
const FEE_BANDS: ConferenceFeeBand[] = ["student", "faculty", "industry"];

function errorMessage(error: string) {
  if (error === "not_found") return "That submission was not found.";
  if (error === "missing") return "Missing application.";
  return error;
}

export function ResearchCall({
  application,
  defaultName,
  defaultEmail,
  signedIn,
  deleted,
  error,
  timeline,
}: {
  application: ResearchApplication | null;
  defaultName: string;
  defaultEmail: string;
  signedIn: boolean;
  deleted?: boolean;
  error?: string;
  timeline: TimelineItem[];
}) {
  const submitHref = submitHrefFor(signedIn);

  return (
    <>
      <PageHero
        kicker="Call for papers"
        title="Research at INV.ENT"
        lede="Research paper presentations, poster presentations, and pre-conference workshops — everything you need to take part, in one place. The strongest submissions are forwarded to our partner journals."
        meta={[
          `Conference · ${EVENT_DATES}`,
          "Venue · IIT Bombay, Mumbai",
          "Abstract deadline · 15 October 2026",
        ]}
      >
        <div className="cta-row" style={{ justifyContent: "flex-start" }}>
          <Link className="site-btn" href={submitHref} data-testid="hero-submit-cta">
            Submit your abstract →
          </Link>
          <a className="site-btn site-btn-ghost" href="#tracks">
            See the tracks
          </a>
        </div>
      </PageHero>

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

      {/* ── Partner journals ─────────────────────────────────────────── */}
      <section
        className="site-section is-rule"
        id="journals"
        aria-labelledby="journals-heading"
        data-testid="research-journals"
      >
        <div className="site-shell">
          <p className="site-kicker is-green">Beyond the conference</p>
          <h2 id="journals-heading">
            Publish with
            <br />
            our partner journals.
          </h2>
          <p className="lead" style={{ maxWidth: "68ch", fontSize: 18 }}>
            {PARTNER_JOURNALS_PROMISE}
          </p>
          {PARTNER_JOURNALS.length > 0 ? (
            <ul className="journal-list">
              {PARTNER_JOURNALS.map((journal) => (
                <li key={journal.id}>
                  <b>{journal.name}</b>
                  <span>{journal.note}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="coming-card" style={{ borderTop: "1px solid var(--rule)", marginTop: 28 }}>
              Partner journal titles — announced with the acceptance list
            </p>
          )}
          <div className="site-callout">{PARTNER_JOURNALS_NOTE}</div>
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
          </p>
          <table className="site-table" data-testid="conference-fee-bands">
            <thead>
              <tr>
                <th scope="col">Category</th>
                <th scope="col">Registration fee</th>
              </tr>
            </thead>
            <tbody>
              {FEE_BANDS.map((band) => (
                <tr key={band}>
                  <td>{feeBandLabel(band)}</td>
                  <td>{formatInrFromPaise(CONFERENCE_FEE_PAISE[band])}</td>
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
          <div className="cta-row" style={{ justifyContent: "flex-start" }}>
            <Link className="site-btn site-btn-ghost" href="/accommodation">
              Accommodation →
            </Link>
            <Link className="site-btn site-btn-ghost" href="/travel">
              Getting to campus
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
          <p className="site-kicker is-blue">Submission form</p>
          <h2 id="submit-heading">Submit your abstract</h2>
          <p className="lead">
            Log in first so the application is tied to your account. Paper and poster
            applicants upload an extended abstract as a PDF (max 10 MB). Attendees use the
            same form and leave the upload empty.
          </p>

          {deleted || error ? <ScrollToId id="submit" /> : null}
          {deleted ? (
            <p className="site-alert is-ok" role="status" data-testid="application-deleted">
              Submission deleted. You can submit a new abstract below. The submitted time
              will be now.
            </p>
          ) : null}
          {error === "confirm" ? (
            <p className="site-alert is-error" role="alert">
              Type DELETE in the confirm field to remove this submission.
            </p>
          ) : null}
          {error && error !== "confirm" ? (
            <p className="site-alert is-error" role="alert">
              {errorMessage(error)}
            </p>
          ) : null}

          {application ? (
            <ApplicationPanel application={application} signedIn={signedIn} />
          ) : signedIn ? (
            <SubmissionForm defaultName={defaultName} defaultEmail={defaultEmail} />
          ) : (
            <div className="site-panel" data-testid="submit-login-gate">
              <p className="lead">
                Log in to submit your paper or poster abstract, or to register as an
                attendee. Creating an account is not a ticket to the event.
              </p>
              <div className="cta-row" style={{ justifyContent: "flex-start" }}>
                <Link
                  className="site-btn"
                  href={submitHref}
                  data-testid="submit-login-cta"
                >
                  Log in to submit →
                </Link>
                <Link
                  className="site-btn site-btn-ghost"
                  href={`/signup?callbackUrl=${encodeURIComponent("/research#submit")}`}
                >
                  Create an account
                </Link>
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
            Submit your abstract by 15 October 2026. For any queries, write to{" "}
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
              Submit your abstract →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
