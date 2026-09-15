"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { writeAuditLog } from "@/lib/admin/audit";
import { requireAdmin } from "@/lib/auth/roles";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { deleteConferenceApplication } from "@/lib/conference-delete";

export async function assignReviewerAction(formData: FormData) {
  const actor = requireAdmin(await getCurrentUser());
  const applicationId = String(formData.get("applicationId") ?? "");
  const reviewerId = String(formData.get("reviewerId") ?? "");
  const dueRaw = String(formData.get("dueAt") ?? "").trim();
  if (!applicationId || !reviewerId) throw new Error("Choose a reviewer.");

  const reviewer = await prisma.user.findFirst({
    where: {
      id: reviewerId,
      deletedAt: null,
      role: { in: [Role.REVIEWER, Role.ADMIN] },
    },
    select: { id: true, email: true },
  });
  if (!reviewer) {
    throw new Error("The selected user needs Reviewer or Admin access.");
  }

  const existing = await prisma.applicationReview.findUnique({
    where: { applicationId_reviewerId: { applicationId, reviewerId } },
    select: { id: true },
  });
  const review = await prisma.applicationReview.upsert({
    where: { applicationId_reviewerId: { applicationId, reviewerId } },
    create: {
      applicationId,
      reviewerId,
      assignedById: actor.id,
      dueAt: dueRaw ? new Date(`${dueRaw}T23:59:59+05:30`) : null,
    },
    update: {
      assignedById: actor.id,
      dueAt: dueRaw ? new Date(`${dueRaw}T23:59:59+05:30`) : null,
    },
  });
  if (!existing) {
    await prisma.userNotification.create({
      data: {
        userId: reviewerId,
        title: "New research review assigned",
        body: "A colloquium submission is ready for your review.",
        href: "/dashboard/reviews",
      },
    });
  }

  await writeAuditLog({
    actorId: actor.id,
    action: "review.assign",
    entityType: "ApplicationReview",
    entityId: review.id,
    after: { applicationId, reviewerId, reviewerEmail: reviewer.email, dueAt: review.dueAt },
  });
  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath("/admin/applications");
  revalidatePath("/dashboard/reviews");
}

export async function removeReviewerAction(formData: FormData) {
  const actor = requireAdmin(await getCurrentUser());
  const reviewId = String(formData.get("reviewId") ?? "");
  if (!reviewId) throw new Error("Missing review assignment.");

  const review = await prisma.applicationReview.delete({
    where: { id: reviewId },
    select: { id: true, applicationId: true, reviewerId: true },
  });
  await writeAuditLog({
    actorId: actor.id,
    action: "review.unassign",
    entityType: "ApplicationReview",
    entityId: review.id,
    before: review,
  });
  revalidatePath(`/admin/applications/${review.applicationId}`);
  revalidatePath("/admin/applications");
  revalidatePath("/dashboard/reviews");
}

export async function deleteApplicationAction(formData: FormData) {
  const actor = requireAdmin(await getCurrentUser());
  const applicationId = String(formData.get("applicationId") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const fromList = String(formData.get("from") ?? "") === "list";
  const failPath = fromList
    ? "/admin/applications"
    : `/admin/applications/${applicationId}`;
  if (!applicationId) throw new Error("Missing application.");
  if (confirm !== "DELETE") {
    redirect(`${failPath}?error=confirm`);
  }

  const result = await deleteConferenceApplication({
    actorId: actor.id,
    id: applicationId,
  });
  if (!result.ok) {
    redirect(`${failPath}?error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/reviews");
  revalidatePath("/conference");
  redirect("/admin/applications?deleted=1");
}
