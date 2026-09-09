"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/admin/audit";
import { parseApplicationStatus } from "@/lib/colloquium";

export async function updateApplicationStatusAction(formData: FormData) {
  const actor = await getCurrentUser();
  requireAdmin(actor);

  const id = String(formData.get("id") ?? "");
  const status = parseApplicationStatus(String(formData.get("status") ?? ""));
  const adminNotes = String(formData.get("adminNotes") ?? "").trim() || null;
  if (!id || !status) {
    throw new Error("Missing application or status");
  }

  const before = await prisma.colloquiumApplication.findUnique({ where: { id } });
  const after = await prisma.colloquiumApplication.update({
    where: { id },
    data: { status, adminNotes },
  });

  await writeAuditLog({
    actorId: actor!.id,
    action: "colloquium.status",
    entityType: "ColloquiumApplication",
    entityId: id,
    before,
    after,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${id}`);
}
