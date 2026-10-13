import Link from "next/link";
import type { ApplicationStatus, ParticipationCategory, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  APPLICATION_STATUS_OPTIONS,
  PARTICIPATION_OPTIONS,
  applicationStatusLabel,
  formatInrFromPaise,
  participationLabel,
  professionalLabel,
  reviewFeePaise,
} from "@/lib/conference";
import { applicationFeeDue } from "@/lib/conference-access";
import { proformaResendQueue, proformaSendStats } from "@/lib/conference-payment";
import { withBasePath } from "@/lib/base-path";
import { applicationTone, feeStatusLabel, istDate, istDateTime, paymentTone, plural, times } from "@/lib/admin/format";
import { ApplicationReviewDialog } from "@/components/admin/ApplicationReviewDialog";
import { ConfirmActionForm } from "@/components/admin/ConfirmActionForm";
import { Badge, Empty, Notice, PageHeader } from "@/components/admin/ui";
import { resendAllProformasAction, resendProformaAction } from "./actions";

export const dynamic = "force-dynamic";

const SELECTED: ApplicationStatus[] = ["SHORTLISTED_PAPER", "SHORTLISTED_POSTER", "ATTENDEE"];

const VIEWS: { key: string; label: string; where: Prisma.ConferenceApplicationWhereInput }[] = [
  { key: "all", label: "All", where: {} },
  { key: "awaiting", label: "Awaiting decision", where: { status: "RECEIVED" } },
  {
    key: "unassigned",
    label: "No reviewer",
    where: { status: "RECEIVED", participationCategory: { not: "ATTENDEE" }, reviews: { none: {} } },
  },
  { key: "selected", label: "Selected", where: { status: { in: SELECTED } } },
  { key: "due", label: "Fee due", where: { status: { in: SELECTED }, paymentStatus: "UNPAID" } },
  { key: "paid", label: "Paid", where: { paymentStatus: { in: ["PAID", "WAIVED"] } } },
  { key: "waitlisted", label: "Waitlisted", where: { status: "WAITLISTED" } },
  { key: "closed", label: "Not selected or withdrawn", where: { status: { in: ["REJECTED", "WITHDRAWN"] } } },
];

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    view?: string;
    status?: string;
    participation?: string;
    deleted?: string;
    error?: string;
    updated?: string;
  }>;
}) {
  const { q, view, status, participation, deleted, error, updated } = await searchParams;
  const query = q?.trim() ?? "";
  const current = VIEWS.find((v) => v.key === view) ?? VIEWS[0]!;
  // Older links filter by a single status; they still work.
  const statusFilter = APPLICATION_STATUS_OPTIONS.some((o) => o.value === status)
    ? (status as ApplicationStatus)
    : undefined;
  const participationFilter = PARTICIPATION_OPTIONS.some((o) => o.value === participation)
    ? (participation as ParticipationCategory)
    : undefined;

  const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
  const base: Prisma.ConferenceApplicationWhereInput = {
    editionId: edition?.id ?? "__none__",
    ...(participationFilter ? { participationCategory: participationFilter } : {}),
    ...(query
      ? {
          OR: [
            { email: { contains: query, mode: "insensitive" } },
            { name: { contains: query, mode: "insensitive" } },
            { institution: { contains: query, mode: "insensitive" } },
            { paperTitle: { contains: query, mode: "insensitive" } },
            { payerId: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [applications, counts, resend] = await Promise.all([
    prisma.conferenceApplication.findMany({
      where: { AND: [base, current.where, statusFilter ? { status: statusFilter } : {}] },
      include: { reviews: { select: { status: true, score: true } } },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    Promise.all(VIEWS.map((v) => prisma.conferenceApplication.count({ where: { AND: [base, v.where] } }))),
    edition ? proformaResendQueue(edition.id) : Promise.resolve({ due: 0, queue: [] as string[] }),
  ]);
  const proformas = await proformaSendStats(applications.map((a) => a.id));

  const total = counts[0] ?? 0;
  const tabHref = (key: string) => {
    const params = new URLSearchParams();
    if (key !== "all") params.set("view", key);
    if (query) params.set("q", query);
    if (participationFilter) params.set("participation", participationFilter);
    const s = params.toString();
    return `/admin/applications${s ? `?${s}` : ""}`;
  };
  const here = tabHref(current.key);
  const recentlySent = resend.due - resend.queue.length;

  return (
    <div className="adm-page">
      <PageHeader
        title="Applications"
        description={
          edition
            ? `${plural(total, "registration")} for ${edition.name}${query || participationFilter ? " match your search" : ""}. Open a name to read the abstract, assign reviewers and record a decision.`
            : "There is no current edition."
        }
        actions={
          <>
            {resend.due > 0 ? (
              <ConfirmActionForm
                action={resendAllProformasAction}
                fields={{ returnTo: here }}
                label={`Resend proforma invoices (${resend.queue.length})`}
                disabled={resend.queue.length === 0}
                title={
                  resend.queue.length === 0
                    ? "Everyone with a fee due was emailed a proforma invoice in the last hour."
                    : undefined
                }
                prompt={
                  <>
                    Email the proforma invoice to {plural(resend.queue.length, "person", "people")} whose fee is due?
                    {recentlySent > 0 ? ` ${plural(recentlySent, "person", "people")} emailed in the last hour will be skipped.` : ""}
                  </>
                }
                confirmLabel={`Send ${resend.queue.length}`}
                pendingLabel="Sending…"
                testId="resend-all-proformas"
              />
            ) : null}
            <a className="adm-btn" href={withBasePath("/api/admin/applications/export")}>
              Export CSV
            </a>
          </>
        }
      />

      {deleted ? <Notice tone="good" testId="application-deleted">Registration deleted.</Notice> : null}
      {updated ? <Notice tone="good" testId="status-updated">{updated.slice(0, 300)}</Notice> : null}
      {error ? (
        <Notice tone="bad">
          {error === "confirm" ? "Type DELETE in the confirm field to delete a registration." : error}
        </Notice>
      ) : null}

      <section className="adm-panel is-flush">
        <div className="adm-panel-body" style={{ paddingTop: 14 }}>
          <div className="adm-toolbar">
            <nav className="adm-tabs" aria-label="Filter applications">
              {VIEWS.map((v, i) => (
                <Link
                  key={v.key}
                  href={tabHref(v.key)}
                  aria-current={v.key === current.key ? "true" : undefined}
                >
                  {v.label} <span className="count">{counts[i]}</span>
                </Link>
              ))}
            </nav>
            <form className="adm-search" role="search">
              {current.key !== "all" ? <input type="hidden" name="view" value={current.key} /> : null}
              <input
                className="adm-input"
                name="q"
                defaultValue={query}
                placeholder="Name, email, institution, title or ID"
                aria-label="Search applications"
              />
              <select
                className="adm-select"
                name="participation"
                defaultValue={participationFilter ?? ""}
                aria-label="Participation"
              >
                <option value="">Any participation</option>
                {PARTICIPATION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <button type="submit" className="adm-btn">
                Search
              </button>
            </form>
          </div>

          {applications.length === 0 ? (
            <Empty title={total === 0 ? "No registrations yet" : "Nothing in this view"}>
              {total === 0
                ? "Registrations appear here as people complete the form."
                : "Try another tab or clear the search."}
            </Empty>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table" data-testid="applications-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Institution</th>
                    <th>Participation</th>
                    <th>Reviews</th>
                    <th>Fee</th>
                    <th>Decision</th>
                    <th className="num">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((a) => {
                    const done = a.reviews.filter((r) => r.status === "COMPLETED").length;
                    const scored = a.reviews.filter((r) => r.score !== null);
                    const avg = scored.length
                      ? scored.reduce((sum, r) => sum + (r.score ?? 0), 0) / scored.length
                      : null;
                    const proforma = proformas.get(a.id);
                    const feeDue = applicationFeeDue(a);
                    return (
                      <tr key={a.id}>
                        <td>
                          <Link className="primary-link" href={`/admin/applications/${a.id}`}>
                            {a.name}
                          </Link>
                          <span className="adm-sub">{a.email}</span>
                          <span className="adm-sub">{a.phone}</span>
                        </td>
                        <td>
                          {a.institution}
                          <span className="adm-sub">
                            {professionalLabel(a.professionalCategory, a.professionalOther)}
                          </span>
                        </td>
                        <td style={{ maxWidth: 260 }}>
                          {participationLabel(a.participationCategory, a.participationOther)}
                          {a.paperTitle ? <span className="adm-sub">{a.paperTitle}</span> : null}
                          {a.abstractStorageKey ? (
                            <a
                              className="adm-link"
                              style={{ fontSize: 12.5 }}
                              href={withBasePath(`/api/conference/abstract/${a.abstractViewToken}`)}
                              target="_blank"
                              rel="noreferrer"
                              data-testid={`view-pdf-${a.id}`}
                            >
                              Abstract PDF
                            </a>
                          ) : null}
                        </td>
                        <td>
                          {a.reviews.length === 0 ? (
                            <span className="adm-sub" style={{ marginTop: 0 }}>
                              {a.participationCategory === "ATTENDEE" ? "Not needed" : "None assigned"}
                            </span>
                          ) : (
                            <>
                              {done} of {a.reviews.length} done
                              {avg !== null ? <span className="adm-sub">Average {avg.toFixed(1)} of 10</span> : null}
                            </>
                          )}
                        </td>
                        <td>
                          <Badge tone={paymentTone(a.paymentStatus)}>{feeStatusLabel(a)}</Badge>
                          {a.paymentStatus !== "NOT_REQUIRED" ? (
                            <span className="adm-sub">{formatInrFromPaise(a.paymentAmountPaise)}</span>
                          ) : feeStatusLabel(a) === "Due once selected" ? (
                            <span className="adm-sub">{formatInrFromPaise(reviewFeePaise(a))} if selected</span>
                          ) : null}
                          {proforma ? (
                            <span
                              className="adm-sub"
                              title={proforma.lastSentAt ? `Last sent ${istDateTime(proforma.lastSentAt)}` : undefined}
                              data-testid={`proforma-count-${a.id}`}
                            >
                              Proforma sent {times(proforma.count)}
                            </span>
                          ) : feeDue ? (
                            <span className="adm-sub" data-testid={`proforma-count-${a.id}`}>
                              Proforma not sent
                            </span>
                          ) : null}
                          {feeDue ? (
                            <div style={{ marginTop: 8 }}>
                              <ConfirmActionForm
                                action={resendProformaAction}
                                fields={{ applicationId: a.id, returnTo: here }}
                                label={proforma ? "Resend proforma" : "Send proforma"}
                                prompt={`Email it to ${a.email}?`}
                                confirmLabel="Send"
                                pendingLabel="Sending…"
                                small
                                testId={`resend-proforma-${a.id}`}
                              />
                            </div>
                          ) : null}
                        </td>
                        <td style={{ minWidth: 190 }}>
                          <Badge tone={applicationTone(a.status)}>{applicationStatusLabel(a.status)}</Badge>
                          <div style={{ marginTop: 8 }}>
                            <ApplicationReviewDialog
                              id={a.id}
                              name={a.name}
                              currentStatus={a.status}
                              feePaise={reviewFeePaise(a)}
                              compact
                            />
                          </div>
                        </td>
                        <td className="num">
                          <span className="adm-sub" style={{ marginTop: 0 }}>
                            {istDate(a.createdAt)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
