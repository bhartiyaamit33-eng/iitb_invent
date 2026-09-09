import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { id?: string } | null;
  const id = String(body?.id ?? "").trim();

  if (id) {
    await prisma.userNotification.updateMany({
      where: { id, userId: user.id },
      data: { readAt: new Date() },
    });
  } else {
    await prisma.userNotification.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });
  }

  return NextResponse.json({ ok: true });
}
