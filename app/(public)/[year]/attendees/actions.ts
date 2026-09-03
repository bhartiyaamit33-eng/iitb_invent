"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/admin/audit";
import { sendConnectionRequest } from "@/lib/email/transactions";

export async function sendConnectionRequestAction(
  formData: FormData,
): Promise<{ ok: true; emailed: boolean } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in required" };

  const toUserId = String(formData.get("toUserId") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  const year = String(formData.get("year") ?? "").trim();
  if (!toUserId || message.length < 10) {
    return { ok: false, error: "Write a short note (10+ characters)" };
  }
  if (toUserId === user.id) {
    return { ok: false, error: "You cannot request yourself" };
  }

  const edition = year
    ? await prisma.edition.findUnique({ where: { slug: year } })
    : await prisma.edition.findFirst({ where: { isCurrent: true } });
  if (!edition) return { ok: false, error: "Edition not found" };

  const [fromReg, toUser, fromFull] = await Promise.all([
    prisma.registration.findUnique({
      where: {
        userId_editionId: { userId: user.id, editionId: edition.id },
      },
    }),
    prisma.user.findFirst({
      where: { id: toUserId, deletedAt: null },
      include: { profile: true },
    }),
    prisma.user.findUnique({
      where: { id: user.id },
      include: { profile: true },
    }),
  ]);

  if (!fromReg || fromReg.status !== "CONFIRMED") {
    return { ok: false, error: "Confirm your registration first" };
  }
  if (!toUser?.profile?.directoryOptIn) {
    return { ok: false, error: "That person is not in the directory" };
  }

  const recent = await prisma.connectionRequest.count({
    where: {
      fromUserId: user.id,
      toUserId,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });
  if (recent > 0) {
    return { ok: false, error: "You already sent a request in the last 24h" };
  }

  const dayCount = await prisma.connectionRequest.count({
    where: {
      fromUserId: user.id,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });
  if (dayCount >= 15) {
    return { ok: false, error: "Daily connection request limit reached" };
  }

  const created = await prisma.connectionRequest.create({
    data: {
      fromUserId: user.id,
      toUserId,
      message: message.slice(0, 800),
      editionId: edition.id,
    },
  });

  const mail = await sendConnectionRequest({
    to: toUser.email,
    toName: toUser.name,
    fromName: fromFull?.name ?? user.name,
    fromEmail: user.email,
    fromPhone: fromFull?.profile?.phone,
    fromLinkedIn: fromFull?.profile?.linkedinUrl,
    fromHeadline: fromFull?.profile?.headline,
    message: created.message,
    editionName: edition.name,
    actorId: user.id,
    requestId: created.id,
  });

  await writeAuditLog({
    actorId: user.id,
    action: "connection_request.create",
    entityType: "ConnectionRequest",
    entityId: created.id,
    after: { toUserId, emailed: mail.ok },
  });

  return { ok: true, emailed: mail.ok };
}
