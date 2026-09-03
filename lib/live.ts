import { EditionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function getLiveEdition() {
  return prisma.edition.findFirst({
    where: { isCurrent: true },
  });
}

export function isLiveStatus(status: EditionStatus) {
  return status === EditionStatus.LIVE;
}

/** Venue-local "now" as Date (absolute instant). */
export function nowInVenue() {
  return new Date();
}

export async function getHappeningNow(editionId: string, at = new Date()) {
  return prisma.session_.findMany({
    where: {
      editionId,
      deletedAt: null,
      isPublished: true,
      startsAt: { lte: at },
      endsAt: { gte: at },
    },
    orderBy: { startsAt: "asc" },
    include: {
      speakers: { include: { speaker: true } },
    },
  });
}

export async function getUpNext(editionId: string, at = new Date(), limit = 3) {
  const horizon = new Date(at.getTime() + 90 * 60 * 1000);
  return prisma.session_.findMany({
    where: {
      editionId,
      deletedAt: null,
      isPublished: true,
      startsAt: { gt: at, lte: horizon },
    },
    orderBy: { startsAt: "asc" },
    take: limit,
    include: {
      speakers: { include: { speaker: true } },
    },
  });
}

export async function getNextForUser(
  userId: string,
  editionId: string,
  at = new Date(),
) {
  return prisma.rsvp.findFirst({
    where: {
      userId,
      status: "GOING",
      session: {
        editionId,
        deletedAt: null,
        isPublished: true,
        endsAt: { gt: at },
      },
    },
    orderBy: { session: { startsAt: "asc" } },
    include: { session: true },
  });
}
