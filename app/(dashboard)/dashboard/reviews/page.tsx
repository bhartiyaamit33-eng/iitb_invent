import Link from "next/link";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { participationLabel } from "@/lib/conference";
import { REVIEW_FORM_CHOICES, savedReviewChoiceLabel } from "@/lib/review-flow";
import { reviewLoadForUser } from "@/lib/review-load";
import { ReviewLoad } from "@/components/dashboard/ReviewLoad";
import { saveAssignedReviewAction } from "./actions";
import { ReviewSubmitButtons } from "./submit-buttons";
import { ensureApplicationNumbers } from "@/lib/application-number";
import { withBasePath } from "@/lib/base-path";

export const dynamic = "force-dynamic";

const SUBMIT_ERRORS: Record<string, string> = {
  incomplete:
    "Choose a recommendation before you submit. Comments for the authors are required too, except for Not my expertise.",
  choice: "Choose a recommendation before you submit.",
  comments:
    "Write comments for the authors before you submit. Not my expertise does not need them.",
  missing: "That assignment is no longer on your list.",
};

export default async function AssignedReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; review?: string; saved?: string; draft?: string; edit?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/dashboard/reviews");
  if (user.role !== Role.REVIEWER && user.role !== Role.ADMIN) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const submitError = params.error ? SUBMIT_ERRORS[params.error] : undefined;

  await ensureApplicationNumbers();
  const { editionId, editionName, counts } = await reviewLoadForUser(user.id);
  const reviews = await prisma.applicationReview.findMany({
    where: {
      reviewerId: user.id,
      ...(editionId ? { application: { editionId } } : {}),
    },
    include: {
      application: {
        include: { edition: { select: { name: true, year: true } } },
      },
    },
  });
  const statusRank = { ASSIGNED: 0, IN_PROGRESS: 1, COMPLETED: 2 } as const;
  reviews.sort((a, b) => {
    const byStatus = statusRank[a.status] - statusRank[b.status];
    if (byStatus !== 0) return byStatus;
    const byDue = (a.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER);
    if (byDue !== 0) return byDue;
    return b.assignedAt.getTime() - a.assignedAt.getTime();
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
        Programme committee
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-wide text-teal-deep">
        Assigned reviews
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Read each abstract and choose a recommendation. If the topic is outside your field, choose Not my expertise. That choice does not recommend acceptance. Organisers check recommended submissions, including in Turnitin, before the author is officially shortlisted and asked to pay.
      </p>

      <ReviewLoad editionName={editionName} {...counts} />

      {submitError && params.error === "missing" ? (
        <p
          className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {submitError}
        </p>
      ) : null}

      {reviews.length === 0 ? (
        <div className="mt-8 rounded-xl border border-line bg-white p-6 text-sm text-ink-soft">
          No submissions have been assigned to you.
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {reviews.map((review) => {
            const application = review.application;
            return (
              <article
                key={review.id}
                className="rounded-xl border border-line bg-white p-5"
                data-testid={`assigned-review-${review.id}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-mute">
                      {application.applicationNumber ? (
                        <span data-testid="application-number">{application.applicationNumber} · </span>
                      ) : null}
                      {application.edition.name} ·{" "}
                      {participationLabel(
                        application.participationCategory,
                        application.participationOther,
                      )}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-ink">
                      {application.paperTitle || "Untitled submission"}
                    </h2>
                    <p className="mt-1 text-sm text-ink-soft">
                      {application.institution}
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-semibold text-teal-deep">
                      {review.status.replaceAll("_", " ")}
                    </p>
                    {review.dueAt ? (
                      <p className="mt-1 text-mute">
                        Due {review.dueAt.toLocaleDateString("en-IN")}
                      </p>
                    ) : null}
                  </div>
                </div>

                {application.abstractStorageKey ? (
                  <a
                    href={withBasePath(`/api/conference/abstract/${application.abstractViewToken}`)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-block rounded-md border border-line px-4 py-2 text-sm font-semibold text-teal-deep"
                  >
                    Open abstract PDF ↗
                  </a>
                ) : (
                  <p className="mt-4 text-sm text-amber-800">No abstract PDF uploaded.</p>
                )}

                {params.saved === review.id ? (
                  <p
                    className="mt-4 rounded-md border border-line bg-white px-4 py-3 text-sm font-semibold text-teal-deep"
                    role="status"
                    data-testid={`review-saved-${review.id}`}
                  >
                    Decision saved: {savedReviewChoiceLabel(review)}.
                  </p>
                ) : null}
                {params.draft === review.id ? (
                  <p className="mt-4 rounded-md border border-line bg-paper px-4 py-3 text-sm text-ink-soft" role="status">
                    Draft saved. It is not submitted yet.
                  </p>
                ) : null}
                {submitError && params.review === review.id ? (
                  <p
                    className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                    role="alert"
                    data-testid={`review-error-${review.id}`}
                  >
                    {submitError}
                  </p>
                ) : null}

                {review.status === "COMPLETED" && params.edit !== review.id && params.review !== review.id ? (
                  <div className="mt-5 space-y-3 text-sm">
                    <p>
                      <span className="text-mute">Recommendation. </span>
                      <span className="font-semibold text-ink">{savedReviewChoiceLabel(review)}</span>
                    </p>
                    {review.decision === "NOT_MY_EXPERTISE" ? (
                      <p className="text-ink-soft">
                        This does not accept or reject the paper. The organisers can assign another reviewer.
                      </p>
                    ) : null}
                    <p className="whitespace-pre-wrap">
                      <span className="text-mute">Comments for the authors. </span>
                      {review.publicComments || "No comments"}
                    </p>
                    <p className="whitespace-pre-wrap">
                      <span className="text-mute">Confidential comments for admins. </span>
                      {review.confidentialComments || "No comments"}
                    </p>
                    <Link
                      href={`/dashboard/reviews?edit=${review.id}`}
                      className="inline-block rounded-md border border-line px-4 py-2 text-sm font-semibold text-teal-deep"
                    >
                      Change this decision
                    </Link>
                  </div>
                ) : (
                <form action={saveAssignedReviewAction} className="mt-5 space-y-4">
                  <input type="hidden" name="reviewId" value={review.id} />
                  <label className="block max-w-sm text-sm">
                    <span className="text-ink">Recommendation</span>
                    <select
                      name="choice"
                      defaultValue={
                        review.decision === "NOT_MY_EXPERTISE"
                          ? "NOT_MY_EXPERTISE"
                          : (review.recommendation ?? "")
                      }
                      className="mt-1.5 w-full rounded-md border border-line px-3 py-2.5"
                      data-testid={`review-decision-${review.id}`}
                    >
                      <option value="">Choose…</option>
                      {REVIEW_FORM_CHOICES.map((choice) => (
                        <option key={choice.value} value={choice.value}>
                          {choice.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm">
                    <span className="text-ink">Comments for the authors</span>
                    <textarea
                      name="publicComments"
                      rows={6}
                      defaultValue={review.publicComments ?? ""}
                      className="mt-1.5 w-full rounded-md border border-line px-3 py-2.5"
                      placeholder="Strengths, weaknesses, and actionable feedback"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-ink">Confidential comments for admins</span>
                    <textarea
                      name="confidentialComments"
                      rows={4}
                      defaultValue={review.confidentialComments ?? ""}
                      className="mt-1.5 w-full rounded-md border border-line px-3 py-2.5"
                    />
                  </label>
                  <ReviewSubmitButtons reviewId={review.id} />
                  <p className="text-sm text-ink-soft">
                    Save draft keeps what you typed and does not submit it. Submit needs a recommendation. Comments for the authors are required for that recommendation, and optional for Not my expertise. Confidential comments are always optional.
                  </p>
                </form>
                )}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
