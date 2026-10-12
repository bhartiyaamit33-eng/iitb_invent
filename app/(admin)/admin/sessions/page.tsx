import { SessionFormat } from "@prisma/client";
import { prisma } from "@/lib/db";
import { istDayHeading, istTime, plural } from "@/lib/admin/format";
import { Badge, Empty, PageHeader } from "@/components/admin/ui";
import { createSessionAction, softDeleteSessionAction, updateSessionAction } from "../actions";

export const dynamic = "force-dynamic";

const FORMAT_LABEL: Record<SessionFormat, string> = {
  KEYNOTE: "Keynote",
  PANEL: "Panel",
  RESEARCH_PAPER: "Research papers",
  POSTER: "Posters",
  WORKSHOP: "Workshop",
  PITCH: "Pitches",
  VC_FORUM: "VC forum",
  NETWORKING: "Networking",
  BREAK: "Break",
};

/** IST wall-clock value for a datetime-local input. */
function toLocalInput(d: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

function FormatSelect({ value }: { value: SessionFormat }) {
  return (
    <select name="format" defaultValue={value} className="adm-select">
      {Object.values(SessionFormat).map((f) => (
        <option key={f} value={f}>
          {FORMAT_LABEL[f]}
        </option>
      ))}
    </select>
  );
}

export default async function AdminSessionsPage() {
  const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
  const sessions = edition
    ? await prisma.session_.findMany({
        where: { editionId: edition.id, deletedAt: null },
        orderBy: [{ startsAt: "asc" }, { sortOrder: "asc" }],
        include: { speakers: { include: { speaker: { select: { name: true } } } } },
      })
    : [];

  const days = new Map<string, typeof sessions>();
  for (const s of sessions) {
    const key = istDayHeading(s.startsAt);
    days.set(key, [...(days.get(key) ?? []), s]);
  }
  const published = sessions.filter((s) => s.isPublished).length;

  return (
    <div className="adm-page is-narrow" style={{ maxWidth: 1000 }}>
      <PageHeader
        title="Sessions"
        description={`${plural(sessions.length, "session")}, ${published} published on the public programme. Times are India Standard Time.`}
      />

      <div className="adm-stack">
        <details className="adm-panel">
          <summary className="adm-panel-head" style={{ cursor: "pointer", paddingBottom: 16, listStyle: "none" }}>
            <h2 className="adm-panel-title">Add a session</h2>
            <span className="adm-link">Show form</span>
          </summary>
          <div className="adm-panel-body" style={{ borderTop: "1px solid var(--adm-rule)" }}>
            <form action={createSessionAction} className="adm-form is-2">
              <label className="adm-field span-all">
                <span className="adm-label">Title</span>
                <input name="title" required className="adm-input" />
              </label>
              <label className="adm-field">
                <span className="adm-label">Format</span>
                <FormatSelect value="NETWORKING" />
              </label>
              <label className="adm-field">
                <span className="adm-label">Room</span>
                <input name="room" defaultValue="DSSE Building" className="adm-input" />
              </label>
              <label className="adm-field">
                <span className="adm-label">Starts</span>
                <input name="startsAt" type="datetime-local" required className="adm-input" />
              </label>
              <label className="adm-field">
                <span className="adm-label">Ends</span>
                <input name="endsAt" type="datetime-local" required className="adm-input" />
              </label>
              <label className="adm-field span-all">
                <span className="adm-label">Description</span>
                <textarea name="description" rows={3} className="adm-textarea" />
              </label>
              <div className="adm-form-foot span-all">
                <label className="adm-check">
                  <input type="checkbox" name="isPublished" defaultChecked /> Show on the public programme
                </label>
                <button type="submit" className="adm-btn is-primary" style={{ marginLeft: "auto" }}>
                  Add session
                </button>
              </div>
            </form>
          </div>
        </details>

        <section className="adm-panel is-flush">
          <div className="adm-panel-body" style={{ paddingTop: 0 }}>
            {sessions.length === 0 ? (
              <Empty title="No sessions yet">Add the first one above.</Empty>
            ) : (
              [...days].map(([day, list]) => (
                <div key={day}>
                  <div className="adm-day">{day}</div>
                  {list.map((s) => (
                    <details key={s.id} className="adm-row" style={{ ["--adm-row-cols" as string]: "170px minmax(0,1fr) auto" }}>
                      <summary>
                        <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                          {istTime(s.startsAt)} to {istTime(s.endsAt)}
                        </span>
                        <span>
                          <span className="adm-row-title">{s.title}</span>
                          <span className="adm-sub">
                            {FORMAT_LABEL[s.format]}
                            {s.room ? `, ${s.room}` : ""}
                            {s.speakers.length ? `, ${s.speakers.map((x) => x.speaker.name).join(", ")}` : ""}
                          </span>
                        </span>
                        <span className="adm-row-meta">
                          <Badge tone={s.isPublished ? "good" : "neutral"}>{s.isPublished ? "Published" : "Draft"}</Badge>
                          <span className="adm-row-edit">Edit</span>
                        </span>
                      </summary>
                      <div className="adm-row-body">
                        <form action={updateSessionAction} className="adm-form is-2">
                          <input type="hidden" name="id" value={s.id} />
                          <label className="adm-field span-all">
                            <span className="adm-label">Title</span>
                            <input name="title" defaultValue={s.title} className="adm-input" />
                          </label>
                          <label className="adm-field">
                            <span className="adm-label">Format</span>
                            <FormatSelect value={s.format} />
                          </label>
                          <label className="adm-field">
                            <span className="adm-label">Order within the time slot</span>
                            <input name="sortOrder" type="number" defaultValue={s.sortOrder} className="adm-input" />
                          </label>
                          <label className="adm-field">
                            <span className="adm-label">Starts</span>
                            <input name="startsAt" type="datetime-local" defaultValue={toLocalInput(s.startsAt)} className="adm-input" />
                          </label>
                          <label className="adm-field">
                            <span className="adm-label">Ends</span>
                            <input name="endsAt" type="datetime-local" defaultValue={toLocalInput(s.endsAt)} className="adm-input" />
                          </label>
                          <label className="adm-field">
                            <span className="adm-label">Room</span>
                            <input name="room" defaultValue={s.room ?? ""} className="adm-input" />
                          </label>
                          <label className="adm-field">
                            <span className="adm-label">Floor</span>
                            <input name="floor" defaultValue={s.floor ?? ""} className="adm-input" />
                          </label>
                          <label className="adm-field span-all">
                            <span className="adm-label">Description</span>
                            <textarea name="description" defaultValue={s.description ?? ""} rows={3} className="adm-textarea" />
                          </label>
                          <div className="adm-form-foot span-all">
                            <label className="adm-check">
                              <input type="checkbox" name="isPublished" defaultChecked={s.isPublished} /> Show on the public programme
                            </label>
                            <span style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                              <button formAction={softDeleteSessionAction} type="submit" className="adm-btn is-quiet is-bad">
                                Remove from programme
                              </button>
                              <button type="submit" className="adm-btn is-primary">
                                Save session
                              </button>
                            </span>
                          </div>
                        </form>
                      </div>
                    </details>
                  ))}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
