import Link from "next/link";
import type { ApplicationStatus, ParticipationCategory } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  APPLICATION_STATUS_OPTIONS,
  DEFAULT_COLLOQUIUM_FEE_PAISE,
  PARTICIPATION_OPTIONS,
  participationLabel,
  paymentStatusLabel,
  professionalLabel,
} from "@/lib/colloquium";
import { ApplicationReviewDialog } from "@/components/admin/ApplicationReviewDialog";

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
  searchParams: Promise<{ q?: string; status?: string; participation?: string }>;
}) {
  const { q, status, participation } = await searchParams;
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
    ? await prisma.colloquiumApplication.findMany({
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
    ? await prisma.colloquiumApplication.count({ where: { editionId: edition.id } })
    : 0;

  return (
    <main className="px-6 py-10">
      <h1 className="font-display text-4xl tracking-wide text-teal-deep">
        Colloquium applications
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Call for papers / posters / attendees for{" "}
        <strong className="text-ink">{edition?.name ?? "the current edition"}</strong>
        . {total} received. Review, shortlist, and export from here.
      </p>

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
                        href={`/api/colloquium/abstract/${a.abstractViewToken}`}
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
                      feePaise={a.paymentAmountPaise || DEFAULT_COLLOQUIUM_FEE_PAISE}
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
