"use server";

import { revalidatePath } from "next/cache";
import {
  ReviewAssignmentStatus,
  Role,
} from "@prisma/client";
import { writeAuditLog } from "@/lib/admin/audit";
import { getCurrentUser } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { isReviewChoice, isReviewDecision, isReviewRecommendation } from "@/lib/review-flow";

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
  if (!existing) throw new Error("Review assignment not found.");
  if (completing && (!isReviewChoice(choice) || !publicComments)) {
    throw new Error("A recommendation and author-facing comments are required.");
  }

  const chosen = isReviewChoice(choice);
  const review = await prisma.applicationReview.update({
    where: { id: reviewId },
    data: {
      ...(chosen
        ? {
            recommendation: isReviewRecommendation(choice) ? choice : null,
            decision: isReviewDecision(choice) ? choice : null,
          }
        : {}),
      score: null,
      expertise: null,
      publicComments,
      confidentialComments,
      status: completing
        ? ReviewAssignmentStatus.COMPLETED
        : ReviewAssignmentStatus.IN_PROGRESS,
      startedAt: existing.startedAt ?? new Date(),
      submittedAt: completing ? new Date() : existing.submittedAt,
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
  revalidatePath("/dashboard/reviews");
  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${review.applicationId}`);
}
