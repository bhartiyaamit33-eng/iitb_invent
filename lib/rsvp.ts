import { RsvpStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/admin/audit";

export async function rsvpToSession(opts: {
  userId: string;
  sessionId: string;
}) {
  const session = await prisma.session_.findFirst({
    where: { id: opts.sessionId, deletedAt: null, isPublished: true },
  });
  if (!session) throw new Error("Session not found");

  const edition = await prisma.edition.findUnique({
    where: { id: session.editionId },
  });
  if (!edition) throw new Error("Edition not found");

  const registration = await prisma.registration.findUnique({
    where: {
      userId_editionId: {
        userId: opts.userId,
        editionId: session.editionId,
      },
    },
  });
  if (!registration || registration.status !== "CONFIRMED") {
    throw new Error("Confirm your edition registration first");
  }

  const existing = await prisma.rsvp.findUnique({
    where: {
      userId_sessionId: {
        userId: opts.userId,
        sessionId: opts.sessionId,
      },
    },
  });
  if (existing && existing.status !== "CANCELLED") {
    return existing;
  }

  const goingCount = await prisma.rsvp.count({
    where: { sessionId: opts.sessionId, status: RsvpStatus.GOING },
  });

  const atCapacity =
    session.capacity != null && goingCount >= session.capacity;

  let status: RsvpStatus = RsvpStatus.GOING;
  let position: number | null = null;

  if (atCapacity) {
    if (!session.waitlistOpen) {
      throw new Error("This session is full");
    }
    status = RsvpStatus.WAITLISTED;
    position =
      (await prisma.rsvp.count({
        where: { sessionId: opts.sessionId, status: RsvpStatus.WAITLISTED },
      })) + 1;
  }

  const rsvp = existing
    ? await prisma.rsvp.update({
        where: { id: existing.id },
        data: { status, position, deletedAt: null },
      })
    : await prisma.rsvp.create({
        data: {
          userId: opts.userId,
          sessionId: opts.sessionId,
          status,
          position,
        },
      });

  await writeAuditLog({
    actorId: opts.userId,
    action: status === "GOING" ? "rsvp.going" : "rsvp.waitlisted",
    entityType: "Rsvp",
    entityId: rsvp.id,
    after: { sessionId: opts.sessionId, status, position },
  });

  return rsvp;
}

export async function cancelRsvp(opts: { userId: string; sessionId: string }) {
  const rsvp = await prisma.rsvp.findUnique({
    where: {
      userId_sessionId: {
        userId: opts.userId,
        sessionId: opts.sessionId,
      },
    },
  });
  if (!rsvp || rsvp.status === "CANCELLED") return rsvp;

  const wasGoing = rsvp.status === "GOING";
  await prisma.rsvp.update({
    where: { id: rsvp.id },
    data: { status: "CANCELLED", position: null },
  });

  if (wasGoing) {
    // Promote earliest waitlisted
    const next = await prisma.rsvp.findFirst({
      where: { sessionId: opts.sessionId, status: "WAITLISTED" },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    });
    if (next) {
      await prisma.rsvp.update({
        where: { id: next.id },
        data: { status: "GOING", position: null },
      });
      // Re-number waitlist
      const waitlisted = await prisma.rsvp.findMany({
        where: { sessionId: opts.sessionId, status: "WAITLISTED" },
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      });
      for (let i = 0; i < waitlisted.length; i++) {
        const row = waitlisted[i]!;
        await prisma.rsvp.update({
          where: { id: row.id },
          data: { position: i + 1 },
        });
      }
    }
  }

  await writeAuditLog({
    actorId: opts.userId,
    action: "rsvp.cancel",
    entityType: "Rsvp",
    entityId: rsvp.id,
  });
}
