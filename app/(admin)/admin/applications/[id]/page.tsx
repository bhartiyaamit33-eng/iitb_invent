import Link from "next/link";
import { notFound } from "next/navigation";
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
} from "@/lib/conference";
import { conferencePaymentUrl } from "@/lib/conference-server";
import { ApplicationReviewDialog } from "@/components/admin/ApplicationReviewDialog";
import { ApplicationPaymentPanel } from "@/components/admin/ApplicationPaymentPanel";
import { DeleteApplicationForm } from "@/components/admin/DeleteApplicationForm";
import { Role } from "@prisma/client";
import { assignReviewerAction, removeReviewerAction } from "./actions";

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
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const application = await prisma.conferenceApplication.findUnique({
    where: { id },
    include: {
      edition: { select: { name: true, year: true } },
      reviews: {
        include: { reviewer: { select: { id: true, name: true, email: true } } },
        orderBy: { assignedAt: "asc" },
      },
    },
  });
  if (!application) notFound();
  const reviewers = await prisma.user.findMany({
    where: {
      deletedAt: null,
      role: { in: [Role.REVIEWER, Role.ADMIN] },
    },
    select: { id: true, name: true, email: true },
    orderBy: [{ name: "asc" }, { email: "asc" }],
  });

  const pdfUrl = application.abstractViewToken
    ? `/api/conference/abstract/${application.abstractViewToken}`
    : null;

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
    [
      "Fee band",
      `${feeBandLabel(feeBandForProfessional(application.professionalCategory))} (${formatInrFromPaise(conferenceFeePaiseFor(application.professionalCategory))})`,
    ],
    ...(needsPhdYear(application.professionalCategory)
      ? ([["PhD year", phdYearLabel(application.phdYear)]] as [string, string][])
      : []),
    ["Seeking post-doc", postdocLabel(application.seekingPostdoc)],
    [
      "Participation",
      participationLabel(
        application.participationCategory,
        application.participationOther,
      ),
    ],
    ["Proposed title", application.paperTitle ?? "-"],
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
      <p className="mt-3 text-sm">
        <a
          href="#delete-submission"
          className="font-semibold text-red-700 underline-offset-2 hover:underline"
        >
          Delete this submission ↓
        </a>
      </p>
      {error === "confirm" ? (
        <p
          className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="alert"
        >
          Type DELETE in the confirm field to remove this submission.
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

      <DeleteApplicationForm id={application.id} name={application.name} />

      <div className="mt-4 rounded-xl border border-line bg-white px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-mute">
          Extended abstract
        </p>
        {pdfUrl ? (
          <>
            <div className="mt-3 flex flex-wrap gap-3">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-teal-deep px-4 py-2 text-sm font-semibold text-white"
                data-testid="view-pdf"
              >
                View PDF
              </a>
              <a
                href={`${pdfUrl}?download=1`}
                className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-teal-deep"
              >
                Download {application.abstractFileName || "PDF"}
              </a>
            </div>
            <iframe
              title="Extended abstract"
              src={pdfUrl}
              className="mt-4 h-[70vh] w-full rounded-md border border-line bg-paper"
              data-testid="abstract-preview"
            />
          </>
        ) : (
          <p className="mt-2 text-sm text-ink-soft">No abstract uploaded.</p>
        )}
      </div>

      <div className="mt-4">
        <ApplicationPaymentPanel
          id={application.id}
          paymentStatus={application.paymentStatus}
          paymentAmountPaise={reviewFeePaise(application)}
          paymentUrl={conferencePaymentUrl(application.paymentToken)}
          paymentRef={application.paymentRef}
          paidAt={application.paidAt ? istDate(application.paidAt) : null}
          opReqId={application.opReqId}
          opTransId={application.opTransId}
          opProvId={application.opProvId}
        />
      </div>

      <div className="mt-6 rounded-xl border border-line bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-mute">
          Review
        </h2>
        <div className="mt-3">
          <ApplicationReviewDialog
            id={application.id}
            name={application.name}
            currentStatus={application.status}
            adminNotes={application.adminNotes ?? ""}
            feePaise={reviewFeePaise(application)}
          />
        </div>
      </div>

      <section className="mt-6 rounded-xl border border-line bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-mute">
          Programme committee reviews
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          Assign this submission independently to one or more reviewers.
        </p>

        <form
          action={assignReviewerAction}
          className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]"
        >
          <input type="hidden" name="applicationId" value={application.id} />
          <label className="text-sm">
            <span className="sr-only">Reviewer</span>
            <select
              name="reviewerId"
              required
              defaultValue=""
              className="w-full rounded-md border border-line px-3 py-2.5"
              data-testid="reviewer-select"
            >
              <option value="" disabled>
                Choose reviewer
              </option>
              {reviewers.map((reviewer) => (
                <option key={reviewer.id} value={reviewer.id}>
                  {reviewer.name} · {reviewer.email}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="sr-only">Due date</span>
            <input
              type="date"
              name="dueAt"
              aria-label="Review due date"
              className="rounded-md border border-line px-3 py-2.5"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-teal-deep px-4 py-2.5 text-sm font-semibold text-white"
            data-testid="assign-reviewer"
          >
            Assign
          </button>
        </form>
        {reviewers.length === 0 ? (
          <p className="mt-3 text-sm text-amber-800">
            Grant a user the Reviewer role on the Users page before assigning.
          </p>
        ) : null}

        <div className="mt-5 space-y-3">
          {application.reviews.length === 0 ? (
            <p className="text-sm text-mute">No reviewers assigned yet.</p>
          ) : (
            application.reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-lg border border-line bg-paper px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">
                      {review.reviewer.name}
                    </p>
                    <p className="text-xs text-mute">{review.reviewer.email}</p>
                    <p className="mt-1 text-xs font-semibold text-teal-deep">
                      {review.status.replaceAll("_", " ")}
                      {review.dueAt ? ` · due ${review.dueAt.toLocaleDateString("en-IN")}` : ""}
                    </p>
                  </div>
                  <form action={removeReviewerAction}>
                    <input type="hidden" name="reviewId" value={review.id} />
                    <button
                      type="submit"
                      className="text-xs font-semibold text-red-700 hover:underline"
                    >
                      Unassign
                    </button>
                  </form>
                </div>
                {review.recommendation ? (
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="text-xs uppercase text-mute">Recommendation</dt>
                      <dd>{review.recommendation.replaceAll("_", " ")}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-mute">Score</dt>
                      <dd>{review.score ?? "-"} / 10</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-mute">Expertise</dt>
                      <dd>{review.expertise ?? "-"} / 5</dd>
                    </div>
                    <div className="sm:col-span-3">
                      <dt className="text-xs uppercase text-mute">Author-facing comments</dt>
                      <dd className="whitespace-pre-wrap">{review.publicComments || "-"}</dd>
                    </div>
                    <div className="sm:col-span-3">
                      <dt className="text-xs uppercase text-mute">Confidential committee comments</dt>
                      <dd className="whitespace-pre-wrap">{review.confidentialComments || "-"}</dd>
                    </div>
                  </dl>
                ) : null}
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
