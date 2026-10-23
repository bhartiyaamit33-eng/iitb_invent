"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { writeAuditLog } from "@/lib/admin/audit";
import { requireAdmin } from "@/lib/auth/roles";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { deleteConferenceApplication } from "@/lib/conference-delete";
import { isPlagiarismStatus } from "@/lib/review-flow";

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

export async function recordPlagiarismCheckAction(formData: FormData) {
  const actor = requireAdmin(await getCurrentUser());
  const applicationId = String(formData.get("applicationId") ?? "");
  const plagiarismStatus = String(formData.get("plagiarismStatus") ?? "");
  const plagiarismNotes = String(formData.get("plagiarismNotes") ?? "").trim() || null;
  if (!applicationId || !isPlagiarismStatus(plagiarismStatus)) {
    throw new Error("Choose a Turnitin result.");
  }

  const before = await prisma.conferenceApplication.findUnique({
    where: { id: applicationId },
    select: { id: true, plagiarismStatus: true, plagiarismNotes: true },
  });
  if (!before) throw new Error("Application not found.");

  const checked = plagiarismStatus !== "NOT_CHECKED";
  await prisma.conferenceApplication.update({
    where: { id: applicationId },
    data: {
      plagiarismStatus,
      plagiarismNotes,
      plagiarismCheckedAt: checked ? new Date() : null,
    },
  });
  await writeAuditLog({
    actorId: actor.id,
    action: "application.plagiarism",
    entityType: "ConferenceApplication",
    entityId: applicationId,
    before,
    after: { plagiarismStatus, plagiarismNotes },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${applicationId}`);
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
  revalidatePath("/research");
  redirect("/admin/applications?deleted=1");
}
