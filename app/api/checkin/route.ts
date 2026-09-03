import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { requireOrganiserOrAdmin } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/admin/audit";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  try {
    requireOrganiserOrAdmin(user);
  } catch {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as {
    token?: string;
    mode?: "gate" | "session";
    sessionId?: string;
  };
  const token = body.token?.trim();
  if (!token) {
    return NextResponse.json({ ok: false, message: "Missing token" }, { status: 400 });
  }

  const registration = await prisma.registration.findUnique({
    where: { qrToken: token },
    include: {
      user: { select: { id: true, name: true, email: true, image: true, profile: true } },
      edition: true,
    },
  });

  if (!registration || registration.status !== "CONFIRMED") {
    return NextResponse.json({
      ok: false,
      message: "Unknown or cancelled ticket",
    });
  }

  if (body.mode === "session" && body.sessionId) {
    const rsvp = await prisma.rsvp.findUnique({
      where: {
        userId_sessionId: {
          userId: registration.userId,
          sessionId: body.sessionId,
        },
      },
    });
    if (!rsvp || rsvp.status === "CANCELLED") {
      return NextResponse.json({
        ok: false,
        name: registration.user.name,
        message: "No RSVP for this session",
      });
    }
    if (rsvp.attendedAt) {
      return NextResponse.json({
        ok: true,
        already: true,
        name: registration.user.name,
        message: `Already scanned into session at ${rsvp.attendedAt.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })}`,
      });
    }
    await prisma.rsvp.update({
      where: { id: rsvp.id },
      data: { attendedAt: new Date() },
    });
    await writeAuditLog({
      actorId: user!.id,
      action: "checkin.session",
      entityType: "Rsvp",
      entityId: rsvp.id,
    });
    return NextResponse.json({
      ok: true,
      name: registration.user.name,
      message: "Session attendance recorded",
    });
  }

  if (registration.checkedInAt) {
    return NextResponse.json({
      ok: true,
      already: true,
      name: registration.user.name,
      message: `Already checked in at ${registration.checkedInAt.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })}`,
    });
  }

  await prisma.registration.update({
    where: { id: registration.id },
    data: {
      checkedInAt: new Date(),
      checkedInBy: user!.id,
    },
  });
  await writeAuditLog({
    actorId: user!.id,
    action: "checkin.gate",
    entityType: "Registration",
    entityId: registration.id,
  });

  return NextResponse.json({
    ok: true,
    name: registration.user.name,
    message: `${registration.user.profile?.personaType ?? "Attendee"} · ${registration.ticketCode}`,
  });
}
