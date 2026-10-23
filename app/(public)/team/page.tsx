import Image from "next/image";
import { StudentsSection } from "@/components/StudentsSection";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { SitePhoto } from "@/components/site/SitePhoto";
import { SiteShell } from "@/components/site/SiteShell";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  graphJsonLd,
  organizationJsonLd,
  pageMetadata,
} from "@/lib/seo";
import {
  EVENT_DATES,
  ORGANIZING_COMMITTEE,
  ORGANIZING_MEMBERS,
  TECHNICAL_COMMITTEE,
  type CommitteeMember,
} from "@/lib/site-content";

export const metadata = pageMetadata({
  title: "Team",
  description:
    "The organising committee, technical committee, organising members and DSSE team behind IITB INV.ENT at the Desai Sethi School of Entrepreneurship, IIT Bombay.",
  path: "/team",
});

function initials(name: string): string {
  const words = name
    .replace(/^Prof\.\s*/i, "")
    .split(/\s+/)
    .filter(Boolean);
  const letters = words.slice(0, 2).map((word) => word[0] ?? "");
  return letters.join("").toUpperCase();
}

function CommitteeList({
  members,
  testId,
}: {
  members: readonly CommitteeMember[];
  testId: string;
}) {
  return (
    <ul className="team-grid" data-testid={testId}>
      {members.map((member) => (
        <li key={member.name}>
          <article className="team-card" data-testid="committee-card">
            <div className="team-photo">
              {member.photo ? (
                <Image
                  src={member.photo}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 46vw, (max-width: 900px) 30vw, 18vw"
                  className="team-portrait"
                  style={{ objectPosition: member.focus }}
                />
              ) : (
                <span className="team-initials" aria-hidden="true">
                  {initials(member.name)}
                </span>
              )}
            </div>
            <h3>{member.name}</h3>
            <p>{member.role}</p>
          </article>
        </li>
      ))}
    </ul>
  );
}

export default function TeamPage() {
  return (
    <SiteShell crumbs={[{ href: "/team", label: "Team" }]}>
      <JsonLd
        data={graphJsonLd(
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Team", path: "/team" },
          ]),
          {
            "@type": "AboutPage",
            name: "IITB INV.ENT team",
            url: absoluteUrl("/team"),
          },
        )}
      />

      <PageHero
        kicker="People"
        title="The Team."
        lede="IITB INV.ENT is organised by the Desai Sethi School of Entrepreneurship at IIT Bombay."
        meta={[`Conference · ${EVENT_DATES}`, "Venue · IIT Bombay"]}
      />

      <section className="site-section is-tight" aria-labelledby="committee-heading">
        <div className="site-shell">
          <p className="site-kicker">IIT Bombay · DSSE</p>
          <h2 id="committee-heading">Organising committee</h2>
          <CommitteeList members={ORGANIZING_COMMITTEE} testId="organizing-committee" />
        </div>
      </section>

      <section className="site-section is-rule" aria-labelledby="technical-committee-heading">
        <div className="site-shell">
          <h2 id="technical-committee-heading">Technical committee</h2>
          <CommitteeList members={TECHNICAL_COMMITTEE} testId="technical-committee" />
        </div>
      </section>

      <section className="site-section is-rule" aria-labelledby="organizing-members-heading">
        <div className="site-shell">
          <h2 id="organizing-members-heading">Organising members</h2>
          <h3 className="team-subhead" id="staff-heading">
            Staff
          </h3>
          <CommitteeList members={ORGANIZING_MEMBERS} testId="organizing-members" />
          <h3 className="team-subhead" id="students-heading">
            Students
          </h3>
          <StudentsSection />
        </div>
      </section>

      <section className="site-section is-rule" aria-labelledby="dsse-team-heading">
        <div className="site-shell">
          <p className="site-kicker">The school</p>
          <h2 id="dsse-team-heading">The DSSE team</h2>
          <SitePhoto
            src="/assets/landing/symposium-group.jpg"
            alt="The DSSE team on stage at the Entrepreneurship Research Symposium, IIT Bombay"
            caption="DSSE team · IIT Bombay"
            width={1600}
            height={1067}
            testId="team-dsse-team"
          />
        </div>
      </section>
    </SiteShell>
  );
}
