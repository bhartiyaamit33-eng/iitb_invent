"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SubmissionStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/admin/audit";
import {
  parsePayerCategory,
  parseSubmissionKind,
} from "@/lib/payments/pricing";
import {
  createOrReusePayment,
  emailPaymentLink,
  issueInvoiceEmail,
} from "@/lib/payments/service";

async function actor() {
  const user = await getCurrentUser();
  return requireAdmin(user);
}

export async function approveAndSendPaymentAction(formData: FormData) {
  const user = await actor();
  const id = String(formData.get("id") ?? "");
  const category =
    parsePayerCategory(String(formData.get("payerCategory") ?? "")) ?? undefined;
  const note = String(formData.get("reviewNote") ?? "").trim() || null;

  const before = await prisma.submission.findUnique({ where: { id } });
  if (!before || before.deletedAt) {
    redirect("/admin/submissions?error=missing");
  }

  const after = await prisma.submission.update({
    where: { id },
    data: {
      status: "APPROVED",
      payerCategory: category ?? before.payerCategory,
      reviewNote: note,
      reviewedAt: new Date(),
      reviewedById: user.id,
    },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "submission.approve",
    entityType: "Submission",
    entityId: id,
    before,
    after,
  });

  const payment = await createOrReusePayment({
    submissionId: id,
    payerCategory: after.payerCategory,
    actorId: user.id,
  });
  const mailed = await emailPaymentLink(payment.id, user.id);
  revalidatePath("/admin/submissions");
  revalidatePath("/admin/payments");
  redirect(
    mailed.ok
      ? "/admin/submissions?sent=1"
      : `/admin/submissions?sent=1&mail=${encodeURIComponent(mailed.error ?? "email_failed")}`,
  );
}

export async function rejectSubmissionAction(formData: FormData) {
  const user = await actor();
  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("reviewNote") ?? "").trim() || null;

  const before = await prisma.submission.findUnique({ where: { id } });
  if (!before) redirect("/admin/submissions?error=missing");

  const after = await prisma.submission.update({
    where: { id },
    data: {
      status: "REJECTED",
      reviewNote: note,
      reviewedAt: new Date(),
      reviewedById: user.id,
    },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "submission.reject",
    entityType: "Submission",
    entityId: id,
    before,
    after,
  });
  revalidatePath("/admin/submissions");
  redirect("/admin/submissions?rejected=1");
}

export async function resendPaymentLinkAction(formData: FormData) {
  const user = await actor();
  const paymentId = String(formData.get("paymentId") ?? "");
  const mailed = await emailPaymentLink(paymentId, user.id);
  revalidatePath("/admin/payments");
  revalidatePath("/admin/submissions");
  redirect(
    mailed.ok
      ? "/admin/payments?link=1"
      : `/admin/payments?error=${encodeURIComponent(mailed.error ?? "email_failed")}`,
  );
}

export async function resendInvoiceAction(formData: FormData) {
  const user = await actor();
  const paymentId = String(formData.get("paymentId") ?? "");
  const mailed = await issueInvoiceEmail(paymentId);
  await writeAuditLog({
    actorId: user.id,
    action: "payment.invoice_resend",
    entityType: "Payment",
    entityId: paymentId,
    after: mailed,
  });
  revalidatePath("/admin/payments");
  redirect(
    mailed.ok
      ? "/admin/payments?invoice=1"
      : `/admin/payments?error=${encodeURIComponent(mailed.error ?? "email_failed")}`,
  );
}

export async function adminCreateSubmissionAction(formData: FormData) {
  const user = await actor();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const kind = parseSubmissionKind(String(formData.get("kind") ?? ""));
  const payerCategory = parsePayerCategory(
    String(formData.get("payerCategory") ?? ""),
  );
  const title = String(formData.get("title") ?? "").trim();
  const abstract = String(formData.get("abstract") ?? "").trim() || null;
  const sendLink = formData.get("sendLink") === "on";

  if (!email || !kind || !payerCategory || title.length < 3) {
    redirect("/admin/submissions?error=invalid");
  }

  const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
  const author = await prisma.user.findUnique({ where: { email } });
  if (!edition || !author) {
    redirect("/admin/submissions?error=user");
  }

  const created = await prisma.submission.create({
    data: {
      editionId: edition.id,
      userId: author.id,
      kind,
      title,
      abstract,
      organisation: String(formData.get("organisation") ?? "").trim() || null,
      payerCategory,
      status: sendLink ? "APPROVED" : "SUBMITTED",
      reviewedAt: sendLink ? new Date() : null,
      reviewedById: sendLink ? user.id : null,
    },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "submission.create",
    entityType: "Submission",
    entityId: created.id,
    after: created,
  });

  if (sendLink) {
    const payment = await createOrReusePayment({
      submissionId: created.id,
      payerCategory,
      actorId: user.id,
    });
    await emailPaymentLink(payment.id, user.id);
  }

  revalidatePath("/admin/submissions");
  redirect("/admin/submissions?created=1");
}

export async function setSubmissionStatusAction(formData: FormData) {
  const user = await actor();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as SubmissionStatus;
  if (!["SUBMITTED", "APPROVED", "REJECTED", "WITHDRAWN"].includes(status)) {
    redirect("/admin/submissions?error=invalid");
  }
  await prisma.submission.update({
    where: { id },
    data: { status, reviewedAt: new Date(), reviewedById: user.id },
  });
  revalidatePath("/admin/submissions");
}
