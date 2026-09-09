"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { isS3Configured, uploadSubmissionFile } from "@/lib/s3";
import {
  parsePayerCategory,
  parseSubmissionKind,
} from "@/lib/payments/pricing";

export async function createSubmissionAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?callbackUrl=/dashboard/submissions");
  }

  const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
  if (!edition) {
    redirect("/dashboard/submissions?error=edition");
  }

  const kind = parseSubmissionKind(String(formData.get("kind") ?? ""));
  const payerCategory = parsePayerCategory(
    String(formData.get("payerCategory") ?? ""),
  );
  const title = String(formData.get("title") ?? "").trim();
  const abstract = String(formData.get("abstract") ?? "").trim() || null;
  const authors = String(formData.get("authors") ?? "").trim() || null;
  const organisation =
    String(formData.get("organisation") ?? "").trim() || null;

  if (!kind || !payerCategory || title.length < 3) {
    redirect("/dashboard/submissions?error=invalid");
  }

  const id = `c${randomBytes(12).toString("hex")}`;
  const file = formData.get("file");
  let fileUrl: string | null = null;

  if (file instanceof File && file.size > 0) {
    if (!isS3Configured()) {
      redirect("/dashboard/submissions?error=upload");
    }
    try {
      const bytes = Buffer.from(await file.arrayBuffer());
      const uploaded = await uploadSubmissionFile({
        submissionId: id,
        bytes,
        contentType: file.type || "application/pdf",
      });
      fileUrl = uploaded.url;
    } catch {
      redirect("/dashboard/submissions?error=upload");
    }
  }

  await prisma.submission.create({
    data: {
      id,
      editionId: edition.id,
      userId: user.id,
      kind,
      title,
      abstract,
      authors,
      organisation,
      fileUrl,
      payerCategory,
      status: "SUBMITTED",
    },
  });

  redirect("/dashboard/submissions?submitted=1");
}

export async function withdrawSubmissionAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "");
  const submission = await prisma.submission.findUnique({ where: { id } });
  if (
    !submission ||
    submission.userId !== user.id ||
    submission.status !== "SUBMITTED"
  ) {
    redirect("/dashboard/submissions?error=withdraw");
  }

  await prisma.submission.update({
    where: { id },
    data: { status: "WITHDRAWN" },
  });
  redirect("/dashboard/submissions");
}
