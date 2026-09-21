import { prisma } from "@/lib/db";
import {
  createOrgAction,
  softDeleteOrgAction,
  updateOrgAction,
} from "../actions";
import { OrgLogoUpload } from "@/components/admin/OrgLogoUpload";
import { isS3Configured } from "@/lib/s3";

export const dynamic = "force-dynamic";

export default async function AdminOrgsPage() {
  const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
  const orgs = edition
    ? await prisma.sponsor.findMany({
        where: { editionId: edition.id, deletedAt: null },
        orderBy: [{ kind: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
      })
    : [];
  const s3Ready = isS3Configured();

  return (
    <main className="px-6 py-10">
      <h1 className="font-display text-4xl tracking-wide text-teal-deep">
        Sponsors &amp; Partners
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Add a name and a logo. Published entries with both appear as a
        logo carousel under “Sponsors” on the landing page and on /partners.
        Until then that heading is not shown anywhere on the public site.
        {!s3Ready ? (
          <span className="block text-amber-800">
            Logo upload needs S3_BUCKET in the server env. You can still paste a
            logo URL below.
          </span>
        ) : null}
      </p>

      <form
        action={createOrgAction}
        className="mt-8 grid gap-3 rounded-xl border border-line bg-white p-5 sm:grid-cols-2"
      >
        <h2 className="sm:col-span-2 text-sm font-semibold uppercase tracking-[0.12em] text-mute">
          Add organisation
        </h2>
        <input
          name="name"
          placeholder="Name"
          required
          className="rounded-md border border-line px-3 py-2"
        />
        <select name="kind" className="rounded-md border border-line px-3 py-2">
          <option value="sponsor">Sponsor</option>
          <option value="partner">Partner</option>
        </select>
        <input
          name="websiteUrl"
          placeholder="Website URL"
          className="rounded-md border border-line px-3 py-2"
        />
        <input
          name="logoUrl"
          placeholder="Logo URL (optional if you will upload)"
          className="rounded-md border border-line px-3 py-2"
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPublished" defaultChecked /> Published
        </label>
        <button
          type="submit"
          className="rounded-md bg-teal-deep px-4 py-2 text-sm font-semibold text-white sm:col-span-2"
        >
          Create
        </button>
      </form>

      <div className="mt-8 space-y-4">
        {orgs.map((org) => (
          <form
            key={org.id}
            action={updateOrgAction}
            className="rounded-xl border border-line bg-white p-5"
          >
            <input type="hidden" name="id" value={org.id} />
            <div className="mb-4">
              <OrgLogoUpload orgId={org.id} logoUrl={org.logoUrl || null} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                name="name"
                defaultValue={org.name}
                className="rounded-md border border-line px-3 py-2 font-semibold"
              />
              <select
                name="kind"
                defaultValue={org.kind}
                className="rounded-md border border-line px-3 py-2"
              >
                <option value="sponsor">Sponsor</option>
                <option value="partner">Partner</option>
              </select>
              <input
                name="websiteUrl"
                defaultValue={org.websiteUrl ?? ""}
                placeholder="Website URL"
                className="rounded-md border border-line px-3 py-2"
              />
              <input
                name="logoUrl"
                defaultValue={org.logoUrl}
                placeholder="Logo URL"
                className="rounded-md border border-line px-3 py-2"
              />
              <input
                name="sortOrder"
                type="number"
                defaultValue={org.sortOrder}
                className="rounded-md border border-line px-3 py-2"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="isPublished"
                  defaultChecked={org.isPublished}
                />{" "}
                Published
              </label>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                type="submit"
                className="rounded-md bg-teal-deep px-4 py-2 text-sm font-semibold text-white"
              >
                Save
              </button>
              <button
                type="submit"
                formAction={softDeleteOrgAction}
                className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-ink-soft"
              >
                Remove
              </button>
            </div>
          </form>
        ))}
      </div>
    </main>
  );
}
