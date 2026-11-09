import { Role, type ReviewAssignmentStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

export type ReviewCounts = {
  allotted: number;
  pending: number;
  done: number;
  inProgress: number;
};

export function reviewCounts(
  rows: { status: ReviewAssignmentStatus; count: number }[],
): ReviewCounts {
  let allotted = 0;
  let done = 0;
  let inProgress = 0;
  for (const row of rows) {
    allotted += row.count;
    if (row.status === "COMPLETED") done += row.count;
    else if (row.status === "IN_PROGRESS") inProgress += row.count;
  }
  return { allotted, pending: allotted - done, done, inProgress };
}

export type ReviewerLoad = ReviewCounts & {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** The account can no longer be given new reviews. */
  inactive: boolean;
  overdue: number;
};

const personSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  deletedAt: true,
} as const;

/**
 * One row per technical reviewer for the edition, including reviewers who
 * have not been allotted anything yet. Anyone else who already holds an
 * assignment (for example an admin) is included too.
 */
export async function reviewerLoadsForEdition(editionId: string): Promise<ReviewerLoad[]> {
  const editionWhere = { application: { editionId } };
  const [byStatus, overdue, reviewers] = await Promise.all([
    prisma.applicationReview.groupBy({
      by: ["reviewerId", "status"],
      where: editionWhere,
      _count: { _all: true },
    }),
    prisma.applicationReview.groupBy({
      by: ["reviewerId"],
      where: {
        ...editionWhere,
        status: { not: "COMPLETED" },
        dueAt: { lt: new Date() },
      },
      _count: { _all: true },
    }),
    prisma.user.findMany({
      where: { deletedAt: null, role: Role.REVIEWER },
      select: personSelect,
    }),
  ]);

  const known = new Set(reviewers.map((reviewer) => reviewer.id));
  const extraIds = [...new Set(byStatus.map((row) => row.reviewerId))].filter((id) => !known.has(id));
  const extras = extraIds.length
    ? await prisma.user.findMany({ where: { id: { in: extraIds } }, select: personSelect })
    : [];

  const buckets = new Map<string, { status: ReviewAssignmentStatus; count: number }[]>();
  for (const row of byStatus) {
    const list = buckets.get(row.reviewerId) ?? [];
    list.push({ status: row.status, count: row._count._all });
    buckets.set(row.reviewerId, list);
  }
  const overdueById = new Map(overdue.map((row) => [row.reviewerId, row._count._all]));

  return [...reviewers, ...extras]
    .map((person) => ({
      id: person.id,
      name: person.name,
      email: person.email,
      role: person.role,
      inactive: person.deletedAt != null || (person.role !== Role.REVIEWER && person.role !== Role.ADMIN),
      overdue: overdueById.get(person.id) ?? 0,
      ...reviewCounts(buckets.get(person.id) ?? []),
    }))
    .sort(
      (a, b) =>
        b.pending - a.pending ||
        b.allotted - a.allotted ||
        a.name.localeCompare(b.name, "en"),
    );
}

/** Allotted, done, and pending for one reviewer on the current edition. */
export async function reviewLoadForUser(userId: string): Promise<{
  editionId: string | null;
  editionName: string | null;
  counts: ReviewCounts;
}> {
  const edition = await prisma.edition.findFirst({
    where: { isCurrent: true },
    select: { id: true, name: true },
  });
  const rows = await prisma.applicationReview.groupBy({
    by: ["status"],
    where: {
      reviewerId: userId,
      ...(edition ? { application: { editionId: edition.id } } : {}),
    },
    _count: { _all: true },
  });
  return {
    editionId: edition?.id ?? null,
    editionName: edition?.name ?? null,
    counts: reviewCounts(rows.map((row) => ({ status: row.status, count: row._count._all }))),
  };
}
