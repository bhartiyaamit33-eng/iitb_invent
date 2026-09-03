"use server";

import { revalidatePath } from "next/cache";
import { SessionFormat } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/admin/audit";

/** Treat naked datetime-local strings as Asia/Kolkata wall time. */
function parseIstDate(raw: string): Date {
  const v = raw.trim();
  if (!v) return new Date();
  if (/[zZ]|[+-]\d{2}:\d{2}$/.test(v)) return new Date(v);
  const normalized = v.length === 16 ? `${v}:00` : v;
  return new Date(`${normalized}+05:30`);
}

async function actor() {
  const user = await getCurrentUser();
  return requireAdmin(user);
}

export async function updateSessionAction(formData: FormData) {
  const user = await actor();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const room = String(formData.get("room") ?? "").trim() || null;
  const floor = String(formData.get("floor") ?? "").trim() || null;
  const format = String(formData.get("format") ?? "NETWORKING") as SessionFormat;
  const startsAt = parseIstDate(String(formData.get("startsAt") ?? ""));
  const endsAt = parseIstDate(String(formData.get("endsAt") ?? ""));
  const isPublished = formData.get("isPublished") === "on";
  const sortOrder = Number(formData.get("sortOrder") ?? 0);

  const before = await prisma.session_.findUnique({ where: { id } });
  const after = await prisma.session_.update({
    where: { id },
    data: {
      title,
      description,
      room,
      floor,
      format,
      startsAt,
      endsAt,
      isPublished,
      sortOrder,
    },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "session.update",
    entityType: "Session_",
    entityId: id,
    before,
    after,
  });
  revalidatePath("/admin/sessions");
  revalidatePath("/programme");
}

export async function createSessionAction(formData: FormData) {
  const user = await actor();
  const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
  if (!edition) throw new Error("No current edition");

  const title = String(formData.get("title") ?? "").trim();
  const slugBase = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const slug = `${slugBase}-${Date.now().toString(36)}`;

  const created = await prisma.session_.create({
    data: {
      editionId: edition.id,
      title: title || "New session",
      slug,
      description: String(formData.get("description") ?? "") || null,
      format: (String(formData.get("format") ?? "NETWORKING") as SessionFormat),
      startsAt: parseIstDate(String(formData.get("startsAt") ?? "")),
      endsAt: parseIstDate(String(formData.get("endsAt") ?? "")),
      room: String(formData.get("room") ?? "") || "DSSE Building",
      isPublished: formData.get("isPublished") === "on",
      sortOrder: Number(formData.get("sortOrder") ?? 99),
    },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "session.create",
    entityType: "Session_",
    entityId: created.id,
    after: created,
  });
  revalidatePath("/admin/sessions");
  revalidatePath("/programme");
}

export async function softDeleteSessionAction(formData: FormData) {
  const user = await actor();
  const id = String(formData.get("id") ?? "");
  const before = await prisma.session_.findUnique({ where: { id } });
  await prisma.session_.update({
    where: { id },
    data: { deletedAt: new Date(), isPublished: false },
  });
  await writeAuditLog({
    actorId: user.id,
    action: "session.soft_delete",
    entityType: "Session_",
    entityId: id,
    before,
  });
  revalidatePath("/admin/sessions");
  revalidatePath("/programme");
}

