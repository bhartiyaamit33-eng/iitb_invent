import { auth } from "@/auth";
import type { AuthUser } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";

/**
 * Resolve the signed-in user from Auth.js (JWT session).
 * Falls back to null when unauthenticated.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return null;

  // The database is authoritative so grants and revocations apply immediately,
  // even when the user's JWT was issued before an administrator changed a role.
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        deletedAt: true,
        createdAt: true,
      },
    });
    if (!user || user.deletedAt) return null;

    return {
      id: user.id,
      email: user.email.trim().toLowerCase(),
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };
  } catch {
    return null;
  }
}
