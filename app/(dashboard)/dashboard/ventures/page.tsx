import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { isS3Configured } from "@/lib/s3";
import { VENTURE_KIND_LABEL } from "@/lib/ventures";
import { VentureLogoUpload } from "@/components/VentureLogoUpload";
import {
  createVentureAction,
  deleteVentureAction,
  updateVentureAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function MyVenturesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/dashboard/ventures")}`);
  }

  const mine = await prisma.venture.findMany({
    where: { userId: user.id, deletedAt: null },
    orderBy: { updatedAt: "desc" },
  });
  const s3Ready = isS3Configured();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
        Dashboard
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-wide text-teal-deep">
        Your startups &amp; projects
      </h1>
      <p className="mt-3 text-ink-soft">
        Publish to the public{" "}
        <Link href="/ventures" className="text-teal-deep underline-offset-2 hover:underline">
          directory
        </Link>
        . Upload a logo or we&apos;ll use your name initials.
      </p>

      <section className="mt-10 rounded-xl border border-line bg-white p-5">
        <h2 className="font-semibold text-ink">Add listing</h2>
        <form action={createVentureAction} className="mt-4 grid gap-3">
          <label className="block text-sm">
            Type
            <select
              name="kind"
              required
              className="mt-1 w-full rounded-md border border-line px-3 py-2"
              defaultValue="STARTUP"
            >
              <option value="STARTUP">Startup</option>
              <option value="PROJECT">Project</option>
              <option value="IDEA">Idea</option>
            </select>
          </label>
          <label className="block text-sm">
            Name
            <input
              name="name"
              required
              maxLength={120}
              className="mt-1 w-full rounded-md border border-line px-3 py-2"
              placeholder="Acme Robotics"
            />
          </label>
          <label className="block text-sm">
            Tagline
            <input
              name="tagline"
              maxLength={160}
              className="mt-1 w-full rounded-md border border-line px-3 py-2"
              placeholder="One-line pitch"
            />
          </label>
          <label className="block text-sm">
            Description
            <textarea
              name="description"
              rows={4}
              maxLength={2000}
              className="mt-1 w-full rounded-md border border-line px-3 py-2"
              placeholder="What you build, for whom, and stage"
            />
          </label>
          <label className="block text-sm">
            Website / deck link
            <input
              name="websiteUrl"
              className="mt-1 w-full rounded-md border border-line px-3 py-2"
              placeholder="https://"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isPublished" defaultChecked />
            Publish to public directory
          </label>
          <button
            type="submit"
            className="rounded-md bg-teal-deep px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal"
          >
            Create
          </button>
        </form>
      </section>

      <div className="mt-10 space-y-6">
        {mine.length === 0 ? (
          <p className="text-ink-soft">You haven&apos;t added anything yet.</p>
        ) : (
          mine.map((v) => (
            <section
              key={v.id}
              className="rounded-xl border border-line bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mute">
                    {VENTURE_KIND_LABEL[v.kind]}
                    {v.isPublished ? " · Published" : " · Draft"}
                  </p>
                  <h2 className="font-semibold text-ink">{v.name}</h2>
                </div>
                <form action={deleteVentureAction}>
                  <input type="hidden" name="id" value={v.id} />
                  <button
                    type="submit"
                    className="text-xs font-semibold text-red-700 underline-offset-2 hover:underline"
                  >
                    Delete
                  </button>
                </form>
              </div>

              {s3Ready ? (
                <div className="mt-4">
                  <VentureLogoUpload
                    ventureId={v.id}
                    logoUrl={v.logoUrl}
                    name={v.name}
                  />
                </div>
              ) : (
                <p className="mt-3 text-xs text-mute">
                  Logo upload needs S3 on the server. Initials will show until
                  then.
                </p>
              )}

              <form action={updateVentureAction} className="mt-4 grid gap-3">
                <input type="hidden" name="id" value={v.id} />
                <label className="block text-sm">
                  Type
                  <select
                    name="kind"
                    defaultValue={v.kind}
                    className="mt-1 w-full rounded-md border border-line px-3 py-2"
                  >
                    <option value="STARTUP">Startup</option>
                    <option value="PROJECT">Project</option>
                    <option value="IDEA">Idea</option>
                  </select>
                </label>
                <label className="block text-sm">
                  Name
                  <input
                    name="name"
                    required
                    defaultValue={v.name}
                    className="mt-1 w-full rounded-md border border-line px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  Tagline
                  <input
                    name="tagline"
                    defaultValue={v.tagline ?? ""}
                    className="mt-1 w-full rounded-md border border-line px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  Description
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={v.description ?? ""}
                    className="mt-1 w-full rounded-md border border-line px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  Website
                  <input
                    name="websiteUrl"
                    defaultValue={v.websiteUrl ?? ""}
                    className="mt-1 w-full rounded-md border border-line px-3 py-2"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="isPublished"
                    defaultChecked={v.isPublished}
                  />
                  Published
                </label>
                <button
                  type="submit"
                  className="justify-self-start rounded-md border border-line px-3 py-2 text-sm font-semibold text-teal-deep hover:bg-paper"
                >
                  Save
                </button>
              </form>
            </section>
          ))
        )}
      </div>
    </main>
  );
}
