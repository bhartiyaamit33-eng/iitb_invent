import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  applicationStatusLabel,
  conferenceFeePaiseFor,
  feeBandForProfessional,
  feeBandLabel,
  formatInrFromPaise,
  needsPhdYear,
  participationLabel,
  phdYearLabel,
  postdocLabel,
  professionalLabel,
  reviewFeePaise,
  GST_PERCENT,
} from "@/lib/conference";
import { conferencePaymentUrl } from "@/lib/conference-server";
import { gatewayStatusLabel, proformaSendStats } from "@/lib/conference-payment";
import { ensureApplicationNumbers } from "@/lib/application-number";
import { applicationFeeDue } from "@/lib/conference-access";
import { withBasePath } from "@/lib/base-path";
import { applicationTone, feeStatusLabel, gatewayTone, istDate, istDateTime, paymentTone } from "@/lib/admin/format";
import { ApplicationReviewDialog } from "@/components/admin/ApplicationReviewDialog";
import { ApplicationPaymentPanel } from "@/components/admin/ApplicationPaymentPanel";
import { DeleteApplicationForm } from "@/components/admin/DeleteApplicationForm";
import { ConfirmActionForm } from "@/components/admin/ConfirmActionForm";
import { Badge, Empty, Notice, PageHeader, Panel } from "@/components/admin/ui";
import { assignReviewerAction, recordPlagiarismCheckAction, removeReviewerAction } from "./actions";
import {
  PLAGIARISM_LABELS,
  REVIEW_DECISION_LABELS,
  officialShortlistBlock,
  reviewerShortlisted,
  shortlistSummary,
} from "@/lib/review-flow";
import { resendProformaAction } from "../actions";

export const dynamic = "force-dynamic";

