import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { SiteShell } from "@/components/site/SiteShell";
import { prisma } from "@/lib/db";
import {
  breadcrumbJsonLd,
  graphJsonLd,
  organizationJsonLd,
  pageMetadata,
} from "@/lib/seo";
import {
  EVENT_DATES,
  PAST_SPEAKERS,
  SUPPORT_EMAIL,
} from "@/lib/site-content";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Speakers",
  description:
    "Stage speakers from DSSE Day 2026, and the IITB INV.ENT 2027 line-up as names are confirmed. 30-31 January at IIT Bombay.",
  path: "/speakers",
});

export default async function SpeakersPage() {
  let speakers: {
    id: string;
    name: string;
    title: string | null;
    organisation: string | null;
    photoUrl: string | null;
    isKeynote: boolean;
  }[] = [];

  try {
    const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
    // Names stay hidden until organisers publish the line-up, so a line-up
    // carried over from a previous edition is never shown as this year's.
    if (edition?.speakersPublished) {
      speakers = await prisma.speaker.findMany({
        where: { editionId: edition.id, isPublished: true, deletedAt: null },
        orderBy: [{ isKeynote: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          title: true,
          organisation: true,
          photoUrl: true,
          isKeynote: true,
        },
      });
    }
  } catch {
    // The page must still render if the database is unreachable.
  }

  const keynotes = speakers.filter((s) => s.isKeynote);
  const rest = speakers.filter((s) => !s.isKeynote);

  return (
    <SiteShell crumbs={[{ href: "/speakers", label: "Speakers" }]}>
      <JsonLd
        data={graphJsonLd(
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Speakers", path: "/speakers" },
          ]),
        )}
      />

      <PageHero
        kicker="Line-up"
        title="Speakers."
        lede="Researchers, founders, investors and operators on the same stage — because the point of the two days is that both halves of the room are present."
        meta={[`Conference · ${EVENT_DATES}`, "Venue · IIT Bombay"]}
      />

      <section className="site-section is-tight" aria-labelledby="past-heading">
        <div className="site-shell">
          <p className="site-kicker">DSSE Day 2026</p>
          <h2 id="past-heading">Past speakers</h2>
          <p className="lead">
            The stage at the Entrepreneurship Research Symposium and DSSE Day, 31 January
            2026.
          </p>
          <ul className="team-grid" data-testid="past-speakers">
            {PAST_SPEAKERS.map((speaker) => (
              <li key={speaker.name}>
                <article className="team-card" data-testid="past-speaker-card">
                  <div className="team-photo">
                    <Image
                      src={speaker.photo}
                      alt=""
                      fill
                      sizes="(max-width: 900px) 50vw, 360px"
                      className="team-portrait"
                      style={{ objectPosition: speaker.focus }}
                    />
                  </div>
                  <h3>{speaker.name}</h3>
                  <p>
                    {[speaker.title, speaker.organisation].filter(Boolean).join(" · ")}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {keynotes.length > 0 ? (
        <section className="site-section is-rule" aria-labelledby="keynote-heading">
          <div className="site-shell">
            <p className="site-kicker is-blue">Keynotes</p>
            <h2 id="keynote-heading">Keynote speakers</h2>
            <div className="speaker-grid" data-testid="keynote-speakers">
              {keynotes.map((speaker) => (
                <article className="speaker-card" key={speaker.id}>
                  {speaker.photoUrl ? (
                    <Image
                      className="speaker-photo"
                      src={speaker.photoUrl}
                      alt={speaker.name}
                      width={144}
                      height={144}
                    />
                  ) : null}
                  <strong>{speaker.name}</strong>
                  <span>
                    {[speaker.title, speaker.organisation].filter(Boolean).join(" · ")}
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="site-section is-rule" aria-labelledby="lineup-heading">
        <div className="site-shell">
          <p className="site-kicker">2027 line-up</p>
          <h2 id="lineup-heading">Confirmed speakers</h2>
          {rest.length > 0 ? (
            <div className="speaker-grid" data-testid="speaker-list">
              {rest.map((speaker) => (
                <article className="speaker-card" key={speaker.id}>
                  {speaker.photoUrl ? (
                    <Image
                      className="speaker-photo"
                      src={speaker.photoUrl}
                      alt={speaker.name}
                      width={144}
                      height={144}
                    />
                  ) : null}
                  <strong>{speaker.name}</strong>
                  <span>
                    {[speaker.title, speaker.organisation].filter(Boolean).join(" · ")}
                  </span>
                </article>
              ))}
            </div>
          ) : (
            <>
              <p className="lead">
                Names are published here as they are confirmed. The programme page carries
                every session as it is scheduled.
              </p>
              <p className="coming-card" data-testid="speakers-coming-soon">
                Coming soon
              </p>
            </>
          )}
          <div className="cta-row" style={{ justifyContent: "flex-start" }}>
            <Link className="site-btn site-btn-ghost" href="/programme">
              Full programme →
            </Link>
          </div>
        </div>
      </section>

      <section className="site-section is-blue" aria-labelledby="speak-heading">
        <div className="site-shell" style={{ position: "relative" }}>
          <h2 id="speak-heading">
            Want to speak,
            <br />
            or suggest someone?
          </h2>
          <p className="lead">
            We are still shaping the panels. Tell us who should be on stage and why, and
            write in early — slots close well before January.
          </p>
          <div className="cta-row">
            <a className="site-btn site-btn-white" href={`mailto:${SUPPORT_EMAIL}`}>
              Write to us →
            </a>
            <Link className="site-btn site-btn-white" href="/contact">
              Contact
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
