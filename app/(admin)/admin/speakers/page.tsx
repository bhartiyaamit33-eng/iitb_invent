import { prisma } from "@/lib/db";
import { createSpeakerAction, updateSpeakerAction } from "../actions";
import { SpeakerPhotoUpload } from "@/components/admin/SpeakerPhotoUpload";
import { isS3Configured } from "@/lib/s3";

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
    <main className="px-6 py-10">
      <h1 className="font-display text-4xl tracking-wide text-teal-deep">
        Speakers
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Seeded from DSSE Day 2026 artwork — fully editable.
        {!s3Ready ? (
          <span className="block text-amber-800">
            Photo upload needs S3_BUCKET in the server env.
          </span>
        ) : null}
      </p>

      <form action={createSpeakerAction} className="mt-8 grid gap-3 rounded-xl border border-line bg-white p-5 sm:grid-cols-2">
        <h2 className="sm:col-span-2 text-sm font-semibold uppercase tracking-[0.12em] text-mute">
          Add speaker
        </h2>
        <input name="name" placeholder="Name" required className="rounded-md border border-line px-3 py-2" />
        <input name="title" placeholder="Title" className="rounded-md border border-line px-3 py-2" />
        <input name="organisation" placeholder="Organisation" className="rounded-md border border-line px-3 py-2" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isKeynote" /> Keynote
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPublished" defaultChecked /> Published
        </label>
        <textarea name="bio" placeholder="Bio" rows={2} className="sm:col-span-2 rounded-md border border-line px-3 py-2" />
        <button type="submit" className="rounded-md bg-teal-deep px-4 py-2 text-sm font-semibold text-white sm:col-span-2">
          Create
        </button>
      </form>

      <div className="mt-8 space-y-4">
        {speakers.map((s) => (
          <form key={s.id} action={updateSpeakerAction} className="rounded-xl border border-line bg-white p-5">
            <input type="hidden" name="id" value={s.id} />
            <div className="mb-4">
              <SpeakerPhotoUpload speakerId={s.id} photoUrl={s.photoUrl} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="name" defaultValue={s.name} className="rounded-md border border-line px-3 py-2 font-semibold" />
              <input name="title" defaultValue={s.title ?? ""} className="rounded-md border border-line px-3 py-2" />
              <input name="organisation" defaultValue={s.organisation ?? ""} className="rounded-md border border-line px-3 py-2" />
              <input name="linkedinUrl" defaultValue={s.linkedinUrl ?? ""} placeholder="LinkedIn URL" className="rounded-md border border-line px-3 py-2" />
              <input name="websiteUrl" defaultValue={s.websiteUrl ?? ""} placeholder="Website" className="rounded-md border border-line px-3 py-2" />
              <input name="sortOrder" type="number" defaultValue={s.sortOrder} className="rounded-md border border-line px-3 py-2" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isKeynote" defaultChecked={s.isKeynote} /> Keynote
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isPublished" defaultChecked={s.isPublished} /> Published
              </label>
              <textarea name="bio" defaultValue={s.bio ?? ""} rows={3} className="sm:col-span-2 rounded-md border border-line px-3 py-2" />
            </div>
            <button type="submit" className="mt-4 rounded-md bg-teal-deep px-4 py-2 text-sm font-semibold text-white">
              Save
            </button>
          </form>
        ))}
      </div>
    </main>
  );
}
