"use server";

import { revalidatePath } from "next/cache";
import {
  ReviewAssignmentStatus,
  ReviewRecommendation,
  Role,
} from "@prisma/client";
import { writeAuditLog } from "@/lib/admin/audit";
import { getCurrentUser } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";

const RECOMMENDATIONS = new Set<ReviewRecommendation>(
  Object.values(ReviewRecommendation),
);

function boundedInteger(value: FormDataEntryValue | null, min: number, max: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max
    ? parsed
    : null;
}

export async function saveAssignedReviewAction(formData: FormData) {
  const actor = requireRole(await getCurrentUser(), [Role.REVIEWER, Role.ADMIN]);
  const reviewId = String(formData.get("reviewId") ?? "");
  const intent = String(formData.get("intent") ?? "draft");
  const recommendation = String(
    formData.get("recommendation") ?? "",
  ) as ReviewRecommendation;
  const score = boundedInteger(formData.get("score"), 1, 10);
  const expertise = boundedInteger(formData.get("expertise"), 1, 5);
  const publicComments =
    String(formData.get("publicComments") ?? "").trim() || null;
  const confidentialComments =
    String(formData.get("confidentialComments") ?? "").trim() || null;
  const completing = intent === "submit";

  const existing = await prisma.applicationReview.findFirst({
    where: { id: reviewId, reviewerId: actor.id },
  });
  if (!existing) throw new Error("Review assignment not found.");
  if (
    completing &&
    (!RECOMMENDATIONS.has(recommendation) ||
      score === null ||
      expertise === null ||
      !publicComments)
  ) {
    throw new Error(
      "A recommendation, score, expertise rating, and author-facing comments are required.",
    );
  }

  const review = await prisma.applicationReview.update({
    where: { id: reviewId },
    data: {
      recommendation: RECOMMENDATIONS.has(recommendation)
        ? recommendation
        : null,
      score,
      expertise,
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
      recommendation: review.recommendation,
      score: review.score,
    },
  });
  revalidatePath("/dashboard/reviews");
  revalidatePath(`/admin/applications/${review.applicationId}`);
}
