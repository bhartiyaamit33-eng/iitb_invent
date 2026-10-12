import Link from "next/link";
import { prisma } from "@/lib/db";
import { isS3Configured } from "@/lib/s3";
import { plural } from "@/lib/admin/format";
import { SpeakerPhotoUpload } from "@/components/admin/SpeakerPhotoUpload";
import { Badge, Empty, Notice, PageHeader } from "@/components/admin/ui";
import { createSpeakerAction, updateSpeakerAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminSpeakersPage() {
  const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
  const speakers = edition
    ? await prisma.speaker.findMany({
        where: { editionId: edition.id, deletedAt: null },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      })
    : [];
  const s3Ready = isS3Configured();

  return (
    <div className="adm-page" style={{ maxWidth: 1000 }}>
      <PageHeader
        title="Speakers"
        description={`${plural(speakers.length, "speaker")} for ${edition?.name ?? "the current edition"}.`}
      />

      {edition && !edition.speakersPublished ? (
        <Notice tone="warn">
          The line-up is hidden from the public site. Publish it on the{" "}
          <Link className="adm-link" href="/admin/editions">Editions</Link> page when it is final.
        </Notice>
      ) : null}
      {!s3Ready ? <Notice tone="warn">Photo uploads are off on this server: S3_BUCKET is not set.</Notice> : null}

      <div className="adm-stack">
        <details className="adm-panel">
          <summary className="adm-panel-head" style={{ cursor: "pointer", paddingBottom: 16, listStyle: "none" }}>
            <h2 className="adm-panel-title">Add a speaker</h2>
            <span className="adm-link">Show form</span>
          </summary>
          <div className="adm-panel-body" style={{ borderTop: "1px solid var(--adm-rule)" }}>
            <form action={createSpeakerAction} className="adm-form is-2">
              <label className="adm-field">
                <span className="adm-label">Name</span>
                <input name="name" required className="adm-input" />
              </label>
              <label className="adm-field">
                <span className="adm-label">Title</span>
                <input name="title" className="adm-input" placeholder="e.g. Professor of Strategy" />
              </label>
              <label className="adm-field span-all">
                <span className="adm-label">Organisation</span>
                <input name="organisation" className="adm-input" />
              </label>
              <label className="adm-field span-all">
                <span className="adm-label">Bio</span>
                <textarea name="bio" rows={3} className="adm-textarea" />
              </label>
              <div className="adm-form-foot span-all">
                <label className="adm-check">
                  <input type="checkbox" name="isKeynote" /> Keynote speaker
                </label>
                <label className="adm-check">
                  <input type="checkbox" name="isPublished" defaultChecked /> Listed publicly
                </label>
                <button type="submit" className="adm-btn is-primary" style={{ marginLeft: "auto" }}>
                  Add speaker
                </button>
              </div>
            </form>
          </div>
        </details>

        <section className="adm-panel is-flush">
          <div className="adm-panel-body" style={{ paddingTop: 0 }}>
            {speakers.length === 0 ? (
              <Empty title="No speakers yet">Add the first one above.</Empty>
            ) : (
              speakers.map((s) => (
                <details key={s.id} className="adm-row" style={{ ["--adm-row-cols" as string]: "44px minmax(0,1fr) auto" }}>
                  <summary>
                    {s.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.photoUrl} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                      <span
                        aria-hidden="true"
                        style={{
                          display: "grid",
                          placeItems: "center",
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: "var(--adm-neutral-tint)",
                          color: "var(--adm-mute)",
                          fontWeight: 650,
                        }}
                      >
                        {s.name.charAt(0)}
                      </span>
                    )}
                    <span>
                      <span className="adm-row-title">{s.name}</span>
                      <span className="adm-sub">{[s.title, s.organisation].filter(Boolean).join(", ") || "No affiliation yet"}</span>
                    </span>
                    <span className="adm-row-meta">
                      {s.isKeynote ? <Badge tone="info">Keynote</Badge> : null}
                      <Badge tone={s.isPublished ? "good" : "neutral"}>{s.isPublished ? "Listed" : "Hidden"}</Badge>
                      <span className="adm-row-edit">Edit</span>
                    </span>
                  </summary>
                  <div className="adm-row-body">
                    <div style={{ marginBottom: 16 }}>
                      <SpeakerPhotoUpload speakerId={s.id} photoUrl={s.photoUrl} />
                    </div>
                    <form action={updateSpeakerAction} className="adm-form is-2">
                      <input type="hidden" name="id" value={s.id} />
                      <label className="adm-field">
                        <span className="adm-label">Name</span>
                        <input name="name" defaultValue={s.name} className="adm-input" />
                      </label>
                      <label className="adm-field">
                        <span className="adm-label">Title</span>
                        <input name="title" defaultValue={s.title ?? ""} className="adm-input" />
                      </label>
                      <label className="adm-field">
                        <span className="adm-label">Organisation</span>
                        <input name="organisation" defaultValue={s.organisation ?? ""} className="adm-input" />
                      </label>
                      <label className="adm-field">
                        <span className="adm-label">Position in the list</span>
                        <input name="sortOrder" type="number" defaultValue={s.sortOrder} className="adm-input" />
                      </label>
                      <label className="adm-field">
                        <span className="adm-label">LinkedIn</span>
                        <input name="linkedinUrl" defaultValue={s.linkedinUrl ?? ""} className="adm-input" placeholder="https://www.linkedin.com/in/…" />
                      </label>
                      <label className="adm-field">
                        <span className="adm-label">Website</span>
                        <input name="websiteUrl" defaultValue={s.websiteUrl ?? ""} className="adm-input" placeholder="https://…" />
                      </label>
                      <label className="adm-field span-all">
                        <span className="adm-label">Bio</span>
                        <textarea name="bio" defaultValue={s.bio ?? ""} rows={4} className="adm-textarea" />
                      </label>
                      <div className="adm-form-foot span-all">
                        <label className="adm-check">
                          <input type="checkbox" name="isKeynote" defaultChecked={s.isKeynote} /> Keynote speaker
                        </label>
                        <label className="adm-check">
                          <input type="checkbox" name="isPublished" defaultChecked={s.isPublished} /> Listed publicly
                        </label>
                        <button type="submit" className="adm-btn is-primary" style={{ marginLeft: "auto" }}>
                          Save speaker
                        </button>
                      </div>
                    </form>
                  </div>
                </details>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
