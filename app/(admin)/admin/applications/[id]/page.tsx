import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  APPLICATION_STATUS_OPTIONS,
  applicationStatusLabel,
  participationLabel,
  phdYearLabel,
  postdocLabel,
  professionalLabel,
} from "@/lib/colloquium";
import { updateApplicationStatusAction } from "../actions";

export const dynamic = "force-dynamic";

function istDate(d: Date): string {
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const application = await prisma.colloquiumApplication.findUnique({
    where: { id },
    include: { edition: { select: { name: true, year: true } } },
  });
  if (!application) notFound();

  const rows: [string, string][] = [
    ["Edition", `${application.edition.name} (${application.edition.year})`],
    ["Name", application.name],
    ["Email", application.email],
    ["Phone", application.phone],
    ["Institution", application.institution],
    [
      "Professional category",
      professionalLabel(
        application.professionalCategory,
        application.professionalOther,
      ),
    ],
    ["PhD year", phdYearLabel(application.phdYear)],
    ["Seeking post-doc", postdocLabel(application.seekingPostdoc)],
    [
      "Participation",
      participationLabel(
        application.participationCategory,
        application.participationOther,
      ),
    ],
    ["Proposed title", application.paperTitle ?? "—"],
    ["Send copy of responses", application.sendCopy ? "Yes" : "No"],
    ["Submitted", istDate(application.createdAt)],
    ["Updated", istDate(application.updatedAt)],
    ["Status", applicationStatusLabel(application.status)],
  ];

  return (
    <main className="px-6 py-10">
      <p className="text-sm text-mute">
        <Link
          href="/admin/applications"
          className="underline-offset-2 hover:underline"
        >
          ← All applications
        </Link>
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-wide text-teal-deep">
        {application.name}
      </h1>
      <p className="mt-1 text-ink-soft">{application.email}</p>

      <dl className="mt-8 divide-y divide-line rounded-xl border border-line bg-white">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 px-5 py-3 sm:grid-cols-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-mute">
              {k}
            </dt>
            <dd className="text-sm text-ink sm:col-span-2">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 rounded-xl border border-line bg-white px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-mute">
          Extended abstract
        </p>
        {application.abstractStorageKey ? (
          <a
            href={`/api/admin/applications/${application.id}/abstract`}
            className="mt-2 inline-block text-sm font-semibold text-teal-deep underline-offset-2 hover:underline"
          >
            Download {application.abstractFileName || "PDF"}
          </a>
        ) : (
          <p className="mt-2 text-sm text-ink-soft">No abstract uploaded.</p>
        )}
      </div>

      <form
        action={updateApplicationStatusAction}
        className="mt-6 space-y-3 rounded-xl border border-line bg-white p-5"
      >
        <input type="hidden" name="id" value={application.id} />
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-mute">
          Review
        </h2>
        <label className="block text-sm">
          <span className="text-ink">Status</span>
          <select
            name="status"
            defaultValue={application.status}
            className="mt-1.5 w-full rounded-md border border-line px-3 py-2.5"
          >
            {APPLICATION_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-ink">Admin notes</span>
          <textarea
            name="adminNotes"
            defaultValue={application.adminNotes ?? ""}
            rows={4}
            className="mt-1.5 w-full rounded-md border border-line px-3 py-2.5"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-teal-deep px-4 py-2 text-sm font-semibold text-white"
        >
          Save review
        </button>
      </form>
    </main>
  );
}