export async function updateSpeakerAction(formData: FormData) {
  const user = await actor();
  const id = String(formData.get("id") ?? "");
  const data = {
    name: String(formData.get("name") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim() || null,
    organisation: String(formData.get("organisation") ?? "").trim() || null,
    bio: String(formData.get("bio") ?? "").trim() || null,
    linkedinUrl: String(formData.get("linkedinUrl") ?? "").trim() || null,
    isKeynote: formData.get("isKeynote") === "on",
    isPublished: formData.get("isPublished") === "on",
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  };
  const before = await prisma.speaker.findUnique({ where: { id } });
  const after = await prisma.speaker.update({ where: { id }, data });
  await writeAuditLog({
    actorId: user.id,
    action: "speaker.update",
    entityType: "Speaker",
    entityId: id,
    before,
    after,
  });
  revalidatePath("/admin/speakers");
  revalidatePath("/programme");
}

export async function createSpeakerAction(formData: FormData) {
  const user = await actor();
  const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
  if (!edition) throw new Error("No current edition");
  const created = await prisma.speaker.create({
    data: {
      editionId: edition.id,
      name: String(formData.get("name") ?? "New speaker").trim(),
      title: String(formData.get("title") ?? "") || null,
      organisation: String(formData.get("organisation") ?? "") || null,
      bio: String(formData.get("bio") ?? "") || null,
      isKeynote: formData.get("isKeynote") === "on",
      isPublished: formData.get("isPublished") === "on",
      sortOrder: Number(formData.get("sortOrder") ?? 99),
    },
  });
  await writeAuditLog({
    actorId: user.id,
    action: "speaker.create",
    entityType: "Speaker",
    entityId: created.id,
    after: created,
  });
  revalidatePath("/admin/speakers");
}

export async function updatePageAction(formData: FormData) {
  const user = await actor();
  const id = String(formData.get("id") ?? "");
  const data = {
    title: String(formData.get("title") ?? "").trim(),
    body: String(formData.get("body") ?? ""),
    isPublished: formData.get("isPublished") === "on",
  };
  const before = await prisma.page.findUnique({ where: { id } });
  const after = await prisma.page.update({ where: { id }, data });
  await writeAuditLog({
    actorId: user.id,
    action: "page.update",
    entityType: "Page",
    entityId: id,
    before,
    after,
  });
  revalidatePath("/admin/pages");
}

export async function updateFaqAction(formData: FormData) {
  const user = await actor();
  const id = String(formData.get("id") ?? "");
  const data = {
    question: String(formData.get("question") ?? "").trim(),
    answer: String(formData.get("answer") ?? ""),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    isPublished: formData.get("isPublished") === "on",
  };
  const before = await prisma.faq.findUnique({ where: { id } });
  const after = await prisma.faq.update({ where: { id }, data });
  await writeAuditLog({
    actorId: user.id,
    action: "faq.update",
    entityType: "Faq",
    entityId: id,
    before,
    after,
  });
  revalidatePath("/admin/faqs");
}

export async function createFaqAction(formData: FormData) {
  const user = await actor();
  const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
  if (!edition) throw new Error("No current edition");
  const created = await prisma.faq.create({
    data: {
      editionId: edition.id,
      question: String(formData.get("question") ?? "New question"),
      answer: String(formData.get("answer") ?? ""),
      sortOrder: Number(formData.get("sortOrder") ?? 99),
      isPublished: formData.get("isPublished") === "on",
    },
  });
  await writeAuditLog({
    actorId: user.id,
    action: "faq.create",
    entityType: "Faq",
    entityId: created.id,
    after: created,
  });
  revalidatePath("/admin/faqs");
}

export async function updateStatAction(formData: FormData) {
  const user = await actor();
  const id = String(formData.get("id") ?? "");
  const data = {
    label: String(formData.get("label") ?? "").trim(),
    value: String(formData.get("value") ?? "").trim(),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  };
  const before = await prisma.editionStat.findUnique({ where: { id } });
  const after = await prisma.editionStat.update({ where: { id }, data });
  await writeAuditLog({
    actorId: user.id,
    action: "stat.update",
    entityType: "EditionStat",
    entityId: id,
    before,
    after,
  });
  revalidatePath("/admin/stats");
}

export async function createStatAction(formData: FormData) {
  const user = await actor();
  const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
  if (!edition) throw new Error("No current edition");
  const created = await prisma.editionStat.create({
    data: {
      editionId: edition.id,
      label: String(formData.get("label") ?? "Label"),
      value: String(formData.get("value") ?? "0"),
      sortOrder: Number(formData.get("sortOrder") ?? 99),
    },
  });
  await writeAuditLog({
    actorId: user.id,
    action: "stat.create",
    entityType: "EditionStat",
    entityId: created.id,
    after: created,
  });
  revalidatePath("/admin/stats");
}

export async function setEditionCurrentAction(formData: FormData) {
  const user = await actor();
  const id = String(formData.get("id") ?? "");
  await prisma.$transaction([
    prisma.edition.updateMany({ data: { isCurrent: false } }),
    prisma.edition.update({ where: { id }, data: { isCurrent: true } }),
  ]);
  await writeAuditLog({
    actorId: user.id,
    action: "edition.set_current",
    entityType: "Edition",
    entityId: id,
  });
  revalidatePath("/admin/editions");
  revalidatePath("/programme");
  revalidatePath("/now");
}

export async function setEditionStatusAction(formData: FormData) {
  const user = await actor();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "ANNOUNCED") as
    | "DRAFT"
    | "ANNOUNCED"
    | "REGISTRATION_OPEN"
    | "LIVE"
    | "ARCHIVED";
  await prisma.edition.update({ where: { id }, data: { status } });
  await writeAuditLog({
    actorId: user.id,
    action: "edition.set_status",
    entityType: "Edition",
    entityId: id,
    after: { status },
  });
  revalidatePath("/admin/editions");
  revalidatePath("/programme");
  revalidatePath("/now");
  revalidatePath("/");
}
