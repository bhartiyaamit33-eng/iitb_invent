import { redirect } from "next/navigation";
import { ReviewRecommendation, Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { participationLabel } from "@/lib/conference";
import { saveAssignedReviewAction } from "./actions";

export const dynamic = "force-dynamic";

const RECOMMENDATION_LABELS: Record<ReviewRecommendation, string> = {
  STRONG_ACCEPT: "Strong accept",
  ACCEPT: "Accept",
  WEAK_ACCEPT: "Weak accept",
  BORDERLINE: "Borderline",
  WEAK_REJECT: "Weak reject",
  REJECT: "Reject",
};

export default async function AssignedReviewsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/dashboard/reviews");
  if (user.role !== Role.REVIEWER && user.role !== Role.ADMIN) {
    redirect("/dashboard");
  }

  const reviews = await prisma.applicationReview.findMany({
    where: { reviewerId: user.id },
    include: {
      application: {
        include: { edition: { select: { name: true, year: true } } },
      },
    },
    orderBy: [{ status: "asc" }, { dueAt: "asc" }, { assignedAt: "desc" }],
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
        Read each abstract, save a draft, and submit an independent recommendation.
      </p>

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
                    href={`/api/conference/abstract/${application.abstractViewToken}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-block rounded-md border border-line px-4 py-2 text-sm font-semibold text-teal-deep"
                  >
                    Open abstract PDF ↗
                  </a>
                ) : (
                  <p className="mt-4 text-sm text-amber-800">No abstract PDF uploaded.</p>
                )}

                <form action={saveAssignedReviewAction} className="mt-5 space-y-4">
                  <input type="hidden" name="reviewId" value={review.id} />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <label className="text-sm">
                      <span className="text-ink">Recommendation</span>
                      <select
                        name="recommendation"
                        defaultValue={review.recommendation ?? ""}
                        className="mt-1.5 w-full rounded-md border border-line px-3 py-2.5"
                      >
                        <option value="">Choose…</option>
                        {Object.entries(RECOMMENDATION_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-sm">
                      <span className="text-ink">Overall score (1–10)</span>
                      <input
                        type="number"
                        name="score"
                        min={1}
                        max={10}
                        defaultValue={review.score ?? ""}
                        className="mt-1.5 w-full rounded-md border border-line px-3 py-2.5"
                      />
                    </label>
                    <label className="text-sm">
                      <span className="text-ink">Expertise (1–5)</span>
                      <input
                        type="number"
                        name="expertise"
                        min={1}
                        max={5}
                        defaultValue={review.expertise ?? ""}
                        className="mt-1.5 w-full rounded-md border border-line px-3 py-2.5"
                      />
                    </label>
                  </div>
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
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      name="intent"
                      value="draft"
                      className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-teal-deep"
                    >
                      Save draft
                    </button>
                    <button
                      type="submit"
                      name="intent"
                      value="submit"
                      className="rounded-md bg-teal-deep px-4 py-2 text-sm font-semibold text-white"
                      data-testid={`submit-review-${review.id}`}
                    >
                      Submit review
                    </button>
                  </div>
                </form>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
