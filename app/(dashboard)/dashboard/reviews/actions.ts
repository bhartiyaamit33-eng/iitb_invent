"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ReviewAssignmentStatus,
  Role,
  type ReviewDecision,
  type ReviewRecommendation,
} from "@prisma/client";
import { writeAuditLog } from "@/lib/admin/audit";
import { getCurrentUser } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { isReviewChoice, isReviewDecision, isReviewRecommendation } from "@/lib/review-flow";

/** A scored recommendation needs author comments. Not my expertise does not. */
function authorCommentsRequired(choice: string): boolean {
  return isReviewRecommendation(choice);
}

function choiceFields(choice: string): {
  recommendation: ReviewRecommendation | null;
  decision: ReviewDecision | null;
} {
  if (!isReviewChoice(choice)) return { recommendation: null, decision: null };
  return {
    recommendation: isReviewRecommendation(choice) ? choice : null,
    decision: isReviewDecision(choice) ? choice : null,
  };
}

export async function saveAssignedReviewAction(formData: FormData) {
  const actor = requireRole(await getCurrentUser(), [Role.REVIEWER, Role.ADMIN]);
  const reviewId = String(formData.get("reviewId") ?? "");
  const intent = String(formData.get("intent") ?? "draft");
  const choice = String(formData.get("choice") ?? "");
  const publicComments =
    String(formData.get("publicComments") ?? "").trim() || null;
  const confidentialComments =
    String(formData.get("confidentialComments") ?? "").trim() || null;
  const completing = intent === "submit";

  const existing = await prisma.applicationReview.findFirst({
    where: { id: reviewId, reviewerId: actor.id },
  });
  if (!existing) redirect("/dashboard/reviews?error=missing");

  const fields = choiceFields(choice);
  if (completing && (!isReviewChoice(choice) || (authorCommentsRequired(choice) && !publicComments))) {
    await prisma.applicationReview.update({
      where: { id: existing.id },
      data: {
        ...fields,
        score: null,
        expertise: null,
        publicComments,
        confidentialComments,
        status: ReviewAssignmentStatus.IN_PROGRESS,
        startedAt: existing.startedAt ?? new Date(),
        submittedAt: null,
      },
    });
    const reason = !isReviewChoice(choice) ? "choice" : "comments";
    redirect(
      `/dashboard/reviews?error=${reason}&review=${encodeURIComponent(existing.id)}&edit=${encodeURIComponent(existing.id)}`,
    );
  }

  const review = await prisma.applicationReview.update({
    where: { id: reviewId },
    data: {
      ...fields,
      score: null,
      expertise: null,
      publicComments,
      confidentialComments,
      status: completing
        ? ReviewAssignmentStatus.COMPLETED
        : ReviewAssignmentStatus.IN_PROGRESS,
      startedAt: existing.startedAt ?? new Date(),
      submittedAt: completing ? new Date() : null,
    },
  });
  await writeAuditLog({
    actorId: actor.id,
    action: completing ? "review.submit" : "review.save_draft",
    entityType: "ApplicationReview",
    entityId: review.id,
    before: { status: existing.status },
    after: {
      status: review.status,
      decision: review.decision,
      recommendation: review.recommendation,
    },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/reviews");
  revalidatePath("/admin");
  revalidatePath("/admin/reviews");
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${review.applicationId}`);
  redirect(
    completing
      ? `/dashboard/reviews?saved=${encodeURIComponent(review.id)}`
      : `/dashboard/reviews?draft=${encodeURIComponent(review.id)}`,
  );
}
