import Link from "next/link";
import type { ApplicationStatus, ParticipationCategory } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  APPLICATION_STATUS_OPTIONS,
  PARTICIPATION_OPTIONS,
  participationLabel,
  paymentStatusLabel,
  professionalLabel,
  reviewFeePaise,
} from "@/lib/conference";
import { ApplicationReviewDialog } from "@/components/admin/ApplicationReviewDialog";
import { DeleteApplicationForm } from "@/components/admin/DeleteApplicationForm";

export const dynamic = "force-dynamic";

function istDate(d: Date): string {
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function paymentBadgeClass(status: string): string {
  if (status === "PAID" || status === "WAIVED") return "text-teal-deep";
  if (status === "REPORTED") return "text-amber-800";
  if (status === "UNPAID") return "text-red-700";
  return "text-mute";
}

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    participation?: string;
    deleted?: string;
    error?: string;
  }>;
}) {
  const { q, status, participation, deleted, error } = await searchParams;
  const query = q?.trim() ?? "";
  const statusFilter = APPLICATION_STATUS_OPTIONS.some((o) => o.value === status)
    ? (status as ApplicationStatus)
    : undefined;
  const participationFilter = PARTICIPATION_OPTIONS.some(
    (o) => o.value === participation,
  )
    ? (participation as ParticipationCategory)
    : undefined;

  const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
  const applications = edition
    ? await prisma.conferenceApplication.findMany({
        where: {
          editionId: edition.id,
          ...(statusFilter ? { status: statusFilter } : {}),
          ...(participationFilter
            ? { participationCategory: participationFilter }
            : {}),
          ...(query
            ? {
                OR: [
                  { email: { contains: query, mode: "insensitive" } },
                  { name: { contains: query, mode: "insensitive" } },
                  { institution: { contains: query, mode: "insensitive" } },
                  { paperTitle: { contains: query, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        include: {
          reviews: {
            select: { status: true, score: true, recommendation: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 500,
      })
    : [];

  const total = edition
    ? await prisma.conferenceApplication.count({ where: { editionId: edition.id } })
    : 0;

  return (
    <main className="px-6 py-10">
      <h1 className="font-display text-4xl tracking-wide text-teal-deep">
        Conference applications
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Call for papers / posters / attendees for{" "}
        <strong className="text-ink">{edition?.name ?? "the current edition"}</strong>
        . {total} received. Review, shortlist, and export from here. Type
        DELETE next to a name to remove that submission.
      </p>

      {deleted ? (
        <p
          className="mt-4 rounded-md border border-teal/30 bg-teal/5 px-4 py-3 text-sm text-teal-deep"
          role="status"
          data-testid="application-deleted"
        >
          Submission deleted.
        </p>
      ) : null}
      {error === "confirm" ? (
        <p
          className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="alert"
        >
          Type DELETE in the confirm field to remove a submission.
        </p>
      ) : null}
      {error && error !== "confirm" ? (
        <p
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <a
          href="/api/admin/applications/export"
          className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-teal-deep hover:border-teal"
        >
          Export CSV
        </a>
      </div>

      <form className="mt-6 grid gap-3 sm:grid-cols-3">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search name, email, institution, title"
          className="rounded-md border border-line bg-white px-3 py-2.5 outline-none focus:border-teal sm:col-span-1"
        />
        <select
          name="status"
          defaultValue={statusFilter ?? ""}
          className="rounded-md border border-line bg-white px-3 py-2.5"
        >
          <option value="">All statuses</option>
          {APPLICATION_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          name="participation"
          defaultValue={participationFilter ?? ""}
          className="rounded-md border border-line bg-white px-3 py-2.5"
        >
          <option value="">All participation</option>
          {PARTICIPATION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-teal-deep px-4 py-2 text-sm font-semibold text-white sm:col-span-3 sm:w-fit"
        >
          Filter
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-white">
        <table className="min-w-full text-left text-sm" data-testid="applications-table">
          <thead className="border-b border-line bg-paper text-xs uppercase tracking-[0.1em] text-mute">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Institution</th>
              <th className="px-4 py-3">Participation</th>
              <th className="px-4 py-3">Abstract</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Reviews</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-ink-soft" colSpan={8}>
                  No applications yet.
                </td>
              </tr>
            ) : (
              applications.map((a) => (
                <tr key={a.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/applications/${a.id}`}
                      className="font-medium text-teal-deep underline-offset-2 hover:underline"
                    >
                      {a.name}
                    </Link>
                    <p className="text-xs text-mute">{a.email}</p>
                    <p className="text-xs text-mute">{a.phone}</p>
                    <div className="mt-2">
                      <DeleteApplicationForm id={a.id} name={a.name} compact />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {a.institution}
                    <p className="text-xs text-mute">
                      {professionalLabel(
                        a.professionalCategory,
                        a.professionalOther,
                      )}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {participationLabel(
                      a.participationCategory,
                      a.participationOther,
                    )}
                    {a.paperTitle ? (
                      <p className="text-xs text-mute">{a.paperTitle}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    {a.abstractStorageKey ? (
                      <a
                        href={`/api/conference/abstract/${a.abstractViewToken}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-teal-deep underline-offset-2 hover:underline"
                        data-testid={`view-pdf-${a.id}`}
                      >
                        View PDF
                      </a>
                    ) : (
                      <span className="text-xs text-mute">No PDF</span>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-xs font-semibold ${paymentBadgeClass(a.paymentStatus)}`}>
                    {paymentStatusLabel(a.paymentStatus)}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {a.reviews.length === 0 ? (
                      <span className="text-mute">Unassigned</span>
                    ) : (
                      <>
                        <p className="font-semibold text-teal-deep">
                          {a.reviews.filter((r) => r.status === "COMPLETED").length}/
                          {a.reviews.length} complete
                        </p>
                        {a.reviews.some((r) => r.score !== null) ? (
                          <p className="text-mute">
                            Avg{" "}
                            {(
                              a.reviews.reduce((sum, r) => sum + (r.score ?? 0), 0) /
                              a.reviews.filter((r) => r.score !== null).length
                            ).toFixed(1)}
                            /10
                          </p>
                        ) : null}
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <ApplicationReviewDialog
                      id={a.id}
                      name={a.name}
                      currentStatus={a.status}
                      feePaise={reviewFeePaise(a)}
                      compact
                    />
                  </td>
                  <td className="px-4 py-3 text-xs text-mute">{istDate(a.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
