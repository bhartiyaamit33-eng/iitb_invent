import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { SiteShell } from "@/components/site/SiteShell";
import { LineIcon } from "@/components/site/decor";
import { getSiteChrome } from "@/lib/site-chrome";
import { submitHrefFor } from "@/lib/landing";
import {
  breadcrumbJsonLd,
  graphJsonLd,
  organizationJsonLd,
  pageMetadata,
} from "@/lib/seo";
import {
  CONFERENCE_EMAIL,
  EVENT_DATES,
  PROGRAMME_DAYS,
} from "@/lib/site-content";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Pre-conference workshops",
  description:
    "Hands-on pre-conference workshops at IITB INV.ENT on 30 January 2027: entrepreneurship education, AI for incubators, and practitioner-led sessions at IIT Bombay.",
  path: "/workshop",
});

const THEMES = [
  {
    id: "education",
    icon: "workshop" as const,
    title: "Entrepreneurship education",
    body: "For faculty and programme designers: what actually moves students from a course to a company, and how to teach it without pretending the messy parts away.",
  },
  {
    id: "ai-incubators",
    icon: "network" as const,
    title: "AI for incubators",
    body: "For incubator and accelerator teams: where AI genuinely changes screening, mentoring and portfolio support, and where it is still theatre.",
  },
  {
    id: "lab-to-market",
    icon: "chart" as const,
    title: "Lab-to-market translation",
    body: "For researchers sitting on work that could leave the building: licensing, spin-outs, first customers, and the specific places translation stalls.",
  },
  {
    id: "hands-on",
    icon: "cube" as const,
    title: "Hands-on sessions",
    body: "Small-room formats where you leave with something built rather than something noted: a teaching case, a screening rubric, a pitch narrative.",
  },
];

const RUN_A_WORKSHOP = [
  {
    n: "1",
    title: "Send a proposal",
    body: "Workshops come through the same submissions desk as papers and posters. Choose the participation category that fits and describe the session, the room format, and who it is for.",
  },
  {
    n: "2",
    title: "Review",
    body: "Proposals are read by the same panel that reviews research submissions, against the same bar: relevance, originality, and whether a delegate leaves better off.",
  },
  {
    n: "3",
    title: "Scheduling",
    body: "Accepted workshops are scheduled on 30 January and published on the programme page with seat limits, so delegates can plan the pre-conference day.",
  },
];

export default async function WorkshopPage() {
  const { signedInName } = await getSiteChrome();
  const submitHref = submitHrefFor(Boolean(signedInName));
  const preConference = PROGRAMME_DAYS[0];

  return (
    <SiteShell crumbs={[{ href: "/workshop", label: "Workshop" }]}>
      <JsonLd
        data={graphJsonLd(
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Workshop", path: "/workshop" },
          ]),
        )}
      />

      <PageHero
        kicker="Pre-conference · 30 January"
        title="Workshops."
        lede="The day before the conference is hands-on. Small rooms, practitioner-led, on entrepreneurship education, AI for incubators and lab-to-market translation."
        meta={[
          "Pre-conference day · 30 January 2027",
          `Conference · ${EVENT_DATES}`,
          "Venue · IIT Bombay",
        ]}
      >
        <div className="cta-row" style={{ justifyContent: "flex-start" }}>
          <Link className="site-btn" href={submitHref} data-testid="workshop-submit-cta">
            Propose a workshop →
          </Link>
          <Link className="site-btn site-btn-ghost" href="/programme">
            See the programme
          </Link>
        </div>
      </PageHero>

      <section className="site-section is-tight" aria-labelledby="themes-heading">
        <div className="site-shell">
          <p className="site-kicker is-blue">Themes</p>
          <h2 id="themes-heading">What the day covers</h2>
          <p className="lead">
            Themes for 2027. Individual sessions, facilitators and seat counts are
            published on the programme page as each workshop is confirmed.
          </p>
          <div className="room-grid" data-testid="workshop-themes">
            {THEMES.map((theme) => (
              <div className="room-item" key={theme.id}>
                <LineIcon name={theme.icon} />
                <p>
                  <strong style={{ fontWeight: 500 }}>{theme.title}</strong>
                </p>
                <p style={{ color: "var(--mute)", fontSize: 13, marginTop: 6 }}>
                  {theme.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="site-section is-rule" aria-labelledby="day-heading">
        <div className="site-shell">
          <p className="site-kicker">{preConference.date} · 2027</p>
          <h2 id="day-heading">The pre-conference day</h2>
          <div className="days-grid">
            <article className="day-col">
              <p className="site-kicker is-blue">{preConference.kicker}</p>
              <p className="date">{preConference.date}</p>
              <h3>{preConference.title}</h3>
              <p className="lead">{preConference.lead}</p>
              <ul>
                {preConference.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="day-col">
              <p className="site-kicker is-blue">Who it is for</p>
              <p className="date">Rooms</p>
              <h3>Small by design</h3>
              <p className="lead">
                Workshops are capped so the room can actually work. Seats are released to
                delegates who have been selected and have paid the registration fee for
                their category; RSVP opens on the programme page.
              </p>
              <ul>
                <li>Faculty and programme designers</li>
                <li>Incubator and accelerator teams</li>
                <li>Researchers heading for a spin-out</li>
                <li>Founders and operators</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="site-section is-rule" aria-labelledby="propose-heading">
        <div className="site-shell">
          <p className="site-kicker is-green">Run one</p>
          <h2 id="propose-heading">Proposing a workshop</h2>
          <p className="lead">
            Workshops are accepted through the submissions desk on the Research page, not
            a separate form. That keeps one review panel and one timeline across papers,
            posters and workshops.
          </p>
          <ol className="site-steps">
            {RUN_A_WORKSHOP.map((step) => (
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
          <div className="site-callout is-blue">
            Questions about a workshop proposal before you send it? Write to{" "}
            <a href={`mailto:${CONFERENCE_EMAIL}`} style={{ color: "var(--blue)" }}>
              {CONFERENCE_EMAIL}
            </a>
            .
          </div>
          <div className="cta-row" style={{ justifyContent: "flex-start" }}>
            <Link className="site-btn" href={submitHref}>
              Go to the submissions desk →
            </Link>
            <Link className="site-btn site-btn-ghost" href="/research">
              Read the call for papers
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
