import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canHoldAdminRole, isAdminEmail } from "@/lib/auth/roles";
import { Role } from "@prisma/client";
import { sendRegistrationConfirmed } from "@/lib/email/transactions";
import { randomBytes } from "node:crypto";

/**
 * Stub registration confirm — creates Registration if needed and emails conference@.
 * Body: { email, name?, editionSlug? }
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email?: string;
      name?: string;
      editionSlug?: string;
    };
    const email = body.email?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    const edition = await prisma.edition.findFirst({
      where: body.editionSlug
        ? { slug: body.editionSlug }
        : { isCurrent: true },
    });
    if (!edition) {
      return NextResponse.json({ error: "edition not found" }, { status: 404 });
    }

    // Never elevate non-allowlisted emails to ADMIN via this path.
    const existing = await prisma.user.findUnique({ where: { email } });
    let role: Role = existing?.role ?? Role.ATTENDEE;
    if (role === Role.ADMIN && !canHoldAdminRole(email)) {
      role = Role.ATTENDEE;
    }
    if (!existing && isAdminEmail(email)) {
      role = Role.ADMIN;
    }

    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        name: body.name?.trim() || email.split("@")[0] || "Attendee",
        role,
      },
      update: {
        name: body.name?.trim() || undefined,
        // Refuse privilege escalation for non-allowlisted emails
        ...(existing?.role === Role.ADMIN && !canHoldAdminRole(email)
          ? { role: Role.ATTENDEE }
          : {}),
      },
    });

    const ticketCode = `INV-${edition.year}-${randomBytes(3).toString("hex").toUpperCase()}`;
    const qrToken = randomBytes(24).toString("hex");

    const registration = await prisma.registration.upsert({
      where: {
        userId_editionId: { userId: user.id, editionId: edition.id },
      },
      create: {
        userId: user.id,
        editionId: edition.id,
        ticketCode,
        qrToken,
        status: "CONFIRMED",
      },
      update: {},
    });

    const mail = await sendRegistrationConfirmed({
      to: user.email,
      name: user.name,
      editionName: edition.name,
      ticketCode: registration.ticketCode,
      eventDate: edition.startsAt.toISOString().slice(0, 10),
      userId: user.id,
      registrationId: registration.id,
    });

    return NextResponse.json({
      ok: true,
      registrationId: registration.id,
      ticketCode: registration.ticketCode,
      email: mail,
    });
  } catch (err) {
    console.error("[api/registration]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "failed" },
      { status: 500 },
    );
  }
}
