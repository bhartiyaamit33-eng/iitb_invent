import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canHoldAdminRole, isAdminEmail } from "@/lib/auth/roles";
import { Role } from "@prisma/client";
import { sendProfileConfirmation } from "@/lib/email/transactions";

/**
 * Stub profile create/update — emails on first meaningful save and on update.
 * Body: { email, name?, headline?, organisation?, bio? }
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email?: string;
      name?: string;
      headline?: string;
      organisation?: string;
      bio?: string;
    };
    const email = body.email?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    let role: Role = existing?.role ?? Role.ATTENDEE;
    if (role === Role.ADMIN && !canHoldAdminRole(email)) role = Role.ATTENDEE;
    if (!existing && isAdminEmail(email)) role = Role.ADMIN;

    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        name: body.name?.trim() || email.split("@")[0] || "Attendee",
        role,
      },
      update: {
        name: body.name?.trim() || undefined,
      },
    });

    const isFirstSave = !existing?.profile;
    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        headline: body.headline ?? null,
        organisation: body.organisation ?? null,
        bio: body.bio ?? null,
        completeness: body.headline || body.organisation || body.bio ? 40 : 10,
      },
      update: {
        headline: body.headline ?? undefined,
        organisation: body.organisation ?? undefined,
        bio: body.bio ?? undefined,
      },
    });

    const mail = await sendProfileConfirmation({
      to: user.email,
      name: user.name,
      isFirstSave,
      userId: user.id,
    });

    return NextResponse.json({
      ok: true,
      profileId: profile.id,
      isFirstSave,
      email: mail,
    });
  } catch (err) {
    console.error("[api/profile]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "failed" },
      { status: 500 },
    );
  }
}
