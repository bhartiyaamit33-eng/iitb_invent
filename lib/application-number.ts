import { prisma } from "@/lib/db";

/** Edition prefix for the public application number, e.g. INV2027-001. */
export const APPLICATION_NUMBER_PREFIX = "INV2027-";

const LOCK_KEY = 20270131;

export function formatApplicationNumber(sequence: number): string {
  return `${APPLICATION_NUMBER_PREFIX}${String(sequence).padStart(3, "0")}`;
}

function sequenceOf(value: string | null): number {
  if (!value?.startsWith(APPLICATION_NUMBER_PREFIX)) return 0;
  const n = Number(value.slice(APPLICATION_NUMBER_PREFIX.length));
  return Number.isInteger(n) && n > 0 ? n : 0;
}

/**
 * Give every current-edition registration a number, oldest first.
 * Later calls do nothing once the set is complete. A transaction lock keeps
 * two registrations from taking the same number.
 */
export async function ensureApplicationNumbers(): Promise<void> {
  const missing = await prisma.conferenceApplication.count({
    where: { applicationNumber: null, edition: { isCurrent: true } },
  });
  if (missing === 0) return;

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${BigInt(LOCK_KEY)})`;
    const pending = await tx.conferenceApplication.findMany({
      where: { applicationNumber: null, edition: { isCurrent: true } },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: { id: true },
    });
    if (pending.length === 0) return;

    const used = await tx.conferenceApplication.findMany({
      where: { applicationNumber: { startsWith: APPLICATION_NUMBER_PREFIX } },
      select: { applicationNumber: true },
    });
    let next = 0;
    for (const row of used) next = Math.max(next, sequenceOf(row.applicationNumber));

    for (const row of pending) {
      next += 1;
      await tx.conferenceApplication.update({
        where: { id: row.id },
        data: { applicationNumber: formatApplicationNumber(next) },
      });
    }
  });
}
