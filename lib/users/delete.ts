import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getAdminEmails, isAdminEmail } from "@/lib/auth/roles";

/**
 * Hard-delete a user and cascaded Auth.js / profile / registration rows.
 * Prisma onDelete: Cascade covers Profile, Registration, Rsvp, Account,
 * Session, ConnectionRequest; AuditLog.actorId is SetNull.
 */
export async function deleteUserAccount(
  userId: string,
  opts: { actorId: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true, deletedAt: true },
  });
  if (!target || target.deletedAt) {
    return { ok: false, error: "User not found" };
  }

  const targetIsAdmin =
    target.role === Role.ADMIN || isAdminEmail(target.email);

  // Admins cannot wipe themselves — another admin must do it.
  if (targetIsAdmin && opts.actorId === userId) {
    return {
      ok: false,
      error: "Admins cannot delete their own account. Ask another admin.",
    };
  }

  if (targetIsAdmin) {
    const adminEmails = getAdminEmails();
    const remainingAdmins = await prisma.user.count({
      where: {
        deletedAt: null,
        id: { not: userId },
        OR: [{ role: Role.ADMIN }, { email: { in: adminEmails } }],
      },
    });
    if (remainingAdmins < 1) {
      return {
        ok: false,
        error: "Cannot delete the last admin account.",
      };
    }
  }

  await prisma.user.delete({ where: { id: userId } });
  return { ok: true };
}