function sentence(value: string): string {
  const s = value.replaceAll("_", " ").toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function AdminApplicationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; updated?: string }>;
}) {
  const { id } = await params;
  const { error, updated } = await searchParams;
  await ensureApplicationNumbers();
  const application = await prisma.conferenceApplication.findUnique({
    where: { id },
    include: {
      edition: { select: { name: true, year: true } },
      reviews: {
        include: { reviewer: { select: { id: true, name: true, email: true } } },
        orderBy: { assignedAt: "asc" },
      },
      gatewayPayments: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!application) notFound();

  const reviewers = await prisma.user.findMany({
    where: { deletedAt: null, role: { in: [Role.REVIEWER, Role.ADMIN] } },
    select: { id: true, name: true, email: true },
    orderBy: [{ name: "asc" }, { email: "asc" }],
  });
  const assigned = new Set(application.reviews.map((r) => r.reviewer.id));
  const presenting = application.participationCategory !== "ATTENDEE";
  const shortlistBlock = officialShortlistBlock({
    participationCategory: application.participationCategory,
    plagiarismStatus: application.plagiarismStatus,
    reviews: application.reviews,
  });
  const reviewerSummary = shortlistSummary(application.reviews);
  const proforma = (await proformaSendStats([application.id])).get(application.id);

  const pdfUrl = application.abstractStorageKey
    ? withBasePath(`/api/conference/abstract/${application.abstractViewToken}`)
    : null;

  const applicant: [string, ReactNode][] = [
    ["Application number", application.applicationNumber ? <span key="n" className="adm-mono" data-testid="application-number">{application.applicationNumber}</span> : "—"],
    ["Email", <a key="e" className="adm-link" href={`mailto:${application.email}`}>{application.email}</a>],
    ["Phone", application.phone],
    ["Institution", application.institution],
    ["Position", professionalLabel(application.professionalCategory, application.professionalOther)],
    ...(needsPhdYear(application.professionalCategory)
      ? ([["PhD year", phdYearLabel(application.phdYear)]] as [string, string][])
      : []),
    ["Seeking post-doctoral roles", postdocLabel(application.seekingPostdoc)],
    [
      "Fee band",
      `${feeBandLabel(feeBandForProfessional(application.professionalCategory))}, ${formatInrFromPaise(conferenceFeePaiseFor(application.professionalCategory))} + ${GST_PERCENT}% GST`,
    ],
    [
      "Registration ID",
      application.payerId ? <span key="p" className="adm-mono">{application.payerId}</span> : "Issued when the fee becomes due",
    ],
    ["Registered", istDateTime(application.createdAt)],
    ["Last updated", istDateTime(application.updatedAt)],
  ];

  return (
    <div className="adm-page">
      <PageHeader
        back={{ href: "/admin/applications", label: "Applications" }}
        title={application.name}
        description={`${application.applicationNumber ? `${application.applicationNumber} · ` : ""}${participationLabel(application.participationCategory, application.participationOther)} for ${application.edition.name}, registered ${istDate(application.createdAt)}.`}
        actions={
          <>
            <Badge tone={applicationTone(application.status)}>{applicationStatusLabel(application.status)}</Badge>
            <Badge tone={paymentTone(application.paymentStatus)}>Fee: {feeStatusLabel(application)}</Badge>
          </>
        }
      />

      {updated ? <Notice tone="good" testId="detail-updated">{updated.slice(0, 300)}</Notice> : null}
      {error ? (
        <Notice tone="bad">
          {error === "confirm" ? "Type DELETE in the confirm field to delete this registration." : error.slice(0, 300)}
        </Notice>
      ) : null}

      <div className="adm-cols">
        <div className="adm-stack">
          <Panel title="Applicant">
            <dl className="adm-dl">
              {applicant.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel
            title="Submission"
            actions={
              pdfUrl ? (
                <>
                  <a className="adm-btn is-small" href={pdfUrl} target="_blank" rel="noreferrer" data-testid="view-pdf">
                    Open PDF
                  </a>
                  <a className="adm-btn is-small" href={`${pdfUrl}?download=1`}>
                    Download
                  </a>
                </>
              ) : null
            }
          >
            <dl className="adm-dl">
              <div>
                <dt>Participation</dt>
                <dd>{participationLabel(application.participationCategory, application.participationOther)}</dd>
              </div>
              <div>
                <dt>Proposed title</dt>
                <dd>{application.paperTitle ?? "None (attendee)"}</dd>
              </div>
              <div>
                <dt>Extended abstract</dt>
                <dd>{application.abstractFileName ?? "None uploaded"}</dd>
              </div>
            </dl>
            {pdfUrl ? (
              <iframe
                title={`Extended abstract from ${application.name}`}
                src={pdfUrl}
                style={{
                  marginTop: 16,
                  width: "100%",
                  height: "72vh",
                  border: "1px solid var(--adm-rule)",
                  borderRadius: 6,
                  background: "var(--adm-canvas)",
                }}
                data-testid="abstract-preview"
              />
            ) : null}
          </Panel>

          <Panel
            title="Programme committee reviews"
            note="Assign one or more reviewers. Each one decides whether to shortlist it. You confirm that shortlist only after the Turnitin check, and that is when the author can pay."
            flush
          >
            <form
              action={assignReviewerAction}
              className="adm-form"
              style={{ gridTemplateColumns: "minmax(0,1fr) auto auto", alignItems: "end", padding: "4px 20px 16px" }}
            >
              <input type="hidden" name="applicationId" value={application.id} />
              <label className="adm-field">
                <span className="adm-label">Reviewer</span>
                <select name="reviewerId" required defaultValue="" className="adm-select" data-testid="reviewer-select">
                  <option value="" disabled>
                    Choose a reviewer
                  </option>
                  {reviewers.map((r) => (
                    <option key={r.id} value={r.id} disabled={assigned.has(r.id)}>
                      {r.name} ({r.email}){assigned.has(r.id) ? ", assigned" : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label className="adm-field">
                <span className="adm-label">Due by</span>
                <input type="date" name="dueAt" className="adm-input" />
              </label>
              <button type="submit" className="adm-btn is-primary" data-testid="assign-reviewer">
                Assign
              </button>
            </form>
            {reviewers.length === 0 ? (
              <p className="adm-hint" style={{ padding: "0 20px 14px" }}>
                No one can review yet. Give an account the Reviewer role on the{" "}
                <Link className="adm-link" href="/admin/users">Users</Link> page.
              </p>
            ) : null}

            {application.reviews.length === 0 ? (
              <div style={{ borderTop: "1px solid var(--adm-rule)" }}>
                <Empty title="No reviewers assigned" />
              </div>
            ) : (
              <ul className="adm-list" style={{ borderTop: "1px solid var(--adm-rule)" }}>
                {application.reviews.map((review) => (
                  <li key={review.id} style={{ display: "block" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
                      <div>
                        <strong>{review.reviewer.name}</strong>{" "}
                        <span className="adm-hint">{review.reviewer.email}</span>
                        <div style={{ marginTop: 4, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                          <Badge tone={review.status === "COMPLETED" ? "good" : "neutral"}>{sentence(review.status)}</Badge>
                          {review.dueAt ? (
                            <span className="adm-hint">
                              Due {istDate(review.dueAt)}
                              {review.status !== "COMPLETED" && review.dueAt < new Date() ? ", overdue" : ""}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <form action={removeReviewerAction}>
                        <input type="hidden" name="reviewId" value={review.id} />
                        <button type="submit" className="adm-btn is-quiet is-bad is-small">
                          Unassign
                        </button>
                      </form>
                    </div>
                    {review.decision || review.recommendation || review.publicComments || review.confidentialComments ? (
                      <dl className="adm-dl" style={{ marginTop: 10 }}>
                        <div>
                          <dt>{review.decision ? "Decision" : "Recommendation"}</dt>
                          <dd>
                            {review.decision
                              ? REVIEW_DECISION_LABELS[review.decision]
                              : review.recommendation
                                ? sentence(review.recommendation)
                                : "Not given"}
                          </dd>
                        </div>
                        <div>
                          <dt>Comments for the author</dt>
                          <dd style={{ whiteSpace: "pre-wrap" }}>{review.publicComments || "None"}</dd>
                        </div>
                        <div>
                          <dt>Confidential to the committee</dt>
                          <dd style={{ whiteSpace: "pre-wrap" }}>{review.confidentialComments || "None"}</dd>
                        </div>
                      </dl>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="adm-stack">
          {presenting ? (
            <Panel
              title="Turnitin check"
              note="After a reviewer shortlists this submission, check it and record the result. Official shortlist, and payment, stay closed until you do."
            >
              <form action={recordPlagiarismCheckAction} className="adm-form">
                <input type="hidden" name="applicationId" value={application.id} />
                <label className="adm-field">
                  <span className="adm-label">Result</span>
                  <select
                    name="plagiarismStatus"
                    defaultValue={application.plagiarismStatus}
                    className="adm-select"
                    data-testid="plagiarism-status"
                  >
                    {Object.entries(PLAGIARISM_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="adm-field">
                  <span className="adm-label">Notes</span>
                  <textarea
                    name="plagiarismNotes"
                    rows={3}
                    defaultValue={application.plagiarismNotes ?? ""}
                    className="adm-textarea"
                    placeholder="Similarity score, report link, or anything else you checked."
                  />
                </label>
                <div>
                  <button type="submit" className="adm-btn is-primary" data-testid="save-plagiarism">
                    Save check
                  </button>
                </div>
              </form>
              <p className="adm-hint" style={{ marginTop: 10 }}>
                {application.plagiarismCheckedAt
                  ? `Recorded ${istDateTime(application.plagiarismCheckedAt)}.`
                  : reviewerShortlisted(application.reviews)
                    ? "A reviewer has shortlisted this. It is waiting for this check."
                    : "Waiting for a reviewer to shortlist it."}
              </p>
            </Panel>
          ) : null}

          <Panel title="Decision">
            {presenting && reviewerSummary ? (
              <p className="adm-hint" style={{ marginBottom: 12 }}>
                Reviewer decisions: {reviewerSummary}.
              </p>
            ) : null}
            {presenting && shortlistBlock ? (
              <p className="adm-hint" style={{ marginBottom: 12 }} data-testid="shortlist-hint">
                {shortlistBlock}
              </p>
            ) : null}
            <ApplicationReviewDialog
              id={application.id}
              name={application.name}
              currentStatus={application.status}
              adminNotes={application.adminNotes ?? ""}
              feePaise={reviewFeePaise(application)}
              shortlistBlock={shortlistBlock}
              plagiarismFlagged={application.plagiarismStatus === "FLAGGED"}
            />
          </Panel>

          <ApplicationPaymentPanel
            id={application.id}
            paymentStatus={application.paymentStatus}
            feeLabel={feeStatusLabel(application)}
            paymentAmountPaise={reviewFeePaise(application)}
            paymentUrl={conferencePaymentUrl(application.paymentToken)}
            paymentRef={application.paymentRef}
            paidAt={application.paidAt ? istDateTime(application.paidAt) : null}
            payerId={application.payerId}
            transactions={application.gatewayPayments.map((p) => ({
              transId: p.transId,
              amount: p.amount,
              label: gatewayStatusLabel(p),
              tone: gatewayTone(p),
              verified: p.verified,
            }))}
            proforma={{
              count: proforma?.count ?? 0,
              lastSent: proforma?.lastSentAt ? istDateTime(proforma.lastSentAt) : null,
            }}
            proformaAction={
              applicationFeeDue(application) ? (
                <ConfirmActionForm
                  action={resendProformaAction}
                  fields={{ applicationId: application.id, returnTo: `/admin/applications/${application.id}` }}
                  label={proforma ? "Resend proforma invoice" : "Send proforma invoice"}
                  prompt={`Email the proforma invoice to ${application.email}?`}
                  confirmLabel="Send"
                  pendingLabel="Sending…"
                  small
                  testId="resend-proforma"
                />
              ) : null
            }
          />

          <DeleteApplicationForm id={application.id} name={application.name} />
        </div>
      </div>
    </div>
  );
}
