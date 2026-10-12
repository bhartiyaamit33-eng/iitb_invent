import { EditionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { istDate } from "@/lib/admin/format";
import { Badge, PageHeader } from "@/components/admin/ui";
import {
  setEditionCurrentAction,
  setEditionSpeakersPublishedAction,
  setEditionStatusAction,
} from "../actions";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<EditionStatus, string> = {
  DRAFT: "Draft",
  ANNOUNCED: "Announced",
  REGISTRATION_OPEN: "Registration open",
  LIVE: "Live (event day)",
  ARCHIVED: "Archived",
};

export default async function AdminEditionsPage() {
  const editions = await prisma.edition.findMany({
    orderBy: { year: "desc" },
    include: { _count: { select: { sessions: true, speakers: true, registrations: true, pages: true } } },
  });

  return (
    <div className="adm-page is-narrow" style={{ maxWidth: 1000 }}>
      <PageHeader
        title="Editions"
        description="Each year of the conference is an edition. The current edition is the one the public site and this portal show."
      />
      <div className="adm-stack">
        {editions.map((e) => (
          <section key={e.id} className="adm-panel">
            <div className="adm-panel-head">
              <div>
                <h2 className="adm-panel-title" style={{ fontSize: 18 }}>
                  {e.name}
                </h2>
                <p className="adm-panel-note">
                  {istDate(e.startsAt)} to {istDate(e.endsAt)}, {e.venueName}
                </p>
              </div>
              <div className="adm-actions">
                {e.isCurrent ? <Badge tone="info">Current edition</Badge> : null}
                <Badge tone={e.status === "LIVE" ? "good" : "neutral"}>{STATUS_LABEL[e.status]}</Badge>
              </div>
            </div>
            <div className="adm-panel-body">
              <dl className="adm-dl">
                <div>
                  <dt>Content</dt>
                  <dd>
                    {e._count.sessions} sessions, {e._count.speakers} speakers, {e._count.pages} pages,{" "}
                    {e._count.registrations} tickets
                  </dd>
                </div>
                <div>
                  <dt>Stage</dt>
                  <dd>
                    <form action={setEditionStatusAction} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <input type="hidden" name="id" value={e.id} />
                      <select name="status" defaultValue={e.status} className="adm-select is-small" style={{ width: "auto" }} aria-label={`Stage of ${e.name}`}>
                        {Object.values(EditionStatus).map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABEL[s]}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className="adm-btn is-small">
                        Save stage
                      </button>
                    </form>
                    <span className="adm-sub">Live turns on the &ldquo;Happening now&rdquo; strip and the /now lobby screen.</span>
                  </dd>
                </div>
                <div>
                  <dt>Speaker line-up</dt>
                  <dd>
                    <form action={setEditionSpeakersPublishedAction} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <input type="hidden" name="id" value={e.id} />
                      <input type="hidden" name="speakersPublished" value={e.speakersPublished ? "false" : "true"} />
                      <Badge tone={e.speakersPublished ? "good" : "warn"}>
                        {e.speakersPublished ? "Public" : "Hidden, the site says “coming soon”"}
                      </Badge>
                      <button type="submit" className="adm-btn is-small">
                        {e.speakersPublished ? "Hide line-up" : "Publish line-up"}
                      </button>
                    </form>
                    <span className="adm-sub">Hiding or publishing never edits or deletes a speaker.</span>
                  </dd>
                </div>
              </dl>
              {!e.isCurrent ? (
                <form action={setEditionCurrentAction} style={{ marginTop: 14 }}>
                  <input type="hidden" name="id" value={e.id} />
                  <button type="submit" className="adm-btn is-primary">
                    Make {e.name} the current edition
                  </button>
                </form>
              ) : null}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
