import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/admin/audit";
import { deleteAbstractFile } from "@/lib/abstract-storage";
import { revokeEventTicketIfUnqualified } from "@/lib/conference-access";

export async function deleteConferenceApplication(opts: {
  actorId: string;
  id: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const application = await prisma.conferenceApplication.findUnique({
    where: { id: opts.id },
    select: {
      id: true,
      name: true,
      email: true,
      userId: true,
      editionId: true,
      paperTitle: true,
      status: true,
      paymentStatus: true,
      abstractStorage: true,
      abstractStorageKey: true,
      abstractFileName: true,
    },
  });
  if (!application) {
    return { ok: false, error: "Application not found" };
  }

  await prisma.conferenceApplication.delete({ where: { id: application.id } });
  await deleteAbstractFile({
    storage: application.abstractStorage,
    key: application.abstractStorageKey,
  });
  if (application.userId) {
    await revokeEventTicketIfUnqualified(
      application.userId,
      application.editionId,
    );
  }

  await writeAuditLog({
    actorId: opts.actorId,
    action: "conference.delete",
    entityType: "ConferenceApplication",
    entityId: application.id,
    before: application,
  });

  return { ok: true };
}
